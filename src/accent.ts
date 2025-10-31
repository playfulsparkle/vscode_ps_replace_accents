/**
 * Advanced Accent Restoration System
 * Supports: Czech, Slovak, Hungarian, German, Polish
 * Features: Language detection, case preservation, partial matching, memory efficiency
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type Language = "cs" | "sk" | "hu" | "de" | "pl";

interface LanguageSignature {
    uniqueChars: Set<string>;
    commonBigrams: Map<string, number>;
    commonTrigrams: Map<string, number>;
    commonWords: Set<string>;
    bigramWeight: number;
    trigramWeight: number;
    wordWeight: number;
}

interface TrieNode {
    children: Map<string, TrieNode>;
    accented: string | null;
    isEnd: boolean;
}

interface DictionaryData {
    trie: TrieNode;
    frequency: Map<string, number>;
    lastAccess: number;
}

interface RestoreOptions {
    language?: Language;
    confidenceThreshold?: number;
    enablePartialMatch?: boolean;
    enableCache?: boolean;
}

interface DetectionResult {
    language: Language;
    confidence: number;
    scores: Map<Language, number>;
}

// ============================================================================
// LANGUAGE SIGNATURES FOR DETECTION
// ============================================================================

const LANGUAGE_SIGNATURES: Map<Language, LanguageSignature> = new Map([
    ["cs", {
        uniqueChars: new Set(["ř", "ě", "ů", "ň", "č", "š", "ž", "ý", "á", "í", "é"]),
        commonBigrams: new Map([
            ["st", 15], ["ov", 12], ["pr", 11], ["po", 10], ["je", 10],
            ["na", 9], ["te", 9], ["to", 8], ["ní", 8], ["ch", 8]
        ]),
        commonTrigrams: new Map([
            ["pro", 20], ["ova", 18], ["ení", 16], ["ost", 15], ["ter", 14],
            ["sta", 13], ["pře", 12], ["pod", 11], ["kte", 10]
        ]),
        commonWords: new Set(["je", "se", "na", "do", "to", "za", "pro", "ale", "jak", "který"]),
        bigramWeight: 0.3,
        trigramWeight: 0.4,
        wordWeight: 0.3
    }],
    ["sk", {
        uniqueChars: new Set(["ľ", "ŕ", "ô", "ň", "č", "š", "ž", "ý", "á", "í", "é", "ú", "ä"]),
        commonBigrams: new Map([
            ["st", 14], ["ov", 11], ["pr", 10], ["po", 10], ["na", 9],
            ["ro", 9], ["ko", 8], ["je", 8], ["to", 8], ["ct", 7]
        ]),
        commonTrigrams: new Map([
            ["ova", 18], ["ost", 16], ["pro", 15], ["ter", 14], ["sta", 13],
            ["pos", 12], ["kto", 11], ["pre", 10]
        ]),
        commonWords: new Set(["je", "sa", "na", "do", "za", "pre", "ale", "ako", "ktorý", "tento"]),
        bigramWeight: 0.3,
        trigramWeight: 0.4,
        wordWeight: 0.3
    }],
    ["hu", {
        uniqueChars: new Set(["ő", "ű", "á", "é", "í", "ó", "ö", "ü", "ú"]),
        commonBigrams: new Map([
            ["sz", 18], ["et", 15], ["en", 14], ["tt", 13], ["gy", 12],
            ["ny", 11], ["al", 10], ["el", 10], ["te", 9], ["ek", 9]
        ]),
        commonTrigrams: new Map([
            ["ett", 20], ["tte", 18], ["sze", 17], ["ben", 16], ["nek", 15],
            ["ség", 14], ["tás", 13], ["len", 12]
        ]),
        commonWords: new Set(["és", "az", "egy", "van", "hogy", "nem", "volt", "lesz", "még", "csak"]),
        bigramWeight: 0.35,
        trigramWeight: 0.35,
        wordWeight: 0.3
    }],
    ["de", {
        uniqueChars: new Set(["ä", "ö", "ü", "ß"]),
        commonBigrams: new Map([
            ["en", 20], ["er", 18], ["ch", 16], ["te", 14], ["nd", 13],
            ["ie", 12], ["ge", 11], ["st", 10], ["be", 9], ["un", 9]
        ]),
        commonTrigrams: new Map([
            ["ein", 22], ["ich", 20], ["den", 18], ["und", 17], ["die", 16],
            ["sch", 15], ["der", 14], ["gen", 13]
        ]),
        commonWords: new Set(["der", "die", "das", "und", "ist", "ein", "nicht", "mit", "auch", "für"]),
        bigramWeight: 0.3,
        trigramWeight: 0.35,
        wordWeight: 0.35
    }],
    ["pl", {
        uniqueChars: new Set(["ą", "ć", "ę", "ł", "ń", "ó", "ś", "ź", "ż"]),
        commonBigrams: new Map([
            ["cz", 18], ["sz", 17], ["rz", 16], ["dz", 14], ["ow", 13],
            ["st", 12], ["ie", 11], ["na", 10], ["po", 10], ["pr", 9]
        ]),
        commonTrigrams: new Map([
            ["nie", 20], ["prz", 18], ["owi", 17], ["sto", 16], ["wie", 15],
            ["szy", 14], ["sta", 13], ["pod", 12]
        ]),
        commonWords: new Set(["się", "nie", "jest", "być", "lub", "jak", "dla", "tak", "tylko", "może"]),
        bigramWeight: 0.35,
        trigramWeight: 0.35,
        wordWeight: 0.3
    }]
]);

// ============================================================================
// COMPRESSED DICTIONARY STORAGE
// ============================================================================

class CompressedDictionary {
    private dictionaries: Map<Language, DictionaryData> = new Map();
    private cache: Map<string, string> = new Map();
    private cacheSize = 1000;
    private maxLoadedDicts = 3;

    /**
     * Create a Trie node
     */
    private createNode(): TrieNode {
        return {
            children: new Map(),
            accented: null,
            isEnd: false
        };
    }

    /**
     * Insert word pair into Trie
     */
    private insertWord(root: TrieNode, unaccented: string, accented: string): void {
        let node = root;
        const normalized = unaccented.toLowerCase();

        for (const char of normalized) {
            if (!node.children.has(char)) {
                node.children.set(char, this.createNode());
            }
            node = node.children.get(char)!;
        }

        node.isEnd = true;
        node.accented = accented;
    }

    /**
     * Search for word in Trie (exact match)
     */
    private searchExact(root: TrieNode, word: string): string | null {
        let node = root;
        const normalized = word.toLowerCase();

        for (const char of normalized) {
            if (!node.children.has(char)) {
                return null;
            }
            node = node.children.get(char)!;
        }

        return node.isEnd ? node.accented : null;
    }

    /**
     * Find longest matching prefix in Trie
     */
    private searchLongestPrefix(root: TrieNode, word: string): { match: string; length: number } | null {
        let node = root;
        const normalized = word.toLowerCase();
        let longestMatch: string | null = null;
        let longestLength = 0;

        for (let i = 0; i < normalized.length; i++) {
            const char = normalized[i];
            if (!node.children.has(char)) {
                break;
            }
            node = node.children.get(char)!;

            if (node.isEnd && node.accented) {
                longestMatch = node.accented;
                longestLength = i + 1;
            }
        }

        return longestMatch ? { match: longestMatch, length: longestLength } : null;
    }

    /**
     * Load language dictionary
     */
    loadDictionary(language: Language, wordPairs: Array<[string, string]>): void {
        // Manage memory: unload least recently used if limit reached
        if (this.dictionaries.size >= this.maxLoadedDicts) {
            this.unloadLeastRecentlyUsed();
        }

        const root = this.createNode();
        const frequency = new Map<string, number>();

        for (const [unaccented, accented] of wordPairs) {
            this.insertWord(root, unaccented, accented);
            frequency.set(unaccented.toLowerCase(), (frequency.get(unaccented.toLowerCase()) || 0) + 1);
        }

        this.dictionaries.set(language, {
            trie: root,
            frequency,
            lastAccess: Date.now()
        });
    }

    /**
     * Unload least recently used dictionary
     */
    private unloadLeastRecentlyUsed(): void {
        let oldestLang: Language | null = null;
        let oldestTime = Infinity;

        for (const [lang, data] of this.dictionaries.entries()) {
            if (data.lastAccess < oldestTime) {
                oldestTime = data.lastAccess;
                oldestLang = lang;
            }
        }

        if (oldestLang) {
            this.dictionaries.delete(oldestLang);
        }
    }

    /**
     * Lookup word with optional partial matching
     */
    lookup(word: string, language: Language, enablePartialMatch: boolean = true): string | null {
        const cacheKey = `${language}:${word}:${enablePartialMatch}`;

        // Check cache
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey)!;
        }

        const dictData = this.dictionaries.get(language);
        if (!dictData) { return null; }

        // Update access time
        dictData.lastAccess = Date.now();

        // Try exact match first
        let result = this.searchExact(dictData.trie, word);

        // Try partial match if enabled and exact match failed
        if (!result && enablePartialMatch) {
            const prefixMatch = this.searchLongestPrefix(dictData.trie, word);
            if (prefixMatch && prefixMatch.length >= 4) { // Minimum 4 chars for partial match
                result = prefixMatch.match;
            }
        }

        // Update cache
        if (result) {
            if (this.cache.size >= this.cacheSize) {
                // Simple FIFO cache eviction
                const firstKey = this.cache.keys().next().value;
                if (firstKey) {
                    this.cache.delete(firstKey);
                }
            }
            this.cache.set(cacheKey, result);
        }

        return result;
    }

    /**
     * Check if dictionary is loaded
     */
    isLoaded(language: Language): boolean {
        return this.dictionaries.has(language);
    }

    /**
     * Clear cache
     */
    clearCache(): void {
        this.cache.clear();
    }
}

// ============================================================================
// LANGUAGE DETECTOR
// ============================================================================

class LanguageDetector {
    /**
     * Extract bigrams from text
     */
    private extractBigrams(text: string): Map<string, number> {
        const bigrams = new Map<string, number>();
        const normalized = text.toLowerCase().replace(/[^a-zäöüßáéíóúýčďěňřšťžąćęłńóśźżőűàèìòù]/g, "");

        for (let i = 0; i < normalized.length - 1; i++) {
            const bigram = normalized.slice(i, i + 2);
            bigrams.set(bigram, (bigrams.get(bigram) || 0) + 1);
        }

        return bigrams;
    }

    /**
     * Extract trigrams from text
     */
    private extractTrigrams(text: string): Map<string, number> {
        const trigrams = new Map<string, number>();
        const normalized = text.toLowerCase().replace(/[^a-zäöüßáéíóúýčďěňřšťžąćęłńóśźżőűàèìòù]/g, "");

        for (let i = 0; i < normalized.length - 2; i++) {
            const trigram = normalized.slice(i, i + 3);
            trigrams.set(trigram, (trigrams.get(trigram) || 0) + 1);
        }

        return trigrams;
    }

    /**
     * Extract words from text
     */
    private extractWords(text: string): Set<string> {
        const words = new Set<string>();
        const matches = text.toLowerCase().match(/[a-zäöüßáéíóúýčďěňřšťžąćęłńóśźżőűàèìòù]+/g);

        if (matches) {
            matches.forEach(word => words.add(word));
        }

        return words;
    }

    /**
     * Calculate similarity score between two maps
     */
    private calculateMapSimilarity(map1: Map<string, number>, map2: Map<string, number>): number {
        let score = 0;
        let totalWeight = 0;

        for (const [key, weight] of map2.entries()) {
            totalWeight += weight;
            if (map1.has(key)) {
                score += weight;
            }
        }

        return totalWeight > 0 ? score / totalWeight : 0;
    }

    /**
     * Detect language from text
     */
    detect(text: string, confidenceThreshold: number = 0.3): DetectionResult {
        const textBigrams = this.extractBigrams(text);
        const textTrigrams = this.extractTrigrams(text);
        const textWords = this.extractWords(text);

        const scores = new Map<Language, number>();

        for (const [lang, signature] of LANGUAGE_SIGNATURES.entries()) {
            let score = 0;

            // Check for unique characters (strong indicator)
            const uniqueCharScore = [...signature.uniqueChars].reduce((acc, char) => {
                return acc + (text.includes(char) ? 0.2 : 0);
            }, 0);

            // Bigram similarity
            const bigramScore = this.calculateMapSimilarity(textBigrams, signature.commonBigrams) * signature.bigramWeight;

            // Trigram similarity
            const trigramScore = this.calculateMapSimilarity(textTrigrams, signature.commonTrigrams) * signature.trigramWeight;

            // Common words
            let wordMatchCount = 0;
            for (const word of textWords) {
                if (signature.commonWords.has(word)) {
                    wordMatchCount++;
                }
            }
            const wordScore = (wordMatchCount / Math.max(textWords.size, 1)) * signature.wordWeight;

            score = uniqueCharScore + bigramScore + trigramScore + wordScore;
            scores.set(lang, score);
        }

        // Find language with highest score
        let maxScore = 0;
        let detectedLang: Language = "cs";

        for (const [lang, score] of scores.entries()) {
            if (score > maxScore) {
                maxScore = score;
                detectedLang = lang;
            }
        }

        const confidence = Math.min(maxScore, 1.0);

        return {
            language: detectedLang,
            confidence,
            scores
        };
    }
}

// ============================================================================
// CASE PRESERVATION UTILITIES
// ============================================================================

class CasePreserver {
    /**
     * Analyze case pattern of original word
     */
    private analyzeCasePattern(word: string): "lower" | "upper" | "title" | "mixed" {
        if (word === word.toLowerCase()) { return "lower"; }
        if (word === word.toUpperCase()) { return "upper"; }
        if (word[0] === word[0].toUpperCase() && word.slice(1) === word.slice(1).toLowerCase()) { return "title"; }
        return "mixed";
    }

    /**
     * Apply case pattern from original to accented word
     */
    applyCase(original: string, accented: string): string {
        const pattern = this.analyzeCasePattern(original);

        switch (pattern) {
            case "lower":
                return accented.toLowerCase();
            case "upper":
                return accented.toUpperCase();
            case "title":
                return accented.charAt(0).toUpperCase() + accented.slice(1).toLowerCase();
            case "mixed":
                return this.applyMixedCase(original, accented);
        }
    }

    /**
     * Apply mixed case pattern character by character
     */
    private applyMixedCase(original: string, accented: string): string {
        const result: string[] = [];
        const accentedLower = accented.toLowerCase();

        for (let i = 0; i < accented.length; i++) {
            if (i < original.length) {
                const origChar = original[i];
                const accentChar = accentedLower[i];

                if (origChar === origChar.toUpperCase() && origChar !== origChar.toLowerCase()) {
                    result.push(accentChar.toUpperCase());
                } else {
                    result.push(accentChar);
                }
            } else {
                result.push(accentedLower[i]);
            }
        }

        return result.join("");
    }
}

// ============================================================================
// MAIN ACCENT RESTORATION SYSTEM
// ============================================================================

class AccentRestorationSystem {
    private dictionary: CompressedDictionary;
    private detector: LanguageDetector;
    private casePreserver: CasePreserver;

    constructor() {
        this.dictionary = new CompressedDictionary();
        this.detector = new LanguageDetector();
        this.casePreserver = new CasePreserver();

        // Load sample dictionaries
        this.loadSampleDictionaries();
    }

    /**
     * Load sample dictionaries for demonstration
     */
    private loadSampleDictionaries(): void {
        // Czech
        this.dictionary.loadDictionary("cs", [
            ["cerny", "černý"], ["cerveny", "červený"], ["zeleny", "zelený"],
            ["zlaty", "zlatý"], ["stribrny", "stříbrný"], ["modry", "modrý"],
            ["pribehy", "příběhy"], ["pribeh", "příběh"], ["mesto", "město"],
            ["cernossky", "černošský"], ["cernos", "černoš"], ["cernoska", "černoška"],
            ["cernosky", "černošky"], ["dnes", "dnes"], ["vcera", "včera"],
            ["zitra", "zítra"], ["dobre", "dobré"], ["spatne", "špatné"],
            ["hezky", "hezký"], ["krásný", "krásný"], ["stesti", "štěstí"]
        ]);

        // Slovak
        this.dictionary.loadDictionary("sk", [
            ["zeleny", "zelený"], ["cerveny", "červený"], ["modry", "modrý"],
            ["zlaty", "zlatý"], ["dnes", "dnes"], ["vcera", "včera"],
            ["zajtra", "zajtra"], ["dobry", "dobrý"], ["spatny", "špatný"],
            ["krasny", "krásny"], ["lahky", "ľahký"], ["tazky", "ťažký"]
        ]);

        // Hungarian
        this.dictionary.loadDictionary("hu", [
            ["almas", "almás"], ["korte", "körte"], ["barack", "barack"],
            ["kalacs", "kalács"], ["csokolada", "csokoládá"], ["teglalap", "téglalap"],
            ["oroszlan", "oroszlán"], ["kiralyno", "királynő"], ["hosok", "hősök"],
            ["utonallo", "útonálló"], ["kiralyi", "királyi"], ["szep", "szép"],
            ["jo", "jó"], ["rossz", "rossz"], ["nagy", "nagy"], ["kicsi", "kicsi"]
        ]);

        // German
        this.dictionary.loadDictionary("de", [
            ["schon", "schön"], ["uber", "über"], ["fur", "für"],
            ["grun", "grün"], ["blau", "blau"], ["rot", "rot"],
            ["gelb", "gelb"], ["weiss", "weiß"], ["schwarz", "schwarz"],
            ["mutter", "Mutter"], ["vater", "Vater"], ["bruder", "Bruder"]
        ]);

        // Polish
        this.dictionary.loadDictionary("pl", [
            ["zloty", "złoty"], ["srebro", "srebro"], ["wegiel", "węgiel"],
            ["zolty", "żółty"], ["zielony", "zielony"], ["czerwony", "czerwony"],
            ["niebieski", "niebieski"], ["czarny", "czarny"], ["bialy", "biały"],
            ["dziekuje", "dziękuję"], ["prosze", "proszę"], ["przepraszam", "przepraszam"],
            ["tak", "tak"], ["nie", "nie"], ["moze", "może"], ["tylko", "tylko"]
        ]);
    }

    /**
     * Preload a specific language dictionary
     */
    preloadLanguage(language: Language): void {
        if (!this.dictionary.isLoaded(language)) {
            console.log(`Loading dictionary for language: ${language}`);
            // In production, this would load from external resource
        }
    }

    /**
     * Detect language of input text
     */
    detectLanguage(text: string, confidenceThreshold: number = 0.3): DetectionResult {
        return this.detector.detect(text, confidenceThreshold);
    }

    /**
     * Restore accents in text
     */
    restoreAccents(text: string, options: RestoreOptions = {}): string {
        const {
            language,
            confidenceThreshold = 0.3,
            enablePartialMatch = true,
            enableCache = true
        } = options;

        // Detect language if not specified
        let detectedLang: Language;
        if (language) {
            detectedLang = language;
        } else {
            const detection = this.detector.detect(text, confidenceThreshold);
            if (detection.confidence < confidenceThreshold) {
                console.warn(`Low confidence detection: ${detection.confidence.toFixed(2)} for ${detection.language}`);
            }
            detectedLang = detection.language;
        }

        // Ensure dictionary is loaded
        if (!this.dictionary.isLoaded(detectedLang)) {
            console.warn(`Dictionary for ${detectedLang} not loaded`);
            return text;
        }

        // Process text word by word
        return text.replace(/\b[a-záéíóúýčďěňřšťžäöüßąćęłńóśźżőű]+\b/gi, (word) => {
            const accented = this.dictionary.lookup(word, detectedLang, enablePartialMatch);

            if (accented) {
                return this.casePreserver.applyCase(word, accented);
            }

            return word;
        });
    }

    /**
     * Clear internal caches
     */
    clearCache(): void {
        this.dictionary.clearCache();
    }

    /**
     * Get statistics
     */
    getStats(): object {
        return {
            loadedLanguages: Array.from(LANGUAGE_SIGNATURES.keys()).filter(lang =>
                this.dictionary.isLoaded(lang)
            ),
            cacheSize: this.dictionary["cache"].size
        };
    }
}

export {
    AccentRestorationSystem,
    type Language,
    type RestoreOptions,
    type DetectionResult
};