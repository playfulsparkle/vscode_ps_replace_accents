import * as fs from "fs";
import * as path from "path";
import { searchAndReplaceCaseSensitive, diacriticRegex } from "./shared";
import { languageCharacterMappings } from "./characterMappings";

/**
 * Dictionary entry interface representing a word and its frequency
 * 
 * @typedef {Object} DictionaryEntry
 * @property {string} word - The word with diacritics
 * @property {number} frequency - Frequency of word usage (higher = more common)
 */
interface DictionaryEntry {
    word: string;
    frequency: number;
}

/**
 * A utility class that restores accent marks and special characters to 
 * normalized text using language-specific dictionaries and frequency-based 
 * matching.
 */
class DiacriticRestorer {
    /**
     * Main dictionary storage mapping base forms to possible diacritic variations
     * 
     * @type {Map<string, DictionaryEntry[]>}
     * @private
     */
    private dictionary: Map<string, DictionaryEntry[]> = new Map();

    /**
     * Set of words to ignore during restoration (in normalized form)
     * 
     * @type {Set<string>}
     * @private
     */
    private ignoredWords: Set<string>;

    /**
     * Currently active language code (e.g., 'hu', 'fr', 'es')
     * 
     * @type {string | undefined}
     * @private
     */
    private currentLanguage: string | undefined;

    /**
     * Indicates whether the dictionary is loaded and ready for use
     * 
     * @type {boolean}
     * @private
     */
    private isReady: boolean = false;

    /**
     * Base file system path where dictionary files are stored
     * 
     * @type {string}
     * @private
     */
    private dictionaryBasePath: string;

    /**
     * LRU cache for restoration results to improve performance
     * 
     * @type {Map<string, string>}
     * @private
     */
    private restorationCache: Map<string, string> = new Map();

    /**
     * Maximum number of entries to store in the restoration cache
     * 
     * @type {number}
     * @private
     * @readonly
     */
    private readonly MAX_CACHE_SIZE = 1000;

    /**
     * Whether to enable suffix matching for inflected word forms
     * 
     * @type {boolean}
     * @private
     */
    private enableSuffixMatching: boolean;

    /**
     * Cached regex pattern for identifying words (including Unicode letters and combining marks)
     * Matches: Unicode letters, combining marks, apostrophes, and hyphens
     * 
     * @type {RegExp}
     * @static
     * @readonly
     */
    private static readonly WORD_REGEX = /[\p{L}\p{M}'\u2019-]+/gu;

    /**
     * Creates a new DiacriticRestorer instance
     * 
     * @param {string} language - Language code for dictionary loading (e.g., 'hu', 'fr')
     * @param {string[]} [ignoredWords=[]] - Array of words to skip during restoration
     * @param {boolean} [enableSuffixMatching=false] - Whether to enable suffix matching for inflected forms
     * 
     * @throws {Error} If language is not provided
     */
    constructor(language: string, ignoredWords: string[] = [], enableSuffixMatching: boolean = false) {
        if (!language) {
            throw new Error("Language parameter is required");
        }

        this.currentLanguage = language;
        this.enableSuffixMatching = enableSuffixMatching;

        // Pre-normalize ignored words once during construction for performance
        this.ignoredWords = new Set(
            ignoredWords.map(word => this.removeDiacritics(word.toLowerCase()))
        );
        this.dictionaryBasePath = path.join(__dirname, "dictionary");
    }

    /**
     * Initializes the diacritic restorer by loading and building the dictionary
     * 
     * @async
     * 
     * @returns {Promise<void>}
     * 
     * @throws {Error} If no language is specified or dictionary file cannot be loaded
     */
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

    /**
     * Reads dictionary file from disk with optimized streaming
     * 
     * @private
     * @param {string} filePath - Path to the dictionary file
     * 
     * @returns {Promise<string>} File contents as string
     * 
     * @throws {Error} If file doesn't exist or cannot be read
     */
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

    /**
     * Builds the in-memory dictionary from CSV data with frequency-based sorting
     * 
     * @private
     * @param {string} csvData - Tab-separated CSV data (word\tfrequency)
     * 
     * @returns {void}
     */
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

                const baseForm = this.removeDiacritics(word.toLowerCase());

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

        console.log(`Loaded ${lineCount} words for language ${this.currentLanguage} (${errorCount} errors)`);
    }

    /**
     * Restores diacritics to normalized text using the loaded dictionary
     * 
     * @param {string} text - Input text with missing diacritics
     * 
     * @returns {string} Text with restored diacritics
     * 
     * @throws {Error} If restorer is not initialized
     */
    restoreDiacritics(text: string): string {
        if (!this.isReady) {
            throw new Error("Accent restorer not initialized. Call initialize() first.");
        }

        // Cache the normalized ignored words check
        return text.replace(DiacriticRestorer.WORD_REGEX, (word) => {
            // Check cache first for performance
            const cached = this.restorationCache.get(word);

            if (cached !== undefined) {
                return cached;
            }

            const baseForm = this.removeDiacritics(word.toLowerCase());

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

    /**
     * Adds an entry to the LRU cache, evicting oldest entry if capacity exceeded
     * 
     * @private
     * @param {string} key - Original word
     * @param {string} value - Restored word
     * 
     * @returns {void}
     */
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

    /**
     * Finds the best dictionary match for a normalized word using frequency ranking
     * 
     * @private
     * @param {string} word - Original word (for case preservation)
     * @param {string} [baseForm] - Pre-computed base form for performance
     * 
     * @returns {string | null} Best matching word with diacritics, or null if no match found
     */
    private findBestMatch(word: string, baseForm?: string): string | null {
        // Accept pre-computed baseForm to avoid redundant normalization
        const normalizedBase = baseForm || this.removeDiacritics(word.toLowerCase());
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
        return searchAndReplaceCaseSensitive(word, bestMatch);
    }

    /**
     * Attempts to match inflected word forms by progressively shortening the stem
     * 
     * @private
     * @param {string} word - Original word
     * @param {string} normalizedBase - Normalized base form
     * @param {number} maxSuffixLen - Maximum suffix length
     * 
     * @returns {string | null} Reconstructed word with diacritics, or null if no match
     */
    private findSuffixMatch(word: string, normalizedBase: string, maxSuffixLen: number = 3): string | null {
        const wordLower = word.toLowerCase();
        const wordLen = normalizedBase.length;

        // Try progressively shorter stems (e.g., "kalacsot" -> "kalacso" -> "kalacs")
        // Minimum stem length is 4 characters OR 60% of original word length (whichever is larger)
        const minStemLen = Math.max(4, Math.floor(wordLen * 0.6));

        for (let stemLen = wordLen - 1; stemLen >= Math.max(minStemLen, wordLen - maxSuffixLen); stemLen--) {
            const stem = normalizedBase.substring(0, stemLen);
            const candidates = this.dictionary.get(stem);

            if (candidates && candidates.length > 0) {
                // Found a stem match - reconstruct with suffix
                const bestStem = candidates[0].word;
                const suffix = wordLower.substring(stemLen);
                const reconstructed = bestStem + suffix;

                return searchAndReplaceCaseSensitive(word, reconstructed);
            }
        }

        return null;
    }

    /**
     * Removes diacritics and normalizes text to base form for dictionary lookup
     * 
     * @private
     * @param {string} text - Input text with potential diacritics
     * 
     * @returns {string} Normalized text without diacritics
     */
    private removeDiacritics(text: string): string {
        if (!text || typeof text !== "string") {
            return text;
        }

        // Get current language mappings
        const currentMappings = this.currentLanguage
            ? languageCharacterMappings.find(lang => lang.language === this.currentLanguage)
            : undefined;

        // Single normalization pass with NFKD for maximum decomposition
        let normalized = text.toLowerCase().normalize("NFKD").replace(diacriticRegex, "");

        // Handle remaining special characters if mappings exist
        if (!currentMappings?.letters.length) {
            return normalized;
        }

        const allMappings = Object.fromEntries(currentMappings.letters.map(o => [o.letter, o.ascii]));

        // Build regex pattern from special characters
        const specialChars = currentMappings.letters.map(o => o.letter).join("");
        const specialCharsPattern = new RegExp(`[${specialChars}]`, "g");

        return normalized.replace(
            specialCharsPattern,
            match => allMappings[match] ?? match
        );
    }

    /**
     * Changes the active language and reloads the appropriate dictionary
     * 
     * @async
     * @param {string} language - New language code
     * 
     * @returns {Promise<void>}
     */
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

    /**
     * Cleans up resources and resets the restorer to uninitialized state
     * 
     * @returns {void}
     */
    dispose(): void {
        this.dictionary.clear();
        this.ignoredWords.clear();
        this.restorationCache.clear();
        this.isReady = false;
        this.currentLanguage = undefined;
    }

    /**
     * Returns memory usage statistics for monitoring and debugging
     * 
     * @returns {string} Formatted string with memory usage information
     */
    getMemoryUsage(): string {
        const entries = Array.from(this.dictionary.values()).reduce((sum, arr) => sum + arr.length, 0);
        const uniqueBaseForms = this.dictionary.size;
        return `Dictionary: ${uniqueBaseForms} base forms, ${entries} total entries, Cache: ${this.restorationCache.size} words, Language: ${this.currentLanguage || "none"}`;
    }

    /**
     * Checks if the restorer is initialized and ready for use
     * 
     * @returns {boolean} True if initialized and ready
     */
    getIsReady(): boolean {
        return this.isReady;
    }

    /**
     * Gets the currently active language code
     * 
     * @returns {string | undefined} Current language or undefined if not set
     */
    getCurrentLanguage(): string | undefined {
        return this.currentLanguage;
    }
}

export default DiacriticRestorer;