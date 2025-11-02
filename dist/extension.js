"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/extension.ts
var extension_exports = {};
__export(extension_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(extension_exports);
var vscode2 = __toESM(require("vscode"));
var path2 = __toESM(require("path"));

// src/shared.ts
var vscode = __toESM(require("vscode"));
var diacriticRegex = /[\p{Mn}\u0300-\u036f]/gu;
var languageCharacterMappings = {
  /** Czech language character mappings */
  "czech": {
    "\xE1": "a",
    "\xC1": "A",
    "\u010D": "c",
    "\u010C": "C",
    "\u010F": "d",
    "\u010E": "D",
    "\xE9": "e",
    "\xC9": "E",
    "\u011B": "e",
    "\u011A": "E",
    "\xED": "i",
    "\xCD": "I",
    "\u0148": "n",
    "\u0147": "N",
    "\xF3": "o",
    "\xD3": "O",
    "\u0159": "r",
    "\u0158": "R",
    "\u0161": "s",
    "\u0160": "S",
    "\u0165": "t",
    "\u0164": "T",
    "\xFA": "u",
    "\xDA": "U",
    "\u016F": "u",
    "\u016E": "U",
    "\xFD": "y",
    "\xDD": "Y",
    "\u017E": "z",
    "\u017D": "Z"
  },
  /** Danish language character mappings */
  "danish": {
    "\xE6": "ae",
    "\xC6": "Ae",
    "\xF8": "oe",
    "\xD8": "Oe",
    "\xE5": "aa",
    "\xC5": "Aa"
  },
  /** French language character mappings */
  "french": {
    "\xE0": "a",
    "\xC0": "A",
    "\xE2": "a",
    "\xC2": "A",
    "\xE4": "a",
    "\xC4": "A",
    "\xE6": "ae",
    "\xC6": "Ae",
    "\xE7": "c",
    "\xC7": "C",
    "\xE9": "e",
    "\xC9": "E",
    "\xE8": "e",
    "\xC8": "E",
    "\xEA": "e",
    "\xCA": "E",
    "\xEB": "e",
    "\xCB": "E",
    "\xEF": "i",
    "\xCF": "I",
    "\xEE": "i",
    "\xCE": "I",
    "\xF4": "o",
    "\xD4": "O",
    "\xF6": "o",
    "\xD6": "O",
    "\u0153": "oe",
    "\u0152": "Oe",
    "\xF9": "u",
    "\xD9": "U",
    "\xFB": "u",
    "\xDB": "U",
    "\xFC": "u",
    "\xDC": "U",
    "\xFF": "y",
    "\u0178": "Y"
  },
  /** German language character mappings */
  "german": {
    "\xE4": "ae",
    "\xC4": "Ae",
    "\xF6": "oe",
    "\xD6": "Oe",
    "\xFC": "ue",
    "\xDC": "Ue",
    "\xDF": "ss",
    "\u1E9E": "SS"
  },
  /** Hungarian language character mappings */
  "hungarian": {
    "\xE1": "a",
    "\xC1": "A",
    "\xE9": "e",
    "\xC9": "E",
    "\xED": "i",
    "\xCD": "I",
    "\xF3": "o",
    "\xD3": "O",
    "\xF6": "o",
    "\xD6": "O",
    "\u0151": "o",
    "\u0150": "O",
    "\xFA": "u",
    "\xDA": "U",
    "\xFC": "u",
    "\xDC": "U",
    "\u0171": "u",
    "\u0170": "U"
  },
  /** Polish language character mappings */
  "polish": {
    "\u0105": "a",
    "\u0104": "A",
    "\u0107": "c",
    "\u0106": "C",
    "\u0119": "e",
    "\u0118": "E",
    "\u0142": "l",
    "\u0141": "L",
    "\u0144": "n",
    "\u0143": "N",
    "\xF3": "o",
    "\xD3": "O",
    "\u015B": "s",
    "\u015A": "S",
    "\u017A": "z",
    "\u0179": "Z",
    "\u017C": "z",
    "\u017B": "Z"
  },
  /** Slovak language character mappings */
  "slovak": {
    "\xE1": "a",
    "\xC1": "A",
    "\xE4": "a",
    "\xC4": "A",
    "\u010D": "c",
    "\u010C": "C",
    "\u010F": "d",
    "\u010E": "D",
    "\xE9": "e",
    "\xC9": "E",
    "\xED": "i",
    "\xCD": "I",
    "\u013E": "l",
    "\u013D": "L",
    "\u013A": "l",
    "\u0139": "L",
    "\u0148": "n",
    "\u0147": "N",
    "\xF3": "o",
    "\xD3": "O",
    "\xF4": "o",
    "\xD4": "O",
    "\u0155": "r",
    "\u0154": "R",
    "\u0161": "s",
    "\u0160": "S",
    "\u0165": "t",
    "\u0164": "T",
    "\xFA": "u",
    "\xDA": "U",
    "\xFD": "y",
    "\xDD": "Y",
    "\u017E": "z",
    "\u017D": "Z"
  },
  /** Spanish language character mappings */
  "spanish": {
    "\xE1": "a",
    "\xC1": "A",
    "\xE9": "e",
    "\xC9": "E",
    "\xED": "i",
    "\xCD": "I",
    "\xF3": "o",
    "\xD3": "O",
    "\xFA": "u",
    "\xDA": "U",
    "\xFC": "u",
    "\xDC": "U",
    "\xF1": "n",
    "\xD1": "N"
  },
  /** Swedish language character mappings */
  "swedish": {
    "\xE5": "aa",
    "\xC5": "Aa",
    "\xE4": "ae",
    "\xC4": "Ae",
    "\xF6": "oe",
    "\xD6": "Oe"
  }
};
var allLanguageCharacterMappings = Object.assign(
  {},
  ...Object.values(languageCharacterMappings)
);
function searchAndReplaceCaseSensitive(original, restored) {
  if (!original || !restored) {
    return restored;
  }
  const origLen = original.length;
  const restLen = restored.length;
  const upperOrig = original.toUpperCase();
  const lowerOrig = original.toLowerCase();
  if (original === upperOrig) {
    return restored.toUpperCase();
  }
  if (original === lowerOrig) {
    return restored.toLowerCase();
  }
  if (origLen > 0 && original[0] === upperOrig[0] && original.slice(1) === lowerOrig.slice(1)) {
    return restored[0].toUpperCase() + restored.slice(1).toLowerCase();
  }
  const result = new Array(restLen);
  const minLength = Math.min(origLen, restLen);
  for (let i = 0; i < minLength; i++) {
    const origChar = original[i];
    const origLower = lowerOrig[i];
    result[i] = origChar === origLower ? restored[i].toLowerCase() : restored[i].toUpperCase();
  }
  if (restLen > minLength) {
    const lastOrigChar = original[origLen - 1];
    const lastIsUpper = lastOrigChar !== lowerOrig[origLen - 1];
    const transform = lastIsUpper ? (c) => c.toUpperCase() : (c) => c.toLowerCase();
    for (let i = minLength; i < restLen; i++) {
      result[i] = transform(restored[i]);
    }
  }
  return result.join("");
}
function validateUserCharacterMappings(mappings) {
  if (!mappings || typeof mappings !== "object") {
    return vscode.l10n.t("Invalid mappings: Not an object.");
  }
  for (const [key, value] of Object.entries(mappings)) {
    if (typeof key !== "string" || key.length !== 1) {
      return vscode.l10n.t('Invalid key: "{key}". Keys must be single characters.', { key });
    }
    if (typeof value !== "string") {
      return vscode.l10n.t('Invalid value for key "{key}": "{value}". Values must be strings.', { key, value });
    }
  }
  return "";
}
function normalizeIgnoreWords(str) {
  return Array.from(
    new Set(
      str.split("\n").map((word) => word.trim()).filter((word) => word.length > 0)
    )
  );
}

// src/restoreDiacritic.ts
var fs = __toESM(require("fs"));
var path = __toESM(require("path"));
var DiacriticRestorer = class _DiacriticRestorer {
  /**
   * Main dictionary storage mapping base forms to possible diacritic variations
   * 
   * @type {Map<string, DictionaryEntry[]>}
   * @private
   */
  dictionary = /* @__PURE__ */ new Map();
  /**
   * Set of words to ignore during restoration (in normalized form)
   * 
   * @type {Set<string>}
   * @private
   */
  ignoredWords;
  /**
   * Currently active language code (e.g., 'hu', 'fr', 'es')
   * 
   * @type {string | undefined}
   * @private
   */
  currentLanguage;
  /**
   * Indicates whether the dictionary is loaded and ready for use
   * 
   * @type {boolean}
   * @private
   */
  isReady = false;
  /**
   * Base file system path where dictionary files are stored
   * 
   * @type {string}
   * @private
   */
  dictionaryBasePath;
  /**
   * LRU cache for restoration results to improve performance
   * 
   * @type {Map<string, string>}
   * @private
   */
  restorationCache = /* @__PURE__ */ new Map();
  /**
   * Maximum number of entries to store in the restoration cache
   * 
   * @type {number}
   * @private
   * @readonly
   */
  MAX_CACHE_SIZE = 1e3;
  /**
   * Whether to enable suffix matching for inflected word forms
   * 
   * @type {boolean}
   * @private
   */
  enableSuffixMatching;
  /**
   * Cached regex pattern for identifying words (including Unicode letters and combining marks)
   * Matches: Unicode letters, combining marks, apostrophes, and hyphens
   * 
   * @type {RegExp}
   * @static
   * @readonly
   */
  static WORD_REGEX = /[\p{L}\p{M}'\u2019-]+/gu;
  /**
   * Creates a new DiacriticRestorer instance
   * 
   * @param {string} language - Language code for dictionary loading (e.g., 'hu', 'fr')
   * @param {string[]} [ignoredWords=[]] - Array of words to skip during restoration
   * @param {boolean} [enableSuffixMatching=false] - Whether to enable suffix matching for inflected forms
   * 
   * @throws {Error} If language is not provided
   */
  constructor(language, ignoredWords = [], enableSuffixMatching = false) {
    if (!language) {
      throw new Error("Language parameter is required");
    }
    this.currentLanguage = language;
    this.enableSuffixMatching = enableSuffixMatching;
    this.ignoredWords = new Set(
      ignoredWords.map((word) => this.removeDiacritics(word.toLowerCase()))
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
  async initialize() {
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
  async readDictionaryFile(filePath) {
    return new Promise((resolve, reject) => {
      fs.access(filePath, fs.constants.F_OK, (accessErr) => {
        if (accessErr) {
          reject(new Error(`Dictionary file not found: ${filePath}`));
          return;
        }
        const stream = fs.createReadStream(filePath, {
          encoding: "utf8",
          highWaterMark: 64 * 1024
          // 64KB chunks
        });
        let data = "";
        stream.on("data", (chunk) => {
          data += chunk;
        });
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
  buildDictionary(csvData) {
    const lines = csvData.split("\n");
    let lineCount = 0;
    let errorCount = 0;
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) {
        continue;
      }
      const tabIndex = line.indexOf("	");
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
        let entries = this.dictionary.get(baseForm);
        if (!entries) {
          entries = [];
          this.dictionary.set(baseForm, entries);
        }
        const entry = { word, frequency };
        let left = 0;
        let right = entries.length;
        while (left < right) {
          const mid = left + right >>> 1;
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
  restoreDiacritics(text) {
    if (!this.isReady) {
      throw new Error("Accent restorer not initialized. Call initialize() first.");
    }
    return text.replace(_DiacriticRestorer.WORD_REGEX, (word) => {
      const cached = this.restorationCache.get(word);
      if (cached !== void 0) {
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
  addToCache(key, value) {
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
  findBestMatch(word, baseForm) {
    const normalizedBase = baseForm || this.removeDiacritics(word.toLowerCase());
    const candidates = this.dictionary.get(normalizedBase);
    if (!candidates || candidates.length === 0) {
      if (this.enableSuffixMatching) {
        return this.findSuffixMatch(word, normalizedBase);
      }
      return null;
    }
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
  findSuffixMatch(word, normalizedBase, maxSuffixLen = 3) {
    const wordLower = word.toLowerCase();
    const wordLen = normalizedBase.length;
    const minStemLen = Math.max(4, Math.floor(wordLen * 0.6));
    for (let stemLen = wordLen - 1; stemLen >= Math.max(minStemLen, wordLen - maxSuffixLen); stemLen--) {
      const stem = normalizedBase.substring(0, stemLen);
      const candidates = this.dictionary.get(stem);
      if (candidates && candidates.length > 0) {
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
  removeDiacritics(text) {
    if (!text || typeof text !== "string") {
      return text;
    }
    const allMappings = this.currentLanguage ? languageCharacterMappings[this.currentLanguage] || {} : {};
    let normalized = text.toLowerCase().normalize("NFKD").replace(diacriticRegex, "");
    const specialChars = Object.keys(allMappings).join("");
    const specialCharsPattern = new RegExp(`[${specialChars}]`, "g");
    return normalized.replace(
      specialCharsPattern,
      (match) => allMappings[match]
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
  async changeLanguage(language) {
    if (language === this.currentLanguage && this.isReady) {
      return;
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
  dispose() {
    this.dictionary.clear();
    this.ignoredWords.clear();
    this.restorationCache.clear();
    this.isReady = false;
    this.currentLanguage = void 0;
  }
  /**
   * Returns memory usage statistics for monitoring and debugging
   * 
   * @returns {string} Formatted string with memory usage information
   */
  getMemoryUsage() {
    const entries = Array.from(this.dictionary.values()).reduce((sum, arr) => sum + arr.length, 0);
    const uniqueBaseForms = this.dictionary.size;
    return `Dictionary: ${uniqueBaseForms} base forms, ${entries} total entries, Cache: ${this.restorationCache.size} words, Language: ${this.currentLanguage || "none"}`;
  }
  /**
   * Checks if the restorer is initialized and ready for use
   * 
   * @returns {boolean} True if initialized and ready
   */
  getIsReady() {
    return this.isReady;
  }
  /**
   * Gets the currently active language code
   * 
   * @returns {string | undefined} Current language or undefined if not set
   */
  getCurrentLanguage() {
    return this.currentLanguage;
  }
};
var restoreDiacritic_default = DiacriticRestorer;

// src/removeDiacritic.ts
var DiacriticRemover = class {
  /**
   * Replaces accented characters in a text string with their non-accented equivalents.
   * Uses a two-step process: custom character mappings followed by Unicode normalization.
   * 
   * Processing order:
   * 1. Applies custom character mappings (case-sensitive)
   * 2. Uses Unicode normalization (NFD) to decompose characters
   * 3. Removes diacritical marks using regex
   * 
   * @param {string} text - The input string containing accented characters to be replaced
   * @param {Record<string, string>} [userCharacterMappings={}] - Optional custom character mapping object to override default replacements
   * 
   * @returns {string} The input string with accents removed, or the original text if processing fails
   * 
   * @throws {Error} Logs error to console but returns original text to prevent breaking calling code
   * 
   * @see {@link allLanguageCharacterMappings} for default character replacements
   * @see {@link searchAndReplaceCaseSensitive} for case preservation logic
   * @see {@link diacriticRegex} for Unicode diacritic matching pattern
   */
  removeDiacritics(text, userCharacterMappings = {}) {
    if (!text || typeof text !== "string") {
      return text;
    }
    try {
      const combinedMappings = { ...allLanguageCharacterMappings, ...userCharacterMappings };
      const specialChars = Object.keys(combinedMappings).join("");
      const customPattern = new RegExp(`[${specialChars}]`, "g");
      let result = text.replace(customPattern, (match) => {
        const replacement = combinedMappings[match];
        return searchAndReplaceCaseSensitive(match, replacement);
      });
      return result.normalize("NFKD").replace(diacriticRegex, "");
    } catch (error) {
      console.error("Error in removeDiacritics:", error);
      return text;
    }
  }
};
var removeDiacritic_default = DiacriticRemover;

// src/extension.ts
function activate(context) {
  let CommandId;
  ((CommandId2) => {
    CommandId2["ReportIssue"] = "ps-replace-accents.reportIssue";
    CommandId2["ReplaceDiacriticts"] = "ps-replace-accents.removeDiacritics";
    CommandId2["ReplaceDiacritictsFileOrFolder"] = "ps-replace-accents.removeDiacriticsFileOrFolder";
    CommandId2["RestoreDiacritics"] = "ps-replace-accents.restoreDiacritics";
  })(CommandId || (CommandId = {}));
  const processTextInEditor = async (transformFn, expandToFullLines = false, options) => {
    const editor = vscode2.window.activeTextEditor;
    if (!editor) {
      return -1;
    }
    const document = editor.document;
    const selections = editor.selections;
    if (!selections.length || selections.every((s) => s.isEmpty)) {
      const entireDocumentRange = new vscode2.Range(
        0,
        0,
        document.lineCount - 1,
        document.lineAt(document.lineCount - 1).text.length
      );
      const text = document.getText(entireDocumentRange);
      const processedText = transformFn(text, options);
      await editor.edit((editBuilder) => {
        editBuilder.replace(entireDocumentRange, processedText);
      });
      return 1;
    }
    await editor.edit((editBuilder) => {
      for (const selection of selections) {
        if (selection.isEmpty) {
          continue;
        }
        let rangeToProcess = selection;
        if (expandToFullLines) {
          const startLine = document.lineAt(selection.start.line);
          const endLine = document.lineAt(selection.end.line);
          rangeToProcess = new vscode2.Selection(startLine.range.start, endLine.range.end);
        }
        const selectedText = document.getText(rangeToProcess);
        const processedText = transformFn(selectedText, options);
        editBuilder.replace(rangeToProcess, processedText);
      }
    });
    return 0;
  };
  const removeDiacriticsFileOrFolder = async (uri, userMappings) => {
    const remover = new removeDiacritic_default();
    const oldPath = uri.fsPath;
    const itemName = path2.basename(oldPath);
    const parentPath = path2.dirname(oldPath);
    const itemNameWithoutAccent = remover.removeDiacritics(itemName, userMappings);
    if (itemNameWithoutAccent.trim().length === 0) {
      return;
    }
    if (itemName === itemNameWithoutAccent) {
      vscode2.window.showWarningMessage(
        vscode2.l10n.t("No diacritics were removed from '{0}'.", itemName)
      );
      return;
    }
    const newPath = path2.join(parentPath, itemNameWithoutAccent);
    const newUri = vscode2.Uri.file(newPath);
    let shouldOverwrite = false;
    try {
      await vscode2.workspace.fs.stat(newUri);
      const overwritePrompt = await vscode2.window.showWarningMessage(
        vscode2.l10n.t("'{0}' already exists. Do you want to overwrite it?", itemNameWithoutAccent),
        { modal: true },
        vscode2.l10n.t("Yes"),
        vscode2.l10n.t("No")
      );
      if (overwritePrompt === vscode2.l10n.t("Yes")) {
        shouldOverwrite = true;
      } else if (overwritePrompt === vscode2.l10n.t("No")) {
        return;
      }
    } catch (_) {
    }
    try {
      await vscode2.workspace.fs.rename(uri, vscode2.Uri.file(newPath), { overwrite: shouldOverwrite });
      vscode2.window.showInformationMessage(
        vscode2.l10n.t("Renamed: {0} to {1}", itemName, itemNameWithoutAccent)
      );
    } catch (error) {
      vscode2.window.showErrorMessage(
        vscode2.l10n.t("Failed to rename '{0}': {1}", itemName, error.message)
      );
    }
  };
  const commandHandlers = {
    /**
     * Opens the GitHub issues page for reporting problems or suggestions
     * 
     * @returns {void}
     */
    ["ps-replace-accents.reportIssue" /* ReportIssue */]: () => vscode2.env.openExternal(vscode2.Uri.parse("https://github.com/playfulsparkle/vscode_ps_replace_accents/issues")),
    /**
    		 * Removes diacritics from selected text or entire active document
    		 * 
    		 * Reads user configuration for custom character mappings and validates
    		 * them before processing. Shows appropriate success messages.
    		 * 
    		 * @returns {Promise<void>}
    
    		 * @see {@link validateUserCharacterMappings} for mapping validation
    		 * @see {@link DiacriticRemover} for the processing logic
    		 */
    ["ps-replace-accents.removeDiacritics" /* ReplaceDiacriticts */]: async () => {
      const userMappings = vscode2.workspace.getConfiguration("ps-replace-accents").get("userCharacterMapping", {});
      const mappingsError = validateUserCharacterMappings(userMappings);
      if (mappingsError) {
        vscode2.window.showErrorMessage(mappingsError);
        return;
      }
      const remover = new removeDiacritic_default();
      const allSelectionsEmpty = await processTextInEditor((text) => remover.removeDiacritics(text, userMappings));
      let modified = false;
      if (modified) {
        switch (allSelectionsEmpty) {
          case 1:
            vscode2.window.showInformationMessage(vscode2.l10n.t("All accented characters were replaced in the selected text."));
            break;
          case 0:
            vscode2.window.showInformationMessage(vscode2.l10n.t("All accented characters were replaced in the entire document."));
            break;
        }
      }
    },
    /**
     * Removes diacritics from file or folder names in Explorer context menu
     * 
     * Supports multiple selection in Explorer. Validates user mappings
     * and processes each selected item individually.
     * 
     * @param {vscode.Uri} uri - The primary URI from context menu
     * @param {vscode.Uri[]} [selectedUris] - Array of all selected URIs for multi-select
     * 
     * @returns {Promise<void>}
     */
    ["ps-replace-accents.removeDiacriticsFileOrFolder" /* ReplaceDiacritictsFileOrFolder */]: async (uri, selectedUris) => {
      if (!uri) {
        return;
      }
      const userMappings = vscode2.workspace.getConfiguration("ps-replace-accents").get("userCharacterMapping", {});
      const mappingsError = validateUserCharacterMappings(userMappings);
      if (mappingsError) {
        vscode2.window.showErrorMessage(mappingsError);
        return;
      }
      const urisToRename = selectedUris && selectedUris.length > 0 ? selectedUris : [uri];
      for (const currentUri of urisToRename) {
        await removeDiacriticsFileOrFolder(currentUri, userMappings);
      }
      if (urisToRename.length > 1) {
        vscode2.window.showInformationMessage(
          vscode2.l10n.t("Diacritics removed from {0} items.", urisToRename.length)
        );
      }
    },
    /**
     * Restores diacritics to normalized text using language dictionaries
     * 
     * Reads configuration for dictionary language, suffix matching, and
     * ignored words. Initializes the diacritic restorer and processes
     * the active editor content.
     * 
     * @returns {Promise<void>}
     */
    ["ps-replace-accents.restoreDiacritics" /* RestoreDiacritics */]: async () => {
      const suffixMatching = vscode2.workspace.getConfiguration("ps-replace-accents").get("diacriticRestoreSuffixMatching", false);
      const ignoredWordsRaw = vscode2.workspace.getConfiguration("ps-replace-accents").get("diacriticIgnoredWords", "");
      const ignoredWords = normalizeIgnoreWords(ignoredWordsRaw);
      const diacriticDictionary = vscode2.workspace.getConfiguration("ps-replace-accents").get("diacriticDictionary", "hungarian");
      const restorer = new restoreDiacritic_default(diacriticDictionary, ignoredWords, suffixMatching);
      await restorer.initialize();
      await processTextInEditor((text) => restorer.restoreDiacritics(text));
      restorer.dispose();
    }
  };
  for (const [commandId, handler] of Object.entries(commandHandlers)) {
    const disposable = vscode2.commands.registerCommand(commandId, handler);
    context.subscriptions.push(disposable);
  }
}
function deactivate() {
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
//# sourceMappingURL=extension.js.map
