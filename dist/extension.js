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
var path = __toESM(require("path"));

// src/utils.ts
var vscode = __toESM(require("vscode"));
function replaceAccents(text, charMappings = {}) {
  if (!text || typeof text !== "string") {
    return text;
  }
  try {
    let normalized = text.normalize("NFD");
    normalized = normalized.replace(/[\u0300-\u036f]/g, "");
    return Array.from(normalized).map((char) => charMappings[char] || char).join("");
  } catch (error) {
    return text;
  }
}
function validateSpecialCharacterMappings(mappings) {
  if (!mappings || typeof mappings !== "object") {
    return vscode.l10n.t("Invalid mappings: Not an object.");
  }
  for (const [key, value] of Object.entries(mappings)) {
    if (typeof key !== "string" || key.length !== 1) {
      return vscode.l10n.t('Invalid key: "{key}". Keys must be single characters.', { key });
    }
    if (typeof value !== "string") {
      return vscode.l10n.t('Invalid value for key "${key}": "${value}". Values must be strings.', { key, value });
    }
  }
  return "";
}

// src/accent.ts
var LANGUAGE_SIGNATURES = /* @__PURE__ */ new Map([
  ["cs", {
    uniqueChars: /* @__PURE__ */ new Set(["\u0159", "\u011B", "\u016F", "\u0148", "\u010D", "\u0161", "\u017E", "\xFD", "\xE1", "\xED", "\xE9"]),
    commonBigrams: /* @__PURE__ */ new Map([
      ["st", 15],
      ["ov", 12],
      ["pr", 11],
      ["po", 10],
      ["je", 10],
      ["na", 9],
      ["te", 9],
      ["to", 8],
      ["n\xED", 8],
      ["ch", 8]
    ]),
    commonTrigrams: /* @__PURE__ */ new Map([
      ["pro", 20],
      ["ova", 18],
      ["en\xED", 16],
      ["ost", 15],
      ["ter", 14],
      ["sta", 13],
      ["p\u0159e", 12],
      ["pod", 11],
      ["kte", 10]
    ]),
    commonWords: /* @__PURE__ */ new Set(["je", "se", "na", "do", "to", "za", "pro", "ale", "jak", "kter\xFD"]),
    bigramWeight: 0.3,
    trigramWeight: 0.4,
    wordWeight: 0.3
  }],
  ["sk", {
    uniqueChars: /* @__PURE__ */ new Set(["\u013E", "\u0155", "\xF4", "\u0148", "\u010D", "\u0161", "\u017E", "\xFD", "\xE1", "\xED", "\xE9", "\xFA", "\xE4"]),
    commonBigrams: /* @__PURE__ */ new Map([
      ["st", 14],
      ["ov", 11],
      ["pr", 10],
      ["po", 10],
      ["na", 9],
      ["ro", 9],
      ["ko", 8],
      ["je", 8],
      ["to", 8],
      ["ct", 7]
    ]),
    commonTrigrams: /* @__PURE__ */ new Map([
      ["ova", 18],
      ["ost", 16],
      ["pro", 15],
      ["ter", 14],
      ["sta", 13],
      ["pos", 12],
      ["kto", 11],
      ["pre", 10]
    ]),
    commonWords: /* @__PURE__ */ new Set(["je", "sa", "na", "do", "za", "pre", "ale", "ako", "ktor\xFD", "tento"]),
    bigramWeight: 0.3,
    trigramWeight: 0.4,
    wordWeight: 0.3
  }],
  ["hu", {
    uniqueChars: /* @__PURE__ */ new Set(["\u0151", "\u0171", "\xE1", "\xE9", "\xED", "\xF3", "\xF6", "\xFC", "\xFA"]),
    commonBigrams: /* @__PURE__ */ new Map([
      ["sz", 18],
      ["et", 15],
      ["en", 14],
      ["tt", 13],
      ["gy", 12],
      ["ny", 11],
      ["al", 10],
      ["el", 10],
      ["te", 9],
      ["ek", 9]
    ]),
    commonTrigrams: /* @__PURE__ */ new Map([
      ["ett", 20],
      ["tte", 18],
      ["sze", 17],
      ["ben", 16],
      ["nek", 15],
      ["s\xE9g", 14],
      ["t\xE1s", 13],
      ["len", 12]
    ]),
    commonWords: /* @__PURE__ */ new Set(["\xE9s", "az", "egy", "van", "hogy", "nem", "volt", "lesz", "m\xE9g", "csak"]),
    bigramWeight: 0.35,
    trigramWeight: 0.35,
    wordWeight: 0.3
  }],
  ["de", {
    uniqueChars: /* @__PURE__ */ new Set(["\xE4", "\xF6", "\xFC", "\xDF"]),
    commonBigrams: /* @__PURE__ */ new Map([
      ["en", 20],
      ["er", 18],
      ["ch", 16],
      ["te", 14],
      ["nd", 13],
      ["ie", 12],
      ["ge", 11],
      ["st", 10],
      ["be", 9],
      ["un", 9]
    ]),
    commonTrigrams: /* @__PURE__ */ new Map([
      ["ein", 22],
      ["ich", 20],
      ["den", 18],
      ["und", 17],
      ["die", 16],
      ["sch", 15],
      ["der", 14],
      ["gen", 13]
    ]),
    commonWords: /* @__PURE__ */ new Set(["der", "die", "das", "und", "ist", "ein", "nicht", "mit", "auch", "f\xFCr"]),
    bigramWeight: 0.3,
    trigramWeight: 0.35,
    wordWeight: 0.35
  }],
  ["pl", {
    uniqueChars: /* @__PURE__ */ new Set(["\u0105", "\u0107", "\u0119", "\u0142", "\u0144", "\xF3", "\u015B", "\u017A", "\u017C"]),
    commonBigrams: /* @__PURE__ */ new Map([
      ["cz", 18],
      ["sz", 17],
      ["rz", 16],
      ["dz", 14],
      ["ow", 13],
      ["st", 12],
      ["ie", 11],
      ["na", 10],
      ["po", 10],
      ["pr", 9]
    ]),
    commonTrigrams: /* @__PURE__ */ new Map([
      ["nie", 20],
      ["prz", 18],
      ["owi", 17],
      ["sto", 16],
      ["wie", 15],
      ["szy", 14],
      ["sta", 13],
      ["pod", 12]
    ]),
    commonWords: /* @__PURE__ */ new Set(["si\u0119", "nie", "jest", "by\u0107", "lub", "jak", "dla", "tak", "tylko", "mo\u017Ce"]),
    bigramWeight: 0.35,
    trigramWeight: 0.35,
    wordWeight: 0.3
  }]
]);
var CompressedDictionary = class {
  dictionaries = /* @__PURE__ */ new Map();
  cache = /* @__PURE__ */ new Map();
  cacheSize = 1e3;
  maxLoadedDicts = 3;
  /**
   * Create a Trie node
   */
  createNode() {
    return {
      children: /* @__PURE__ */ new Map(),
      accented: null,
      isEnd: false
    };
  }
  /**
   * Insert word pair into Trie
   */
  insertWord(root, unaccented, accented) {
    let node = root;
    const normalized = unaccented.toLowerCase();
    for (const char of normalized) {
      if (!node.children.has(char)) {
        node.children.set(char, this.createNode());
      }
      node = node.children.get(char);
    }
    node.isEnd = true;
    node.accented = accented;
  }
  /**
   * Search for word in Trie (exact match)
   */
  searchExact(root, word) {
    let node = root;
    const normalized = word.toLowerCase();
    for (const char of normalized) {
      if (!node.children.has(char)) {
        return null;
      }
      node = node.children.get(char);
    }
    return node.isEnd ? node.accented : null;
  }
  /**
   * Find longest matching prefix in Trie
   */
  searchLongestPrefix(root, word) {
    let node = root;
    const normalized = word.toLowerCase();
    let longestMatch = null;
    let longestLength = 0;
    for (let i = 0; i < normalized.length; i++) {
      const char = normalized[i];
      if (!node.children.has(char)) {
        break;
      }
      node = node.children.get(char);
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
  loadDictionary(language, wordPairs) {
    if (this.dictionaries.size >= this.maxLoadedDicts) {
      this.unloadLeastRecentlyUsed();
    }
    const root = this.createNode();
    const frequency = /* @__PURE__ */ new Map();
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
  unloadLeastRecentlyUsed() {
    let oldestLang = null;
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
  lookup(word, language, enablePartialMatch = true) {
    const cacheKey = `${language}:${word}:${enablePartialMatch}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    const dictData = this.dictionaries.get(language);
    if (!dictData) {
      return null;
    }
    dictData.lastAccess = Date.now();
    let result = this.searchExact(dictData.trie, word);
    if (!result && enablePartialMatch) {
      const prefixMatch = this.searchLongestPrefix(dictData.trie, word);
      if (prefixMatch && prefixMatch.length >= 4) {
        result = prefixMatch.match;
      }
    }
    if (result) {
      if (this.cache.size >= this.cacheSize) {
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
  isLoaded(language) {
    return this.dictionaries.has(language);
  }
  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }
};
var LanguageDetector = class {
  /**
   * Extract bigrams from text
   */
  extractBigrams(text) {
    const bigrams = /* @__PURE__ */ new Map();
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
  extractTrigrams(text) {
    const trigrams = /* @__PURE__ */ new Map();
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
  extractWords(text) {
    const words = /* @__PURE__ */ new Set();
    const matches = text.toLowerCase().match(/[a-zäöüßáéíóúýčďěňřšťžąćęłńóśźżőűàèìòù]+/g);
    if (matches) {
      matches.forEach((word) => words.add(word));
    }
    return words;
  }
  /**
   * Calculate similarity score between two maps
   */
  calculateMapSimilarity(map1, map2) {
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
  detect(text, confidenceThreshold = 0.3) {
    const textBigrams = this.extractBigrams(text);
    const textTrigrams = this.extractTrigrams(text);
    const textWords = this.extractWords(text);
    const scores = /* @__PURE__ */ new Map();
    for (const [lang, signature] of LANGUAGE_SIGNATURES.entries()) {
      let score = 0;
      const uniqueCharScore = [...signature.uniqueChars].reduce((acc, char) => {
        return acc + (text.includes(char) ? 0.2 : 0);
      }, 0);
      const bigramScore = this.calculateMapSimilarity(textBigrams, signature.commonBigrams) * signature.bigramWeight;
      const trigramScore = this.calculateMapSimilarity(textTrigrams, signature.commonTrigrams) * signature.trigramWeight;
      let wordMatchCount = 0;
      for (const word of textWords) {
        if (signature.commonWords.has(word)) {
          wordMatchCount++;
        }
      }
      const wordScore = wordMatchCount / Math.max(textWords.size, 1) * signature.wordWeight;
      score = uniqueCharScore + bigramScore + trigramScore + wordScore;
      scores.set(lang, score);
    }
    let maxScore = 0;
    let detectedLang = "cs";
    for (const [lang, score] of scores.entries()) {
      if (score > maxScore) {
        maxScore = score;
        detectedLang = lang;
      }
    }
    const confidence = Math.min(maxScore, 1);
    return {
      language: detectedLang,
      confidence,
      scores
    };
  }
};
var CasePreserver = class {
  /**
   * Analyze case pattern of original word
   */
  analyzeCasePattern(word) {
    if (word === word.toLowerCase()) {
      return "lower";
    }
    if (word === word.toUpperCase()) {
      return "upper";
    }
    if (word[0] === word[0].toUpperCase() && word.slice(1) === word.slice(1).toLowerCase()) {
      return "title";
    }
    return "mixed";
  }
  /**
   * Apply case pattern from original to accented word
   */
  applyCase(original, accented) {
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
  applyMixedCase(original, accented) {
    const result = [];
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
};
var AccentRestorationSystem = class {
  dictionary;
  detector;
  casePreserver;
  constructor() {
    this.dictionary = new CompressedDictionary();
    this.detector = new LanguageDetector();
    this.casePreserver = new CasePreserver();
    this.loadSampleDictionaries();
  }
  /**
   * Load sample dictionaries for demonstration
   */
  loadSampleDictionaries() {
    this.dictionary.loadDictionary("cs", [
      ["cerny", "\u010Dern\xFD"],
      ["cerveny", "\u010Derven\xFD"],
      ["zeleny", "zelen\xFD"],
      ["zlaty", "zlat\xFD"],
      ["stribrny", "st\u0159\xEDbrn\xFD"],
      ["modry", "modr\xFD"],
      ["pribehy", "p\u0159\xEDb\u011Bhy"],
      ["pribeh", "p\u0159\xEDb\u011Bh"],
      ["mesto", "m\u011Bsto"],
      ["cernossky", "\u010Derno\u0161sk\xFD"],
      ["cernos", "\u010Derno\u0161"],
      ["cernoska", "\u010Derno\u0161ka"],
      ["cernosky", "\u010Derno\u0161ky"],
      ["dnes", "dnes"],
      ["vcera", "v\u010Dera"],
      ["zitra", "z\xEDtra"],
      ["dobre", "dobr\xE9"],
      ["spatne", "\u0161patn\xE9"],
      ["hezky", "hezk\xFD"],
      ["kr\xE1sn\xFD", "kr\xE1sn\xFD"],
      ["stesti", "\u0161t\u011Bst\xED"]
    ]);
    this.dictionary.loadDictionary("sk", [
      ["zeleny", "zelen\xFD"],
      ["cerveny", "\u010Derven\xFD"],
      ["modry", "modr\xFD"],
      ["zlaty", "zlat\xFD"],
      ["dnes", "dnes"],
      ["vcera", "v\u010Dera"],
      ["zajtra", "zajtra"],
      ["dobry", "dobr\xFD"],
      ["spatny", "\u0161patn\xFD"],
      ["krasny", "kr\xE1sny"],
      ["lahky", "\u013Eahk\xFD"],
      ["tazky", "\u0165a\u017Ek\xFD"]
    ]);
    this.dictionary.loadDictionary("hu", [
      ["almas", "alm\xE1s"],
      ["korte", "k\xF6rte"],
      ["barack", "barack"],
      ["kalacs", "kal\xE1cs"],
      ["csokolada", "csokol\xE1d\xE1"],
      ["teglalap", "t\xE9glalap"],
      ["oroszlan", "oroszl\xE1n"],
      ["kiralyno", "kir\xE1lyn\u0151"],
      ["hosok", "h\u0151s\xF6k"],
      ["utonallo", "\xFAton\xE1ll\xF3"],
      ["kiralyi", "kir\xE1lyi"],
      ["szep", "sz\xE9p"],
      ["jo", "j\xF3"],
      ["rossz", "rossz"],
      ["nagy", "nagy"],
      ["kicsi", "kicsi"]
    ]);
    this.dictionary.loadDictionary("de", [
      ["schon", "sch\xF6n"],
      ["uber", "\xFCber"],
      ["fur", "f\xFCr"],
      ["grun", "gr\xFCn"],
      ["blau", "blau"],
      ["rot", "rot"],
      ["gelb", "gelb"],
      ["weiss", "wei\xDF"],
      ["schwarz", "schwarz"],
      ["mutter", "Mutter"],
      ["vater", "Vater"],
      ["bruder", "Bruder"]
    ]);
    this.dictionary.loadDictionary("pl", [
      ["zloty", "z\u0142oty"],
      ["srebro", "srebro"],
      ["wegiel", "w\u0119giel"],
      ["zolty", "\u017C\xF3\u0142ty"],
      ["zielony", "zielony"],
      ["czerwony", "czerwony"],
      ["niebieski", "niebieski"],
      ["czarny", "czarny"],
      ["bialy", "bia\u0142y"],
      ["dziekuje", "dzi\u0119kuj\u0119"],
      ["prosze", "prosz\u0119"],
      ["przepraszam", "przepraszam"],
      ["tak", "tak"],
      ["nie", "nie"],
      ["moze", "mo\u017Ce"],
      ["tylko", "tylko"]
    ]);
  }
  /**
   * Preload a specific language dictionary
   */
  preloadLanguage(language) {
    if (!this.dictionary.isLoaded(language)) {
      console.log(`Loading dictionary for language: ${language}`);
    }
  }
  /**
   * Detect language of input text
   */
  detectLanguage(text, confidenceThreshold = 0.3) {
    return this.detector.detect(text, confidenceThreshold);
  }
  /**
   * Restore accents in text
   */
  restoreAccents(text, options = {}) {
    const {
      language,
      confidenceThreshold = 0.3,
      enablePartialMatch = true,
      enableCache = true
    } = options;
    let detectedLang;
    if (language) {
      detectedLang = language;
    } else {
      const detection = this.detector.detect(text, confidenceThreshold);
      if (detection.confidence < confidenceThreshold) {
        console.warn(`Low confidence detection: ${detection.confidence.toFixed(2)} for ${detection.language}`);
      }
      detectedLang = detection.language;
    }
    if (!this.dictionary.isLoaded(detectedLang)) {
      console.warn(`Dictionary for ${detectedLang} not loaded`);
      return text;
    }
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
  clearCache() {
    this.dictionary.clearCache();
  }
  /**
   * Get statistics
   */
  getStats() {
    return {
      loadedLanguages: Array.from(LANGUAGE_SIGNATURES.keys()).filter(
        (lang) => this.dictionary.isLoaded(lang)
      ),
      cacheSize: this.dictionary["cache"].size
    };
  }
};

// src/extension.ts
function activate(context) {
  let CommandId;
  ((CommandId2) => {
    CommandId2["ReportIssue"] = "ps-replace-accents.reportIssue";
    CommandId2["ReplaceAccents"] = "ps-replace-accents.replaceAccents";
    CommandId2["ReplaceAccentsFileOrFolder"] = "ps-replace-accents.replaceAccentsFileOrFolder";
    CommandId2["RestoreAccents"] = "ps-replace-accents.restoreAccents";
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
  const replaceAccentsFileOrFolder = async (uri, userMappings) => {
    const oldPath = uri.fsPath;
    const itemName = path.basename(oldPath);
    const parentPath = path.dirname(oldPath);
    const itemNameWithoutAccent = replaceAccents(itemName, userMappings);
    if (itemNameWithoutAccent.trim().length === 0) {
      return;
    }
    if (itemName === itemNameWithoutAccent) {
      vscode2.window.showWarningMessage(
        vscode2.l10n.t("No diacritics were removed from '{0}'.", itemName)
      );
      return;
    }
    const newPath = path.join(parentPath, itemNameWithoutAccent);
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
    ["ps-replace-accents.reportIssue" /* ReportIssue */]: () => vscode2.env.openExternal(vscode2.Uri.parse("https://github.com/playfulsparkle/vscode_ps_replace_accents/issues")),
    ["ps-replace-accents.replaceAccents" /* ReplaceAccents */]: async () => {
      const userMappings = vscode2.workspace.getConfiguration("ps-replace-accents").get("specialCharacterMappings", {});
      const userMappingsErrors = validateSpecialCharacterMappings(userMappings);
      if (userMappingsErrors) {
        vscode2.window.showErrorMessage(userMappingsErrors);
        return;
      }
      const allSelectionsEmpty = await processTextInEditor((text) => replaceAccents(text, userMappings));
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
    ["ps-replace-accents.replaceAccentsFileOrFolder" /* ReplaceAccentsFileOrFolder */]: async (uri, selectedUris) => {
      if (!uri) {
        return;
      }
      const userMappings = vscode2.workspace.getConfiguration("ps-replace-accents").get("specialCharacterMappings", {});
      const userMappingsErrors = validateSpecialCharacterMappings(userMappings);
      if (userMappingsErrors) {
        vscode2.window.showErrorMessage(userMappingsErrors);
        return;
      }
      const urisToRename = selectedUris && selectedUris.length > 0 ? selectedUris : [uri];
      for (const currentUri of urisToRename) {
        await replaceAccentsFileOrFolder(currentUri, userMappings);
      }
      if (urisToRename.length > 1) {
        vscode2.window.showInformationMessage(
          vscode2.l10n.t("Diacritics removed from {0} items.", urisToRename.length)
        );
      }
    },
    ["ps-replace-accents.restoreAccents" /* RestoreAccents */]: async () => {
      const accentSystem = new AccentRestorationSystem();
      await processTextInEditor((text) => accentSystem.restoreAccents(text));
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
