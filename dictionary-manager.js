const fs = require("fs");
const path = require("path");

class DictionaryManager {
    constructor(dictionaryPath = "./dictionary") {
        this.dictionaryPath = dictionaryPath;
    }

    /**
     * Process a text file, extract words, normalize them, count frequencies, and update dictionary
     */
    async updateDictionaryFromFile(textFilePath, dictionaryName) {
        try {
            const text = await this.readFile(textFilePath);
            const wordFrequencies = this.extractWordFrequencies(text);
            
            const dictFilePath = this.resolveDictionaryPath(dictionaryName);
            const existingDict = await this.readDictionary(dictFilePath);
            
            const updatedDict = this.mergeDictionaries(existingDict, wordFrequencies);
            await this.writeDictionary(dictFilePath, updatedDict);
            
            console.log(`✅ Updated dictionary with ${wordFrequencies.size} new words, total: ${updatedDict.size}`);
            
        } catch (error) {
            throw new Error(`Failed to update dictionary: ${error.message}`);
        }
    }

    /**
     * Normalize dictionary by merging entries with same normalized form
     */
    async normalizeDictionary(dictionaryName) {
        try {
            const dictFilePath = this.resolveDictionaryPath(dictionaryName);
            const dictionary = await this.readDictionary(dictFilePath);
            
            if (dictionary.size === 0) {
                console.log("Dictionary is empty");
                return;
            }
            
            const normalizedDict = new Map();
            let mergeCount = 0;
            let removedCount = 0;
            
            for (const [word, entry] of dictionary) {
                // Skip single characters
                if (word.length < 2) {
                    removedCount++;
                    continue;
                }
                
                // Skip words that don't need restoration (ASCII-only)
                if (!this.needsRestoration(word)) {
                    removedCount++;
                    continue;
                }
                
                const normalizedWord = this.normalizeWord(word);
                
                if (normalizedDict.has(normalizedWord)) {
                    const existing = normalizedDict.get(normalizedWord);
                    existing.frequency += entry.frequency;
                    mergeCount++;
                } else {
                    // Always store the lowercase version
                    normalizedDict.set(normalizedWord, {
                        word: entry.word.toLowerCase(),
                        frequency: entry.frequency
                    });
                }
            }
            
            await this.writeDictionary(dictFilePath, normalizedDict);
            
            console.log(`✅ Normalized: ${dictionary.size} → ${normalizedDict.size} entries, merged ${mergeCount}, removed ${removedCount}`);
            
        } catch (error) {
            throw new Error(`Failed to normalize dictionary: ${error.message}`);
        }
    }

    /**
     * Check if a word needs restoration (contains non-ASCII characters)
     * This includes accented letters (é, á), special characters (ø, æ, å, ß, ł), etc.
     */
    needsRestoration(word) {
        // Check if word contains any non-ASCII characters (code > 127)
        // This covers: é, á, ø, æ, å, ß, ł, ñ, ü, ő, etc.
        for (let i = 0; i < word.length; i++) {
            if (word.charCodeAt(i) > 127) {
                return true;
            }
        }
        return false;
    }

    /**
     * Resolve dictionary path - handle both relative and absolute paths
     */
    resolveDictionaryPath(dictionaryName) {
        if (path.isAbsolute(dictionaryName) || dictionaryName.includes(path.sep)) {
            return dictionaryName;
        }
        return path.join(this.dictionaryPath, dictionaryName);
    }

    /**
     * Extract words from text and count frequencies with normalization
     */
    extractWordFrequencies(text) {
        const frequencies = new Map();
        const words = text.match(/[\p{L}\p{M}][\p{L}\p{M}'\u2019\u0027-]*/gu) || [];

        for (const word of words) {
            // Skip single characters
            if (word.length < 2) continue;
            
            // Skip words that don't need restoration (ASCII-only)
            if (!this.needsRestoration(word)) continue;
            
            const normalizedWord = this.normalizeWord(word);
            const lowerOriginal = word.toLowerCase(); // Always store lowercase
           
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
     * Normalize word: remove accents and convert to lowercase
     */
    normalizeWord(word) {
        return word.normalize("NFD")
                  .replace(/[\u0300-\u036f]/g, "")
                  .toLowerCase();
    }

    /**
     * Read dictionary file and parse entries
     */
    async readDictionary(filePath) {
        const dictionary = new Map();
        
        try {
            const content = await this.readFile(filePath);
            const lines = content.split(/\r?\n/);
            
            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || trimmed.startsWith("#")) continue;
                
                const parts = trimmed.split(/\t+/);
                if (parts.length < 2) continue;
                
                const word = parts[0].trim().toLowerCase(); // Always read as lowercase
                const frequency = parseInt(parts[1].trim(), 10);
                
                if (word && !isNaN(frequency)) {
                    dictionary.set(word, { word, frequency });
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
     * Write dictionary to file in TSV format - always lowercase
     */
    async writeDictionary(filePath, dictionary) {
        const dir = path.dirname(filePath);
        await fs.promises.mkdir(dir, { recursive: true });
        
        // Filter out single characters and ASCII-only words before writing
        const filteredEntries = Array.from(dictionary.values())
            .filter(entry => entry.word.length >= 2 && this.needsRestoration(entry.word))
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
     * Merge two dictionaries, summing frequencies for same words
     */
    mergeDictionaries(existing, newEntries) {
        const merged = new Map(existing);
        
        for (const [normalizedWord, newEntry] of newEntries) {
            // Skip single characters and ASCII-only words
            if (newEntry.word.length < 2 || !this.needsRestoration(newEntry.word)) {
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
     * Utility function to read file
     */
    readFile(filePath) {
        return new Promise((resolve, reject) => {
            fs.readFile(filePath, "utf8", (err, data) => {
                if (err) reject(err);
                else resolve(data);
            });
        });
    }

    /**
     * Get dictionary statistics
     */
    async getDictionaryStats(dictionaryName) {
        const dictFilePath = this.resolveDictionaryPath(dictionaryName);
        const dict = await this.readDictionary(dictFilePath);
        const totalFrequency = Array.from(dict.values()).reduce((sum, entry) => sum + entry.frequency, 0);
        
        return {
            totalWords: dict.size,
            totalFrequency
        };
    }

    /**
     * Create a new dictionary from text file
     */
    async createDictionaryFromFile(textFilePath, dictionaryName) {
        const text = await this.readFile(textFilePath);
        const wordFrequencies = this.extractWordFrequencies(text);
        
        const dictFilePath = this.resolveDictionaryPath(dictionaryName);
        const entriesWritten = await this.writeDictionary(dictFilePath, wordFrequencies);
        
        console.log(`✅ Created dictionary with ${entriesWritten} words (non-ASCII only)`);
    }

    /**
     * Clean dictionary - remove single characters and ASCII-only words
     */
    async cleanDictionary(dictionaryName) {
        try {
            const dictFilePath = this.resolveDictionaryPath(dictionaryName);
            const dictionary = await this.readDictionary(dictFilePath);
            
            if (dictionary.size === 0) {
                console.log("Dictionary is empty");
                return;
            }
            
            const cleanedDict = new Map();
            let removedCount = 0;
            
            for (const [word, entry] of dictionary) {
                // Keep only words with 2+ characters and non-ASCII characters
                if (word.length >= 2 && this.needsRestoration(word)) {
                    cleanedDict.set(word, entry);
                } else {
                    removedCount++;
                }
            }
            
            await this.writeDictionary(dictFilePath, cleanedDict);
            
            console.log(`✅ Cleaned dictionary: ${dictionary.size} → ${cleanedDict.size} entries, removed ${removedCount}`);
            
        } catch (error) {
            throw new Error(`Failed to clean dictionary: ${error.message}`);
        }
    }
}

// Command-line interface
async function main() {
    const args = process.argv.slice(2);
    const manager = new DictionaryManager();
    
    if (args.length < 1) {
        console.log(`
Dictionary Manager

Usage:
  node dictionary-manager.js update <text-file> <dictionary-name>
  node dictionary-manager.js normalize <dictionary-name>
  node dictionary-manager.js clean <dictionary-name>
  node dictionary-manager.js stats <dictionary-name>
  node dictionary-manager.js create <text-file> <dictionary-name>

Examples:
  node dictionary-manager.js update mybook.txt slovak_dict.txt
  node dictionary-manager.js normalize dict_slovak.txt
  node dictionary-manager.js clean dict_slovak.txt
  node dictionary-manager.js create large_text.txt new_dict.txt

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
                
            case "clean":
                if (!param1) {
                    console.error("Error: clean command requires dictionary name");
                    process.exit(1);
                }
                await manager.cleanDictionary(param1);
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

if (require.main === module) {
    main();
}

module.exports = DictionaryManager;