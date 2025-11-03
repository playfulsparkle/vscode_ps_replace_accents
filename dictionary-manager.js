const fs = require("fs");
const path = require("path");

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
     * Processes a text file to extract words, normalize them, count frequencies,
     * and update an existing dictionary with new word data
     * 
     * @param {string} textFilePath - Path to the source text file to process
     * @param {string} dictionaryName - Name of the target dictionary file
     * 
     * @returns {Promise<void>}
     * 
     * @throws {Error} If file reading, processing, or writing fails
     */
    async updateDictionaryFromFile(textFilePath, dictionaryName) {
        try {
            const text = await this.readFile(textFilePath);
            const wordFrequencies = this.extractWordFrequencies(text);

            const dictFilePath = this.resolveDictionaryPath(dictionaryName);
            const existingDict = await this.readDictionary(dictFilePath);

            const updatedDict = this.mergeDictionaries(existingDict, wordFrequencies);

            await this.writeDictionary(dictFilePath, updatedDict);

            console.log(`Updated dictionary with ${wordFrequencies.size} new words, total: ${updatedDict.size}`);

        } catch (error) {
            console.error(error);
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
     * 
     * @returns {Promise<void>}
     * 
     * @throws {Error} If dictionary reading or writing fails
     */
    async normalizeDictionary(dictionaryName) {
        try {
            const dictFilePath = this.resolveDictionaryPath(dictionaryName);
            const dictionary = await this.readDictionary(dictFilePath);

            const originalSize = dictionary.length;

            if (originalSize === 0) {
                console.log("Dictionary is empty");
                return;
            }

            const normalizedDict = new Map();
            let mergeCount = 0;

            for (const entry of dictionary) {
                const normalizedWord = this.normalizeWord(entry.word);

                if (normalizedDict.has(normalizedWord)) {
                    const existing = normalizedDict.get(normalizedWord);
                    existing.frequency += entry.frequency;
                    mergeCount++;
                } else {
                    normalizedDict.set(normalizedWord, {
                        word: entry.word, // Keep the original word with accents
                        frequency: entry.frequency
                    });
                }
            }

            await this.writeDictionary(dictFilePath, normalizedDict);

            console.log(`Normalized: ${originalSize} to ${normalizedDict.size} entries, merged ${mergeCount}`);

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
     * 
     * @returns {Map<string, {word: string, frequency: number}>} Map of normalized words to frequency data
     */
    extractWordFrequencies(text) {
        const frequencies = new Map();
        const words = text.match(/[\p{L}\p{M}][\p{L}\p{M}'\u2019\-]*/gu) || [];

        for (const word of words) {
            // Skip words that don't contain non-ASCII characters
            if (!this.containsNonASCII(word)) continue;

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
            const DATA_COLUMN_SIZE = 2;
            const content = await this.readFile(filePath);
            const lines = content.split(/\r?\n/);

            for (const line of lines) {
                const trimmed = line.trim();

                if (!trimmed || trimmed.startsWith("#")) {
                    continue;
                }

                const parts = trimmed.split(/\t+/);

                if (parts.length < DATA_COLUMN_SIZE) {
                    continue;
                }

                const word = parts[0].trim().toLowerCase();
                const frequency = parseInt(parts[1].trim(), 10);

                if (word && !isNaN(frequency)) {
                    dictionary.push({ word, frequency });
                }
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
     * Creates directories if needed, filters ASCII-only words, and sorts
     * entries by frequency (descending) then alphabetically
     * 
     * @param {string} filePath - Output file path
     * @param {Map|Array} dictionary - Dictionary data to write
     * 
     * @returns {Promise<number>} Number of entries written
     * 
     * @throws {Error} If file writing fails
     */
    async writeDictionary(filePath, dictionary) {
        const dir = path.dirname(filePath);
        await fs.promises.mkdir(dir, { recursive: true });

        // Convert Map to array if needed and filter entries
        const entries = dictionary instanceof Map ?
            Array.from(dictionary.values()) :
            dictionary;

        const filteredEntries = entries
            .filter(entry => this.containsNonASCII(entry.word))
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
     * 
     * @returns {Map<string, {word: string, frequency: number}>} Merged dictionary data
     */
    mergeDictionaries(existing, newEntries) {
        const merged = new Map();

        // Convert existing array to Map keyed by normalized word
        for (const entry of existing) {
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
            if (!this.containsNonASCII(newEntry.word)) {
                continue;
            }

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
     * 
     * @returns {Promise<void>}
     * 
     * @throws {Error} If file processing or writing fails
     */
    async createDictionaryFromFile(textFilePath, dictionaryName) {
        const text = await this.readFile(textFilePath);
        const wordFrequencies = this.extractWordFrequencies(text);

        const dictFilePath = this.resolveDictionaryPath(dictionaryName);
        const entriesWritten = await this.writeDictionary(dictFilePath, wordFrequencies);

        console.log(`Created dictionary with ${entriesWritten} words (non-ASCII only)`);
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
 * # Update existing dictionary
 * node dictionary-manager.js update novel.txt french
 * 
 * # Create new dictionary
 * node dictionary-manager.js create book.txt spanish
 * 
 * # Normalize dictionary
 * node dictionary-manager.js normalize german
 * 
 * # Get statistics
 * node dictionary-manager.js stats french
 * 
 * # Custom dictionary path
 * node dictionary-manager.js update text.txt english --path /custom/path
 * ```
 */
async function main() {
    const args = process.argv.slice(2);
    const manager = new DictionaryManager();

    if (args.length < 1) {
        console.log(`
Dictionary Manager

Usage:
  node dictionary-manager.js update <text-file> <dictionary-name>
  node dictionary-manager.js normalize <dictionary-name>
  node dictionary-manager.js stats <dictionary-name>
  node dictionary-manager.js create <text-file> <dictionary-name>

Options:
  --path <directory>    Set custom dictionary path
        `);
        return;
    }

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
            case "update":
                if (!param1 || !param2) {
                    console.error("Error: update command requires text file and dictionary name");

                    process.exit(1);
                }

                await manager.updateDictionaryFromFile(param1, param2);
                break;

            case "normalize":
                if (!param1) {
                    console.error("Error: normalize command requires dictionary name");

                    process.exit(1);
                }

                await manager.normalizeDictionary(param1);
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

                await manager.createDictionaryFromFile(param1, param2);
                break;

            default:
                console.error("Unknown command. Use: update, normalize, clean, create, or stats");

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