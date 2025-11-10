const fs = require("fs");
const readline = require("readline");
const path = require("path");

/**
 * Language-specific character mappings for diacritic filtering
 */
const languageCharacterMappings = {
  czech: new Set(["á", "Á", "č", "Č", "ď", "Ď", "é", "É", "ě", "Ě", "í", "Í", "ň", "Ň", "ó", "Ó", "ř", "Ř", "š", "Š", "ť", "Ť", "ú", "Ú", "ů", "Ů", "ý", "Ý", "ž", "Ž", "ľ", "Ľ", "ĺ", "Ĺ", "ŕ", "Ŕ", "ô", "Ô"]),
  danish: new Set(["æ", "Æ", "ø", "Ø", "å", "Å", "é", "É", "ö", "Ö", "ü", "Ü"]),
  french: new Set(["à", "À", "â", "Â", "ä", "Ä", "æ", "Æ", "ç", "Ç", "é", "É", "è", "È", "ê", "Ê", "ë", "Ë", "ï", "Ï", "î", "Î", "ô", "Ô", "ö", "Ö", "œ", "Œ", "ù", "Ù", "û", "Û", "ü", "Ü", "ÿ", "Ÿ", "á", "Á", "ì", "Ì", "í", "Í", "ò", "Ò", "ó", "Ó"]),
  german: new Set(["ä", "Ä", "ö", "Ö", "ü", "Ü", "ß", "ẞ", "é", "É", "è", "È", "á", "Á", "à", "À", "ô", "Ô"]),
  hungarian: new Set(["á", "Á", "é", "É", "í", "Í", "ó", "Ó", "ö", "Ö", "ő", "Ő", "ú", "Ú", "ü", "Ü", "ű", "Ű"]),
  polish: new Set(["ą", "Ą", "ć", "Ć", "ę", "Ę", "ł", "Ł", "ń", "Ń", "ó", "Ó", "ś", "Ś", "ź", "Ź", "ż", "Ż", "é", "É", "ü", "Ü"]),
  slovak: new Set(["á", "Á", "ä", "Ä", "č", "Č", "ď", "Ď", "é", "É", "í", "Í", "ľ", "Ľ", "ĺ", "Ĺ", "ň", "Ň", "ó", "Ó", "ô", "Ô", "ŕ", "Ŕ", "š", "Š", "ť", "Ť", "ú", "Ú", "ý", "Ý", "ž", "Ž"]),
  spanish: new Set(["á", "Á", "é", "É", "í", "Í", "ó", "Ó", "ú", "Ú", "ü", "Ü", "ñ", "Ñ", "à", "À", "è", "È", "ì", "Ì", "ò", "Ò", "ù", "Ù"]),
  swedish: new Set(["å", "Å", "ä", "Ä", "ö", "Ö", "é", "É", "è", "È", "ü", "Ü", "á", "Á", "à", "À"]),
  portuguese: new Set(["á", "Á", "â", "Â", "ã", "Ã", "à", "À", "é", "É", "ê", "Ê", "í", "Í", "ó", "Ó", "ô", "Ô", "õ", "Õ", "ú", "Ú", "ç", "Ç", "ü", "Ü"]),
  italian: new Set(["à", "À", "è", "È", "é", "É", "ì", "Ì", "ò", "Ò", "ó", "Ó", "ù", "Ù", "ú", "Ú", "â", "Â", "ê", "Ê", "î", "Î", "ô", "Ô", "û", "Û"]),
  norwegian: new Set(["æ", "Æ", "ø", "Ø", "å", "Å", "é", "É", "è", "È", "ê", "Ê", "ó", "Ó", "ò", "Ò", "ô", "Ô", "á", "Á", "ü", "Ü"]),
  icelandic: new Set(["á", "Á", "é", "É", "í", "Í", "ó", "Ó", "ú", "Ú", "ý", "Ý", "ð", "Ð", "þ", "Þ", "æ", "Æ", "ö", "Ö"]),
  dutch: new Set(["á", "Á", "é", "É", "ë", "Ë", "í", "Í", "ï", "Ï", "ó", "Ó", "ö", "Ö", "ú", "Ú", "ü", "Ü", "è", "È", "à", "À", "ê", "Ê", "û", "Û", "ô", "Ô", "ç", "Ç"]),
  croatian: new Set(["č", "Č", "ć", "Ć", "đ", "Đ", "š", "Š", "ž", "Ž", "á", "Á", "é", "É", "í", "Í", "ó", "Ó", "ú", "Ú"]),
  slovenian: new Set(["č", "Č", "š", "Š", "ž", "Ž", "á", "Á", "é", "É", "í", "Í", "ó", "Ó", "ú", "Ú"]),
  romanian: new Set(["ă", "Ă", "â", "Â", "î", "Î", "ș", "Ș", "ţ", "Ţ", "ț", "Ț", "á", "Á", "é", "É", "í", "Í", "ó", "Ó", "ú", "Ú"]),
  lithuanian: new Set(["ą", "Ą", "č", "Č", "ę", "Ę", "ė", "Ė", "į", "Į", "š", "Š", "ų", "Ų", "ū", "Ū", "ž", "Ž"]),
  latvian: new Set(["ā", "Ā", "č", "Č", "ē", "Ē", "ģ", "Ģ", "ī", "Ī", "ķ", "Ķ", "ļ", "Ļ", "ņ", "Ņ", "š", "Š", "ū", "Ū", "ž", "Ž"])
};

/**
 * Manages dictionary files for diacritic restoration, including creation,
 * updating, normalization, and statistical analysis of word frequency data.
 * 
 * Handles text processing, word extraction, frequency counting, and dictionary
 * file operations in TSV (Tab-Separated Values) format.
 */
class DictionaryManager {
    /**
     * Creates a new DictionaryManager instance
     * 
     * @param {string} [dictionaryPath="./dictionary"] - Base directory path for dictionary files
     * @constructor
     */
    constructor(dictionaryPath = "./dictionary") {
        /**
         * Base directory path where dictionary files are stored
         * @type {string}
         * @public
         */
        this.dictionaryPath = dictionaryPath;
    }

    /**
     * Validates if a language is supported
     * 
     * @param {string} language - Language name to validate
     * @returns {boolean} True if language is supported
     */
    isValidLanguage(language) {
        return languageCharacterMappings.hasOwnProperty(language.toLowerCase());
    }

    /**
     * Gets available languages
     * 
     * @returns {string[]} Array of supported language names
     */
    getAvailableLanguages() {
        return Object.keys(languageCharacterMappings);
    }

    /**
     * Checks if a word contains language-specific diacritics
     * 
     * @param {string} word - The word to check
     * @param {string} language - The target language
     * @returns {boolean} True if word contains diacritics from the specified language
     */
    containsLanguageDiacritics(word, language) {
        if (!language) {
            return this.containsNonASCII(word);
        }

        const languageChars = languageCharacterMappings[language.toLowerCase()];
        if (!languageChars) {
            throw new Error(`Unsupported language: ${language}. Available: ${this.getAvailableLanguages().join(", ")}`);
        }

        for (let i = 0; i < word.length; i++) {
            if (languageChars.has(word[i])) {
                return true;
            }
        }
        return false;
    }

    /**
     * Processes a text file to extract words, normalize them, count frequencies,
     * and update an existing dictionary with new word data
     * 
     * @param {string} textFilePath - Path to the source text file to process
     * @param {string} dictionaryName - Name of the target dictionary file
     * @param {string} [language] - Optional language filter for diacritics
     * 
     * @returns {Promise<void>}
     * 
     * @throws {Error} If file reading, processing, or writing fails
     */
    async updateDictionaryFromFile(textFilePath, dictionaryName, language = null) {
        try {
            if (language && !this.isValidLanguage(language)) {
                throw new Error(`Unsupported language: ${language}. Available: ${this.getAvailableLanguages().join(", ")}`);
            }

            const text = await this.readFile(textFilePath);
            const wordFrequencies = this.extractWordFrequencies(text, language);

            const dictFilePath = this.resolveDictionaryPath(dictionaryName);
            const existingDict = await this.readDictionary(dictFilePath);

            // Track statistics
            let newCount = 0;
            const existingNormalized = new Set(
                existingDict.map(entry => this.normalizeWord(entry.word))
            );

            const updatedDict = this.mergeDictionaries(existingDict, wordFrequencies, language);

            // Count what's actually new
            for (const [normalizedWord] of wordFrequencies) {
                if (!existingNormalized.has(normalizedWord)) {
                    newCount++;
                }
            }

            await this.writeDictionary(dictFilePath, updatedDict, language);

            const langInfo = language ? ` (${language})` : "";
            console.log(`Updated dictionary${langInfo} with ${newCount} new words, total: ${updatedDict.size}`);

        } catch (error) {
            throw new Error(`Failed to update dictionary: ${error.message}`);
        }
    }

    /**
     * Normalizes a dictionary by merging entries with the same normalized form
     * 
     * Combines duplicate entries that represent the same word in different
     * diacritic forms, summing their frequencies for accurate representation
     * 
     * @param {string} dictionaryName - Name of the dictionary file to normalize
     * @param {string} [language] - Optional language filter for diacritics
     * 
     * @returns {Promise<void>}
     * 
     * @throws {Error} If dictionary reading or writing fails
     */
    async normalizeDictionary(dictionaryName, language = null) {
        try {
            if (language && !this.isValidLanguage(language)) {
                throw new Error(`Unsupported language: ${language}. Available: ${this.getAvailableLanguages().join(", ")}`);
            }

            const dictFilePath = this.resolveDictionaryPath(dictionaryName);
            const dictionary = await this.readDictionary(dictFilePath);

            const originalSize = dictionary.length;

            if (originalSize === 0) {
                console.log("Dictionary is empty");
                return;
            }

            const normalizedDict = new Map();
            let mergeCount = 0;
            let filteredCount = 0;

            for (const entry of dictionary) {
                // Filter by language if specified
                if (language && !this.containsLanguageDiacritics(entry.word, language)) {
                    filteredCount++;
                    continue;
                }

                const normalizedWord = this.normalizeWord(entry.word);

                if (normalizedDict.has(normalizedWord)) {
                    const existing = normalizedDict.get(normalizedWord);
                    existing.frequency += entry.frequency;
                    mergeCount++;
                } else {
                    normalizedDict.set(normalizedWord, {
                        word: entry.word,
                        frequency: entry.frequency
                    });
                }
            }

            await this.writeDictionary(dictFilePath, normalizedDict, language);

            const langInfo = language ? ` (${language})` : "";
            console.log(`Normalized${langInfo}: ${originalSize} to ${normalizedDict.size} entries, merged ${mergeCount}, filtered ${filteredCount}`);

        } catch (error) {
            throw new Error(`Failed to normalize dictionary: ${error.message}`);
        }
    }

    /**
     * Determines if a word contains non-ASCII characters that require diacritic processing
     * 
     * Identifies words containing accented letters and special characters
     * that are outside the basic ASCII range (character code > 127)
     * 
     * @param {string} word - The word to check for non-ASCII characters
     * 
     * @returns {boolean} True if word contains non-ASCII characters, false otherwise
     */
    containsNonASCII(word) {
        if (word.length === 0) {
            return false;
        }

        // Check if word contains any non-ASCII characters
        for (let i = 0; i < word.length; i++) {
            if (word.charCodeAt(i) > 127) {
                return true;  // Word HAS special chars
            }
        }
        return false;  // Word is ASCII-only
    }

    /**
     * Resolves the full file system path for a dictionary file
     * 
     * Handles both relative paths (within dictionary directory) and
     * absolute paths (full file system paths)
     * 
     * @param {string} dictionaryName - Dictionary name or full path
     * 
     * @returns {string} Full resolved file system path
     */
    resolveDictionaryPath(dictionaryName) {
        if (path.isAbsolute(dictionaryName) || dictionaryName.includes(path.sep)) {
            return dictionaryName;
        }
        return path.join(this.dictionaryPath, dictionaryName);
    }

    /**
     * Extracts words from text and calculates their frequencies with normalization
     * 
     * Processes text to identify words containing non-ASCII characters,
     * normalizes them by removing diacritics, and counts occurrences
     * 
     * @param {string} text - Input text to process
     * @param {string} [language] - Optional language filter for diacritics
     * 
     * @returns {Map<string, {word: string, frequency: number}>} Map of normalized words to frequency data
     */
    extractWordFrequencies(text, language = null) {
        const frequencies = new Map();
        const words = text.match(/[\p{L}\p{M}][\p{L}\p{M}'\u2018\u2019]*/gu) || [];

        for (const word of words) {
            // Skip words that don't contain language-specific diacritics
            if (language) {
                if (!this.containsLanguageDiacritics(word, language)) {
                    continue;
                }
            } else {
                if (!this.containsNonASCII(word)) {
                    continue;
                }
            }

            const normalizedWord = this.normalizeWord(word);
            const lowerOriginal = word.toLowerCase();

            if (frequencies.has(normalizedWord)) {
                frequencies.get(normalizedWord).frequency++;
            } else {
                frequencies.set(normalizedWord, {
                    word: lowerOriginal,
                    frequency: 1
                });
            }
        }

        return frequencies;
    }

    /**
     * Normalizes a word by removing diacritics and converting to lowercase
     * 
     * Uses Unicode normalization (NFD) to decompose characters and removes
     * combining diacritical marks
     * 
     * @param {string} word - Word to normalize
     * 
     * @returns {string} Normalized word without diacritics in lowercase
     */
    normalizeWord(word) {
        return word.normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();
    }

    /**
     * Reads and parses a dictionary file into an array of word entries
     * 
     * Processes TSV (Tab-Separated Values) format files where each line
     * contains: word[tab]frequency
     * 
     * @param {string} filePath - Path to the dictionary file
     * 
     * @returns {Promise<Array<{word: string, frequency: number}>>} Array of dictionary entries
     * 
     * @throws {Error} If file format is invalid (except for non-existent files)
     */
    async readDictionary(filePath) {
        const dictionary = [];

        try {
            const content = await this.readFile(filePath);

            const lines = content.split(/(\r?\n|\r)/);

            for (const line of lines) {
                const trimmed = line.trim();

                if (!trimmed) {
                    continue;
                }

                const tabIndex = line.indexOf("\t");

                if (tabIndex === -1) {
                    continue;
                }

                const wordRaw = line.substring(0, tabIndex);
                const frequencyRaw = line.substring(tabIndex + 1);

                const word = wordRaw.trim().toLowerCase();
                const frequency = parseInt(frequencyRaw.trim(), 10);

                if (isNaN(frequency) || frequency <= 0 || frequency > Number.MAX_SAFE_INTEGER) {
                    continue;
                }

                if (!word) {
                    continue;
                }

                dictionary.push({ word, frequency });
            }
        } catch (error) {
            if (error.code !== "ENOENT") {
                throw error;
            }
        }

        return dictionary;
    }

    /**
     * Writes dictionary data to a file in TSV format
     * 
     * Creates directories if needed, filters words by language if specified, and sorts
     * entries by frequency (descending) then alphabetically
     * 
     * @param {string} filePath - Output file path
     * @param {Map|Array} dictionary - Dictionary data to write
     * @param {string} [language] - Optional language filter for diacritics
     * 
     * @returns {Promise<number>} Number of entries written
     * 
     * @throws {Error} If file writing fails
     */
    async writeDictionary(filePath, dictionary, language = null) {
        const dir = path.dirname(filePath);
        await fs.promises.mkdir(dir, { recursive: true });

        // Convert Map to array if needed and filter entries
        const entries = dictionary instanceof Map ?
            Array.from(dictionary.values()) :
            dictionary;

        const filteredEntries = entries
            .filter(entry => {
                if (language) {
                    return this.containsLanguageDiacritics(entry.word, language);
                } else {
                    return this.containsNonASCII(entry.word);
                }
            })
            .sort((a, b) => {
                if (b.frequency !== a.frequency) {
                    return b.frequency - a.frequency;
                }
                return a.word.localeCompare(b.word);
            });

        const lines = filteredEntries.map(entry => `${entry.word}\t${entry.frequency}`);
        await fs.promises.writeFile(filePath, lines.join("\n") + "\n", "utf8");

        return filteredEntries.length;
    }

    /**
     * Merges two dictionaries, summing frequencies for identical normalized words
     * 
     * Combines existing dictionary data with new entries, properly
     * aggregating frequencies when the same word appears in both sources
     * 
     * @param {Array} existing - Existing dictionary entries array
     * @param {Map} newEntries - New word entries map from extraction
     * @param {string} [language] - Optional language filter for diacritics
     * 
     * @returns {Map<string, {word: string, frequency: number}>} Merged dictionary data
     */
    mergeDictionaries(existing, newEntries, language = null) {
        const merged = new Map();

        // Convert existing array to Map keyed by normalized word
        for (const entry of existing) {
            // Filter by language if specified
            if (language && !this.containsLanguageDiacritics(entry.word, language)) {
                continue;
            }

            const normalizedWord = this.normalizeWord(entry.word);

            if (merged.has(normalizedWord)) {
                // Sum frequencies if same normalized word exists
                const existingEntry = merged.get(normalizedWord);
                existingEntry.frequency += entry.frequency;
            } else {
                merged.set(normalizedWord, {
                    word: entry.word,
                    frequency: entry.frequency
                });
            }
        }

        // Merge new entries
        for (const [normalizedWord, newEntry] of newEntries) {
            // Language filtering already done in extractWordFrequencies
            if (merged.has(normalizedWord)) {
                const existingEntry = merged.get(normalizedWord);
                existingEntry.frequency += newEntry.frequency;
            } else {
                merged.set(normalizedWord, { ...newEntry });
            }
        }

        return merged;
    }

    /**
     * Utility function to read file contents with Promise interface
     * 
     * @param {string} filePath - Path to file to read
     * 
     * @returns {Promise<string>} File contents as string
     * 
     * @throws {Error} If file reading fails
     */
    readFile(filePath) {
        return new Promise((resolve, reject) => {
            fs.readFile(filePath, "utf8", (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }

    /**
     * Retrieves statistical information about a dictionary
     * 
     * @param {string} dictionaryName - Name of the dictionary to analyze
     * 
     * @returns {Promise<{totalWords: number, totalFrequency: number}>} Dictionary statistics
     * 
     * @throws {Error} If dictionary cannot be read
     */
    async getDictionaryStats(dictionaryName) {
        const dictFilePath = this.resolveDictionaryPath(dictionaryName);
        const dict = await this.readDictionary(dictFilePath);
        const totalFrequency = dict.reduce((sum, entry) => sum + entry.frequency, 0);

        return {
            totalWords: dict.length,
            totalFrequency
        };
    }

    /**
     * Creates a new dictionary from a text file source
     * 
     * Extracts words with non-ASCII characters and their frequencies,
     * then writes them to a new dictionary file
     * 
     * @param {string} textFilePath - Source text file path
     * @param {string} dictionaryName - Name for the new dictionary
     * @param {string} [language] - Optional language filter for diacritics
     * 
     * @returns {Promise<void>}
     * 
     * @throws {Error} If file processing or writing fails
     */
    async createDictionaryFromFile(textFilePath, dictionaryName, language = null) {
        if (language && !this.isValidLanguage(language)) {
            throw new Error(`Unsupported language: ${language}. Available: ${this.getAvailableLanguages().join(", ")}`);
        }

        const text = await this.readFile(textFilePath);
        const wordFrequencies = this.extractWordFrequencies(text, language);

        const dictFilePath = this.resolveDictionaryPath(dictionaryName);
        const entriesWritten = await this.writeDictionary(dictFilePath, wordFrequencies, language);

        const langInfo = language ? ` (${language})` : "";
        console.log(`Created dictionary${langInfo} with ${entriesWritten} words`);
    }
}

/**
 * Command-line interface for DictionaryManager operations
 * 
 * Provides command-line access to dictionary management functionality
 * for scripting and batch processing operations
 * 
 * @async
 * 
 * @returns {Promise<void>}
 * 
 * @example
 * ```bash
 * # Update existing dictionary with language filter
 * node dictionary-manager.js update novel.txt french --language french
 * 
 * # Create new dictionary for Hungarian
 * node dictionary-manager.js create book.txt hungarian --language hungarian
 * 
 * # Normalize dictionary with language filter
 * node dictionary-manager.js normalize german --language german
 * 
 * # Get statistics
 * node dictionary-manager.js stats french
 * 
 * # Custom dictionary path
 * node dictionary-manager.js update text.txt english --language english --path /custom/path
 * 
 * # List available languages
 * node dictionary-manager.js languages
 * ```
 */
async function main() {
    const args = process.argv.slice(2);
    const manager = new DictionaryManager();

    if (args.length < 1) {
        console.log(`
Dictionary Manager

Usage:
  node dictionary-manager.js update <text-file> <dictionary-name> [--language <lang>]
  node dictionary-manager.js normalize <dictionary-name> [--language <lang>]
  node dictionary-manager.js stats <dictionary-name>
  node dictionary-manager.js create <text-file> <dictionary-name> [--language <lang>]
  node dictionary-manager.js languages

Options:
  --language <lang>     Filter words by language-specific diacritics
  --path <directory>    Set custom dictionary path

Available languages: ${manager.getAvailableLanguages().join(", ")}
        `);
        return;
    }

    // Parse language option
    let language = null;
    let languageIndex = args.indexOf("--language");
    if (languageIndex !== -1 && args[languageIndex + 1]) {
        language = args[languageIndex + 1].toLowerCase();
        args.splice(languageIndex, 2);
    }

    // Parse path option
    let pathIndex = args.indexOf("--path");
    if (pathIndex !== -1 && args[pathIndex + 1]) {
        manager.dictionaryPath = args[pathIndex + 1];
        args.splice(pathIndex, 2);
    }

    const command = args[0];
    const param1 = args[1];
    const param2 = args[2];

    try {
        switch (command) {
            case "languages":
                console.log("Available languages:");
                manager.getAvailableLanguages().forEach(lang => {
                    const chars = Array.from(languageCharacterMappings[lang]).slice(0, 10).join(", ");
                    console.log(`  ${lang}: ${chars}...`);
                });
                break;

            case "update":
                if (!param1 || !param2) {
                    console.error("Error: update command requires text file and dictionary name");
                    process.exit(1);
                }
                await manager.updateDictionaryFromFile(param1, param2, language);
                break;

            case "normalize":
                if (!param1) {
                    console.error("Error: normalize command requires dictionary name");
                    process.exit(1);
                }
                await manager.normalizeDictionary(param1, language);
                break;

            case "stats":
                if (!param1) {
                    console.error("Error: stats command requires dictionary name");
                    process.exit(1);
                }
                const stats = await manager.getDictionaryStats(param1);
                console.log(`Dictionary: ${stats.totalWords} words, ${stats.totalFrequency} total occurrences`);
                break;

            case "create":
                if (!param1 || !param2) {
                    console.error("Error: create command requires text file and dictionary name");
                    process.exit(1);
                }
                await manager.createDictionaryFromFile(param1, param2, language);
                break;

            default:
                console.error("Unknown command. Use: update, normalize, create, stats, or languages");
                process.exit(1);
        }
    } catch (error) {
        console.error("Error:", error.message);
        process.exit(1);
    }
}

// Execute main function if script is run directly
if (require.main === module) {
    main();
}

module.exports = DictionaryManager;