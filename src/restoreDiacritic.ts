import * as fs from "fs";
import * as path from "path";
import { searchAndReplaceCaseSensitive, normalizeText } from "./shared";
import { LanguageLetters, languageCharacterMappings } from "./characterMappings";

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
    * Stored as arrays sorted by frequency (descending - most frequent first)
    *
    * @private
    *
    * @type {Map<string, DictionaryEntry[]>}
    */
    private dictionary: Map<string, DictionaryEntry[]> = new Map();

    /**
    * Language-specific character mappings for the currently active language
    *
    * Contains the complete set of special characters and their ASCII equivalents
    * for the current language. This is used to handle language-specific diacritics
    * and special characters that aren't covered by standard Unicode normalization.
    *
    * @private
    *
    * @type {LanguageLetters | undefined}
    */
    private currentMappings: LanguageLetters | undefined;

    /**
    * Set of words to ignore during restoration (in normalized form)
    *
    * @private
    *
    * @type {Set<string>}
    */
    private ignoredWords: Set<string>;

    /**
    * Currently active language code (e.g., 'hu', 'fr', 'es')
    *
    * @private
    *
    * @type {string | undefined}
    */
    private currentLanguage: string | undefined;

    /**
    * Indicates whether the dictionary is loaded and ready for use
    *
    * @private
    *
    * @type {boolean}
    */
    private isReady: boolean = false;

    /**
    * Base file system path where dictionary files are stored
    *
    * @private
    *
    * @type {string}
    */
    private dictionaryBasePath: string;

    /**
    * LRU cache for restoration results to improve performance
    *
    * @private
    *
    * @type {Map<string, string>}
    */
    private restorationCache: Map<string, string> = new Map();

    /**
    * Maximum number of entries to store in the restoration cache
    *
    * @private
    * @readonly
    *
    * @type {number}
    */
    private readonly MAX_CACHE_SIZE = 1000;

    /**
    * Whether to enable suffix matching for inflected word forms
    *
    * @private
    *
    * @type {boolean}
    */
    private enableSuffixMatching: boolean;

    /**
    * Minimum stem length for suffix matching (default: 2)
    *
    * @private
    *
    * @type {number}
    */
    private minSuffixStemLength: number;

    /**
    * Cached regex pattern for identifying words (including Unicode letters and combining marks)
    * Matches: Unicode letters, combining marks, apostrophes, and hyphens
    *
    * @static
    * @readonly
    *
    * @type {RegExp}
    */
    private static readonly WORD_REGEX = /[\p{L}\p{M}'\u2019-]+/gu;

    /**
    * Creates a new DiacriticRestorer instance
    *
    * @param {string} language - Language code for dictionary loading (e.g., 'hu', 'fr')
    * @param {string[]} [ignoredWords=[]] - Array of words to skip during restoration
    * @param {boolean} [enableSuffixMatching=false] - Whether to enable suffix matching for inflected forms
    * @param {number} [minSuffixStemLength=2] - Minimum stem length for suffix matching
    *
    * @throws {Error} If language is not provided
    */
    constructor(
        language: string | undefined,
        ignoredWords: string[] = [],
        enableSuffixMatching: boolean = false,
        minSuffixStemLength: number = 2
    ) {
        this.currentLanguage = language;
        this.enableSuffixMatching = enableSuffixMatching;
        this.minSuffixStemLength = minSuffixStemLength;
        this.currentMappings = language
            ? languageCharacterMappings.find(lang => lang.language === language)
            : undefined;

        // Pre-normalize ignored words once during construction for performance
        this.ignoredWords = new Set(
            ignoredWords.map(word => this.removeDiacritics(word.toLowerCase()))
        );
        this.dictionaryBasePath = path.join(__dirname, "dictionary");
    }

    /**
    * Generates character mappings for diacritic restoration operations
    *
    * Provides bidirectional mapping capabilities between diacritic characters and their
    * ASCII equivalents. When `reversed` is false, returns mappings from diacritic characters
    * to ASCII equivalents (used for normalization). When `reversed` is true, returns mappings
    * from ASCII sequences to diacritic characters (used for restoration and case alignment).
    *
    * @private
    *
    * @param {boolean} [reversed=false] - When true, returns reverse mappings (ASCII → diacritic)
    *                                     When false, returns normal mappings (diacritic → ASCII)
    * @returns {{[key: string]: string}} Object containing character mappings
    *
    * @example
    * // Normal mappings for normalization:
    * // { 'á': 'a', 'é': 'e', 'ø': 'oe', 'æ': 'ae' }
    * const normalMappings = getAllMappings();
    *
    * @example
    * // Reverse mappings for restoration:
    * // { 'a': 'á', 'e': 'é', 'oe': 'ø', 'ae': 'æ' }
    * const reverseMappings = getAllMappings(true);
    *
    * @see {@link removeDiacritics} - Uses normal mappings
    * @see {@link searchAndReplaceCaseSensitive} - Uses reverse mappings
    */
    private getAllMappings(reversed: boolean = false): { [key: string]: string } {
        if (!this.currentMappings) {
            return {};
        }

        return Object.fromEntries(
            this.currentMappings.letters.map(o => reversed ? [o.ascii, o.letter] : [o.letter, o.ascii])
        );
    }

    /**
    * Gets the special characters pattern computed from currentMappings
    * Computed on demand to save memory
    *
    * @private
    */
    private getSpecialCharsPattern(): RegExp | undefined {
        if (!this.currentMappings?.letters.length) {
            return undefined;
        }

        const specialChars = this.currentMappings.letters
            .map(o => o.letter)
            .map(char => char)
            .join("");

        return new RegExp(`[${specialChars}]`, "gu");
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

        if (this.currentLanguage) {
            const dictionaryFile = path.join(this.dictionaryBasePath, `dict_${this.currentLanguage}.txt`);

            const data = await this.readDictionaryFile(dictionaryFile);

            this.buildDictionary(data);
        }

        this.isReady = true;
    }

    /**
    * Reads dictionary file from disk with optimized streaming
    *
    * @private
    *
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
    * Uses optimized insertion sort for memory efficiency
    *
    * @private
    *
    * @param {string} csvData - Tab-separated CSV data (word\tfrequency)
    *
    * @returns {void}
    */
    private buildDictionary(csvData: string): void {
        const lines = csvData.split("\n");
        let lineCount = 0;
        let errorCount = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            if (!line) {
                continue;
            }

            const tabIndex = line.indexOf("\t");

            if (tabIndex === -1) {
                errorCount++;

                continue;
            }

            const wordRaw = line.substring(0, tabIndex);
            const frequencyRaw = line.substring(tabIndex + 1);

            const word = wordRaw.trim().toLowerCase();
            const frequency = parseInt(frequencyRaw.trim(), 10);

            if (isNaN(frequency) || frequency <= 0 || frequency > Number.MAX_SAFE_INTEGER) {
                errorCount++;

                continue;
            }

            if (!word) {
                errorCount++;

                continue;
            }

            const baseForm = this.removeDiacritics(word);

            // Get or create entries array
            let entries = this.dictionary.get(baseForm);

            if (!entries) {
                entries = [];

                this.dictionary.set(baseForm, entries);
            }

            const entry: DictionaryEntry = { word, frequency };

            // Binary search for insertion point
            // We want entries sorted by DESCENDING frequency (highest first)
            let left = 0;
            let right = entries.length;

            while (left < right) {
                const mid = (left + right) >>> 1; // Unsigned right shift for floor division

                if (entries[mid].frequency >= frequency) {
                    left = mid + 1;
                } else {
                    right = mid;
                }
            }

            entries.splice(left, 0, entry);

            lineCount++;
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

            const lowerWord = word.toLowerCase();
            const baseForm = this.removeDiacritics(lowerWord);

            // Check if word should be ignored
            if (this.ignoredWords.has(baseForm)) {
                this.addToCache(word, word);
                return word;
            }

            // Try to find best match
            const restored = this.findBestMatch(word, lowerWord, baseForm);
            const result = restored || word;

            this.addToCache(word, result);

            return result;
        });
    }

    /**
    * Adds an entry to the LRU cache, evicting oldest entry if capacity exceeded
    *
    * @private
    *
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
    *
    * @param {string} word - Original word (for case preservation)
    * @param {string} lowerWord - Pre-computed lowercase version
    * @param {string} baseForm - Pre-computed normalized base form
    *
    * @returns {string | null} Best matching word with diacritics, or null if no match found
    */
    private findBestMatch(word: string, lowerWord: string, baseForm: string): string | null {
        const candidates = this.dictionary.get(baseForm);
        // console.log(word, lowerWord, candidates);
        if (!candidates || candidates.length === 0) {
            if (this.enableSuffixMatching) {
                return this.findSuffixMatch(word, lowerWord, baseForm);
            }
            return null;
        }

        const bestMatch = candidates[0].word;
        const mappings = this.getAllMappings(true);

        return searchAndReplaceCaseSensitive(word, bestMatch, mappings);
    }

    /**
    * Attempts to match inflected word forms by progressively shortening the stem
    *
    * Optimized to check larger stems first (more likely to match)
    *
    *
    *
    * @param {string} word - Original word
    * @param {string} lowerWord - Pre-computed lowercase version
    * @param {string} normalizedBase - Normalized base form
    *
    * @returns {string | null} Reconstructed word with diacritics, or null if no match
    */
    private findSuffixMatch(word: string, lowerWord: string, normalizedBase: string): string | null {
        const wordLen = normalizedBase.length;

        const mappings = this.getAllMappings(true);

        // Calculate minimum stem length: user-defined minimum OR 60% of word length (whichever is larger)
        const minStemLen = Math.max(this.minSuffixStemLength, Math.floor(wordLen * 0.6));

        // Try progressively shorter stems, starting from full word - 1
        for (let stemLen = wordLen - 1; stemLen >= minStemLen; stemLen--) {
            const stem = normalizedBase.substring(0, stemLen);
            const candidates = this.dictionary.get(stem);

            if (candidates && candidates.length > 0) {
                // Found a stem match - use most frequent candidate (first in array)
                const bestStem = candidates[0].word;
                const suffix = lowerWord.substring(stemLen);
                const reconstructed = bestStem + suffix;

                return searchAndReplaceCaseSensitive(word, reconstructed, mappings);
            }
        }

        return null;
    }

    /**
    * Removes diacritics and normalizes text to base form for dictionary lookup
    *
    * Optimized for performance with minimal string operations
    *
    * @private
    *
    * @param {string} text - Input text with potential diacritics
    *
    * @returns {string} Normalized text without diacritics
    */
    private removeDiacritics(text: string): string {
        if (!text || typeof text !== "string") {
            return text;
        }

        const allMappings = this.getAllMappings();

        if (Object.keys(allMappings).length === 0) {
            return normalizeText(text);
        }

        // Handle remaining special characters if mappings exist
        const specialCharsPattern: RegExp | undefined = this.getSpecialCharsPattern();

        if (!specialCharsPattern) {
            return normalizeText(text);
        }

        let result = text.replace(
            specialCharsPattern,
            match => allMappings[match] ?? match
        );

        return normalizeText(result);
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
        this.currentMappings = undefined;
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