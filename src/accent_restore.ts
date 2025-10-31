import { dictionaries } from "./dictionaries";

/**
 * JSON-Based Accent Restoration System
 * Pre-bundled dictionaries version for VS Code extension compatibility
 */

interface LanguageDictionary {
  code: string;
  name: string;
  commonWords: { [plain: string]: string };
  patterns: string[];
  stopWords: string[];
  accentChars: string[];
  metadata?: {
    version: string;
    lastUpdated: string;
  };
}

interface RestorationStats {
  languages: number;
  dictionarySize: number;
  loadedLanguages: string[];
  supportedLanguages: string[];
}

class AccentRestorer {
  private loadedDictionaries: Map<string, LanguageDictionary> = new Map();
  private customDictionary: Map<string, string> = new Map();
  private preloadedLanguages: Set<string> = new Set();

  constructor(preloadLanguages: string[] = ["fr", "es", "hu"]) {
    this.preloadedLanguages = new Set(preloadLanguages);
    this.initializeSync();
  }

  /**
   * Synchronous initialization with pre-bundled dictionaries
   */
  private initializeSync(): void {
    // Load preconfigured languages
    this.preloadedLanguages.forEach(lang => {
      this.loadLanguageSync(lang);
    });
  }

  /**
   * Synchronous language loading from pre-bundled dictionaries
   */
  private loadLanguageSync(languageCode: string): boolean {
    try {
      const dictionary = dictionaries[languageCode as keyof typeof dictionaries];
      if (dictionary) {
        this.loadedDictionaries.set(languageCode, dictionary);
        return true;
      }
    } catch (error) {
      console.warn(`Failed to load dictionary for ${languageCode}:`, error);
    }
    
    return false;
  }

  /**
   * Language detection (synchronous)
   */
  private detectLanguages(text: string): string[] {
    const scores: Map<string, number> = new Map();
    const words = text.toLowerCase().split(/\s+/);
    
    // Initialize scores for all loaded languages
    this.loadedDictionaries.forEach((config, code) => {
      scores.set(code, 0);
    });

    // Score based on multiple factors
    words.forEach(word => {
      if (word.length < 2) {return;}

      this.loadedDictionaries.forEach((config, code) => {
        let wordScore = 0;

        // Check for stop words (very strong indicator)
        if (config.stopWords.includes(word.toLowerCase())) {
          wordScore += 3;
        }

        // Check for exact common word matches in loaded dictionary
        if (config.commonWords && config.commonWords[word.toLowerCase()]) {
          wordScore += 5;
        }

        // Check for language-specific patterns
        config.patterns.forEach(patternStr => {
          const pattern = new RegExp(patternStr, "gi");
          if (word.match(pattern)) {
            wordScore += 2;
          }
        });

        // Check for accent characters
        if (config.accentChars.length > 0) {
          const accentPattern = new RegExp(`[${config.accentChars.join("")}]`);
          if (accentPattern.test(word)) {
            wordScore += 4;
          }
        }

        scores.set(code, scores.get(code)! + wordScore);
      });
    });

    // Additional scoring for overall text patterns
    this.loadedDictionaries.forEach((config, code) => {
      let patternScore = 0;

      config.patterns.forEach(patternStr => {
        const pattern = new RegExp(patternStr, "gi");
        const matches = text.match(pattern);
        if (matches) {
          patternScore += matches.length;
        }
      });

      // Boost score for texts with multiple accent characters
      if (config.accentChars.length > 0) {
        const accentPattern = new RegExp(`[${config.accentChars.join("")}]`, "g");
        const accentMatches = text.match(accentPattern);
        if (accentMatches) {
          patternScore += accentMatches.length * 2;
        }
      }

      scores.set(code, scores.get(code)! + patternScore);
    });

    // Filter and sort languages
    const detected = Array.from(scores.entries())
      .filter(([, score]) => score > 2)
      .sort(([, a], [, b]) => b - a)
      .map(([code]) => code);

    return detected.length > 0 ? detected : Array.from(this.preloadedLanguages).slice(0, 3);
  }

  /**
   * Preserve case when replacing words
   */
  private preserveCase(original: string, replacement: string): string {
    if (!original || !replacement) {return original;}
    
    if (original === original.toUpperCase()) {
      return replacement.toUpperCase();
    }
    if (original[0] === original[0].toUpperCase()) {
      return replacement[0].toUpperCase() + replacement.slice(1);
    }
    return replacement;
  }

  /**
   * Dictionary lookup across loaded languages
   */
  private dictionaryLookup(word: string, languages: string[]): string | null {
    const lowerWord = word.toLowerCase();
    
    // First check custom dictionary
    if (this.customDictionary.has(lowerWord)) {
      return this.customDictionary.get(lowerWord)!;
    }

    // Then check language-specific dictionaries
    for (const lang of languages) {
      const dict = this.loadedDictionaries.get(lang);
      if (dict && dict.commonWords && dict.commonWords[lowerWord]) {
        return dict.commonWords[lowerWord];
      }
    }

    return null;
  }

  /**
   * Main restoration function (synchronous)
   */
  restore(text: string, targetLanguages?: string[]): string {
    if (!text || text.trim().length === 0) {return text;}

    // Detect languages if not specified
    const languages = targetLanguages || this.detectLanguages(text);
    
    console.log(`Detected languages: ${languages.join(", ")}`);

    // Ensure dictionaries are loaded for detected languages
    languages.forEach(lang => {
      if (!this.loadedDictionaries.has(lang)) {
        this.loadLanguageSync(lang);
      }
    });

    // Word-by-word restoration
    const result = text.replace(/\b[\wÀ-ÿ']+\b/g, (word) => {
      // Skip short words and words that already have accents
      if (word.length < 2 || /[À-ÿ]/.test(word)) {
        return word;
      }

      // Skip common English words to avoid false positives
      const englishWords = ["the", "and", "for", "are", "but", "not", "you", "all", "can", "your", "with", "have", "this", "that", "was", "from"];
      if (englishWords.includes(word.toLowerCase())) {
        return word;
      }

      // Dictionary lookup
      const dictMatch = this.dictionaryLookup(word, languages);
      if (dictMatch) {
        return this.preserveCase(word, dictMatch);
      }

      return word;
    });

    return result;
  }

  /**
   * Train with custom examples
   */
  train(examples: Array<{ plain: string; accented: string; language?: string }>): void {
    examples.forEach(({ plain, accented, language }) => {
      const key = plain.toLowerCase();
      this.customDictionary.set(key, accented);
      
      // Also add to language-specific dictionary if language is specified
      if (language && this.loadedDictionaries.has(language)) {
        const dict = this.loadedDictionaries.get(language)!;
        dict.commonWords[key] = accented;
      }
    });
  }

  /**
   * Get statistics about loaded dictionaries
   */
  getStats(): RestorationStats {
    let totalDictionarySize = 0;
    const loadedLanguages: string[] = [];
    const supportedLanguages: string[] = [];

    this.loadedDictionaries.forEach((dict, code) => {
      const wordCount = Object.keys(dict.commonWords).length;
      totalDictionarySize += wordCount;
      
      supportedLanguages.push(`${dict.name} (${code})`);
      
      if (wordCount > 0) {
        loadedLanguages.push(code);
      }
    });

    // Add custom dictionary size
    totalDictionarySize += this.customDictionary.size;

    return {
      languages: this.loadedDictionaries.size,
      dictionarySize: totalDictionarySize,
      loadedLanguages,
      supportedLanguages
    };
  }

  /**
   * Check if a language dictionary is loaded
   */
  isLanguageLoaded(languageCode: string): boolean {
    return this.loadedDictionaries.has(languageCode);
  }

  /**
   * Get list of supported language codes
   */
  getSupportedLanguages(): string[] {
    return Object.keys(dictionaries);
  }

  /**
   * Preload additional languages
   */
  preloadLanguages(languageCodes: string[]): void {
    languageCodes.forEach(code => {
      if (!this.loadedDictionaries.has(code)) {
        this.loadLanguageSync(code);
      }
    });
  }
}

export { AccentRestorer, type LanguageDictionary, type RestorationStats };