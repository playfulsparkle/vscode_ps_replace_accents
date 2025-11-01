import * as fs from "fs";
import * as path from "path";
import { languageSpecificMappings, preserveOriginalCase, diacriticRegex } from "./shared";

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
    private enableSuffixMatching: boolean;

    // Cached regex patterns for better performance
    // Use Unicode property escapes to match all letters and combining marks
    private static readonly WORD_REGEX = /[\p{L}\p{M}'\u2019-]+/gu;

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
        if (this.isReady) {
            return;
        }

        if (!this.currentLanguage) {
            throw new Error("No language specified for initialization");
        }

        const dictionaryFile = path.join(this.dictionaryBasePath, `dict_${this.currentLanguage}.txt`);

        const data = await this.readDictionaryFile(dictionaryFile);
        this.buildDictionary(data);
        this.isReady = true;
    }

    private async readDictionaryFile(filePath: string): Promise<string> {
        return new Promise((resolve, reject) => {
            // Check if file exists first
            fs.access(filePath, fs.constants.F_OK, (accessErr) => {
                if (accessErr) {
                    reject(new Error(`Dictionary file not found: ${filePath}`));
                    return;
                }

                // Use larger buffer for better I/O performance with big files
                const stream = fs.createReadStream(filePath, {
                    encoding: "utf8",
                    highWaterMark: 64 * 1024 // 64KB chunks
                });

                let data = "";
                stream.on("data", (chunk) => { data += chunk; });
                stream.on("end", () => resolve(data));
                stream.on("error", (err) => {
                    reject(new Error(`Error reading dictionary file: ${filePath}. Error: ${err.message}`));
                });
            });
        });
    }

    private buildDictionary(csvData: string): void {
        const lines = csvData.split("\n");
        let lineCount = 0;
        let errorCount = 0;

        for (let i = 1; i < lines.length; i++) { // Skip header
            const line = lines[i].trim();
            if (!line) { continue; }

            const tabIndex = line.indexOf("\t");
            if (tabIndex === -1) {
                errorCount++;
                continue;
            }

            try {
                const word = line.substring(0, tabIndex);
                const frequencyStr = line.substring(tabIndex + 1);

                if (!word || !frequencyStr) {
                    errorCount++;
                    continue;
                }

                const frequency = parseInt(frequencyStr, 10);
                if (isNaN(frequency)) {
                    errorCount++;
                    continue;
                }

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
            } catch (error) {
                errorCount++;
                continue;
            }
        }
        // // Log dictionary entries
        // for (const [key, entries] of this.dictionary.entries()) {
        //     console.log(`Key: ${key}, Entries:`, entries);
        // }
        console.log(`Loaded ${lineCount} words for language ${this.currentLanguage} (${errorCount} errors)`);
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
        return preserveOriginalCase(word, bestMatch);
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

                return preserveOriginalCase(word, reconstructed);
            }
        }

        return null;
    }

    private removeAccents(text: string): string {
        if (!text || typeof text !== "string") {
            return text;
        }

        // Get current language mappings or use empty object
        const allMappings = this.currentLanguage ? languageSpecificMappings[this.currentLanguage] || {} : {};

        // Single normalization pass with NFKD for maximum decomposition
        // Remove diacritics and combining marks using Unicode property
        let normalized = text.toLowerCase().normalize("NFKD").replace(diacriticRegex, "");

        // Handle remaining special characters
        const specialChars = Object.keys(allMappings).join("");
        const specialCharsPattern = new RegExp(`[${specialChars}]`, "g");

        return normalized.replace(
            specialCharsPattern,
            match => allMappings[match]
        );
    }

    async changeLanguage(language: string): Promise<void> {
        if (language === this.currentLanguage && this.isReady) {
            return; // No change needed
        }

        this.dictionary.clear();
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
        return `Dictionary: ${uniqueBaseForms} base forms, ${entries} total entries, Cache: ${this.restorationCache.size} words, Language: ${this.currentLanguage || "none"}`;
    }

    // Utility method to check if initialized
    getIsReady(): boolean {
        return this.isReady;
    }

    // Utility method to get current language
    getCurrentLanguage(): string | undefined {
        return this.currentLanguage;
    }
}

export default AccentRestorer;