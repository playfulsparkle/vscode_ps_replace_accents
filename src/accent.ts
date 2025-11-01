import * as fs from "fs";
import * as path from "path";

interface DictionaryEntry {
    word: string;
    frequency: number;
}

class AccentRestorer {
    private dictionary: Map<string, DictionaryEntry[]> = new Map();
    private ignoredWords: Set<string>;
    private currentLanguage: string | undefined;
    private isReady: boolean = false;
    private dictionaryBasePath: string;

    // LRU cache for restoration results
    private restorationCache: Map<string, string> = new Map();
    private readonly MAX_CACHE_SIZE = 1000;
    private enableSuffixMatching: boolean = false;

    // Cached regex patterns for better performance
    private static readonly WORD_REGEX = /[\w\u00C0-\u017F]+/g;
    private static readonly DIACRITIC_REGEX = /[\u0300-\u036f]/g;

    constructor(language: string, ignoredWords: string[] = [], enableSuffixMatching: boolean = false) {
        this.currentLanguage = language;
        this.enableSuffixMatching = enableSuffixMatching;
        // Pre-normalize ignored words once during construction
        this.ignoredWords = new Set(
            ignoredWords.map(word => this.removeAccents(word.toLowerCase()))
        );
        this.dictionaryBasePath = path.join(__dirname, "dictionary");
    }

    async initialize(): Promise<void> {
        if (this.isReady) { return; }

        const dictionaryFile = path.join(this.dictionaryBasePath, `dict_${this.currentLanguage}.txt`);
        const data = await this.readDictionaryFile(dictionaryFile);
        this.buildDictionary(data);
        this.isReady = true;
    }

    private readDictionaryFile(filePath: string): Promise<string> {
        return new Promise((resolve, reject) => {
            // Use larger buffer for better I/O performance with big files
            const stream = fs.createReadStream(filePath, {
                encoding: "utf8",
                highWaterMark: 64 * 1024 // 64KB chunks
            });

            let data = "";
            stream.on("data", (chunk) => { data += chunk; });
            stream.on("end", () => resolve(data));
            stream.on("error", (err) => {
                reject(new Error(`Dictionary file not found: ${filePath}. Error: ${err.message}`));
            });
        });
    }

    private buildDictionary(csvData: string): void {
        const lines = csvData.split("\n");
        let lineCount = 0;

        for (let i = 1; i < lines.length; i++) { // Skip header
            const line = lines[i].trim();
            if (!line) { continue; }

            const tabIndex = line.indexOf("\t");
            if (tabIndex === -1) { continue; }

            // Avoid split() - more efficient for tab-separated values
            const word = line.substring(0, tabIndex);
            const frequencyStr = line.substring(tabIndex + 1);

            if (!word || !frequencyStr) { continue; }

            const frequency = parseInt(frequencyStr, 10);
            if (isNaN(frequency)) { continue; }

            const baseForm = this.removeAccents(word.toLowerCase());

            // Get or create entries array
            let entries = this.dictionary.get(baseForm);
            if (!entries) {
                entries = [];
                this.dictionary.set(baseForm, entries);
            }

            const entry = { word, frequency };

            // Binary search for insertion point (more efficient for large arrays)
            let left = 0;
            let right = entries.length;

            while (left < right) {
                const mid = (left + right) >>> 1; // Unsigned right shift for floor division
                if (entries[mid].frequency > frequency) {
                    left = mid + 1;
                } else {
                    right = mid;
                }
            }

            entries.splice(left, 0, entry);
            lineCount++;
        }

        console.log(`Loaded ${lineCount} words for language ${this.currentLanguage}`);
    }

    restoreAccents(text: string): string {
        if (!this.isReady) {
            throw new Error("Accent restorer not initialized. Call initialize() first.");
        }

        // Cache the normalized ignored words check
        return text.replace(AccentRestorer.WORD_REGEX, (word) => {
            // Check cache first
            const cached = this.restorationCache.get(word);
            if (cached !== undefined) {
                return cached;
            }

            const baseForm = this.removeAccents(word.toLowerCase());

            if (this.ignoredWords.has(baseForm)) {
                this.addToCache(word, word);
                return word;
            }

            const restored = this.findBestMatch(word, baseForm);
            const result = restored || word;

            this.addToCache(word, result);
            return result;
        });
    }

    private addToCache(key: string, value: string): void {
        // Simple LRU: if cache is full, delete the first (oldest) entry
        if (this.restorationCache.size >= this.MAX_CACHE_SIZE) {
            const firstKey = this.restorationCache.keys().next().value;
            if (firstKey) {
                this.restorationCache.delete(firstKey);
            }
        }
        this.restorationCache.set(key, value);
    }

    private findBestMatch(word: string, baseForm?: string): string | null {
        // Accept pre-computed baseForm to avoid redundant normalization
        const normalizedBase = baseForm || this.removeAccents(word.toLowerCase());
        const candidates = this.dictionary.get(normalizedBase);

        if (!candidates || candidates.length === 0) {
            // Try suffix matching for inflected forms (only if enabled)
            if (this.enableSuffixMatching) {
                return this.findSuffixMatch(word, normalizedBase);
            }
            return null;
        }

        // Return the most frequent candidate (already sorted in buildDictionary)
        const bestMatch = candidates[0].word;
        return this.preserveOriginalCase(word, bestMatch);
    }

    private findSuffixMatch(word: string, normalizedBase: string): string | null {
        const wordLower = word.toLowerCase();
        const wordLen = normalizedBase.length;

        // Try progressively shorter stems (e.g., "kalacsot" -> "kalacso" -> "kalacs")
        // Minimum stem length is 4 characters OR 60% of original word length (whichever is larger)
        // Maximum suffix length is 3 characters
        const minStemLen = Math.max(4, Math.floor(wordLen * 0.6));
        const maxSuffixLen = 3;

        for (let stemLen = wordLen - 1; stemLen >= Math.max(minStemLen, wordLen - maxSuffixLen); stemLen--) {
            const stem = normalizedBase.substring(0, stemLen);
            const candidates = this.dictionary.get(stem);

            if (candidates && candidates.length > 0) {
                // Found a stem match - reconstruct with suffix
                const bestStem = candidates[0].word;
                const suffix = wordLower.substring(stemLen);
                const reconstructed = bestStem + suffix;

                return this.preserveOriginalCase(word, reconstructed);
            }
        }

        return null;
    }

    private removeAccents(text: string): string {
        // NFD normalization followed by diacritic removal
        return text.normalize("NFD")
            .replace(AccentRestorer.DIACRITIC_REGEX, "")
            .toLowerCase();
    }

    private preserveOriginalCase(original: string, restored: string): string {
        const origLen = original.length;
        const restLen = restored.length;

        // Fast path: all uppercase
        if (original === original.toUpperCase()) {
            return restored.toUpperCase();
        }

        // Fast path: title case
        if (origLen > 0 &&
            original[0] === original[0].toUpperCase() &&
            original.slice(1) === original.slice(1).toLowerCase()) {
            return restored[0].toUpperCase() + restored.slice(1).toLowerCase();
        }

        // Character-by-character case preservation
        let result = "";
        const minLength = Math.min(origLen, restLen);

        for (let i = 0; i < minLength; i++) {
            const origChar = original[i];
            result += origChar === origChar.toUpperCase()
                ? restored[i].toUpperCase()
                : restored[i].toLowerCase();
        }

        // Handle remaining characters if restored is longer
        if (restLen > minLength) {
            const lastCharIsUpper = origLen > 0 &&
                original[origLen - 1] === original[origLen - 1].toUpperCase();

            for (let i = minLength; i < restLen; i++) {
                result += lastCharIsUpper
                    ? restored[i].toUpperCase()
                    : restored[i].toLowerCase();
            }
        }

        return result;
    }

    async changeLanguage(language: string): Promise<void> {
        this.dictionary.clear();
        this.ignoredWords.clear();
        this.restorationCache.clear();
        this.currentLanguage = language;
        this.isReady = false;
        await this.initialize();
    }

    // Memory optimization: clear dictionary when not needed
    dispose(): void {
        this.dictionary.clear();
        this.ignoredWords.clear();
        this.restorationCache.clear();
        this.isReady = false;
        this.currentLanguage = undefined;
    }

    getMemoryUsage(): string {
        const entries = Array.from(this.dictionary.values()).reduce((sum, arr) => sum + arr.length, 0);
        const uniqueBaseForms = this.dictionary.size;
        return `Dictionary: ${uniqueBaseForms} base forms, ${entries} total entries, Cache: ${this.restorationCache.size} words, Language: ${this.currentLanguage}`;
    }
}

export default AccentRestorer;