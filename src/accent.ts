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

    constructor(language: string, ignoredWords: string[] = []) {
        this.currentLanguage = language;
        this.ignoredWords = new Set(ignoredWords.map(word => word.toLowerCase()));
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
            fs.readFile(filePath, "utf8", (err, data) => {
                if (err) {
                    reject(new Error(`Dictionary file not found: ${filePath}. Error: ${err.message}`));
                } else {
                    resolve(data);
                }
            });
        });
    }

    private buildDictionary(csvData: string): void {
        const lines = csvData.split("\n");
        let lineCount = 0;

        for (let i = 1; i < lines.length; i++) { // Skip header
            const line = lines[i].trim();
            if (!line) { continue; }

            const [word, frequencyStr] = line.split("\t");
            if (!word || !frequencyStr) { continue; }

            const frequency = parseInt(frequencyStr, 10);
            if (isNaN(frequency)) { continue; }

            const baseForm = this.removeAccents(word.toLowerCase());

            if (!this.dictionary.has(baseForm)) {
                this.dictionary.set(baseForm, []);
            }

            const entries = this.dictionary.get(baseForm)!;
            const entry = { word, frequency };

            // Find the correct position to insert (descending order by frequency)
            let insertIndex = 0;
            while (insertIndex < entries.length && entries[insertIndex].frequency > frequency) {
                insertIndex++;
            }

            entries.splice(insertIndex, 0, entry);
            lineCount++;
        }
        console.log(`Loaded ${lineCount} words for language ${this.currentLanguage}`);
    }

    restoreAccents(text: string): string {
        if (!this.isReady) {
            throw new Error("Accent restorer not initialized. Call initialize() first.");
        }

        // Use word boundary regex that handles Unicode characters properly
        return text.replace(/[\w\u00C0-\u017F]+/g, (word) => {
            if (this.ignoredWords.has(word.toLowerCase())) {
                return word;
            }

            const restored = this.findBestMatch(word);
            return restored || word;
        });
    }

    private findBestMatch(word: string): string | null {
        const baseForm = this.removeAccents(word.toLowerCase());
        const candidates = this.dictionary.get(baseForm);

        if (!candidates || candidates.length === 0) {
            return null;
        }

        // Return the most frequent candidate
        const bestMatch = candidates[0].word;
        return this.preserveOriginalCase(word, bestMatch);
    }

    private removeAccents(text: string): string {
        return text.normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();
    }

    private preserveOriginalCase(original: string, restored: string): string {
        // All uppercase
        if (original === original.toUpperCase()) {
            return restored.toUpperCase();
        }

        // Title case (first letter uppercase, rest lowercase)
        if (original === original[0].toUpperCase() + original.slice(1).toLowerCase()) {
            return restored[0].toUpperCase() + restored.slice(1).toLowerCase();
        }

        // Mixed case - preserve original case pattern
        let result = "";
        const minLength = Math.min(original.length, restored.length);

        for (let i = 0; i < minLength; i++) {
            if (original[i] === original[i].toUpperCase()) {
                result += restored[i].toUpperCase();
            } else {
                result += restored[i].toLowerCase();
            }
        }

        // Add remaining characters if restored word is longer
        if (restored.length > minLength) {
            // Continue the case pattern from the last character
            const lastCharCase = original[original.length - 1] === original[original.length - 1].toUpperCase()
                ? "upper" : "lower";

            for (let i = minLength; i < restored.length; i++) {
                result += lastCharCase === "upper"
                    ? restored[i].toUpperCase()
                    : restored[i].toLowerCase();
            }
        }

        return result;
    }

    async changeLanguage(language: string): Promise<void> {
        this.dictionary.clear();
        this.ignoredWords.clear();
        this.currentLanguage = language;
        this.isReady = false;
        await this.initialize();
    }

    // Memory optimization: clear dictionary when not needed
    dispose(): void {
        this.dictionary.clear();
        this.ignoredWords.clear();
        this.isReady = false;
        this.currentLanguage = undefined;
    }

    getMemoryUsage(): string {
        const entries = Array.from(this.dictionary.values()).reduce((sum, arr) => sum + arr.length, 0);
        const uniqueBaseForms = this.dictionary.size;
        return `Dictionary: ${uniqueBaseForms} base forms, ${entries} total entries, Language: ${this.currentLanguage}`;
    }
}

export default AccentRestorer;