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
function searchAndReplaceCaseSensitive(original, restored, characterMappings) {
  if (!original || !restored) {
    return restored;
  }
  if (characterMappings && original.length !== restored.length) {
    return applyCasePatternWithAlignment(original, restored, characterMappings);
  }
  return applyCasePattern(original, restored);
}
function applyCasePatternWithAlignment(original, restored, characterMappings) {
  const reverseMappings = {};
  for (const [diacritic, ascii] of Object.entries(characterMappings)) {
    if (!reverseMappings[ascii] || ascii.length > reverseMappings[ascii].length) {
      reverseMappings[ascii] = diacritic;
    }
  }
  let alignedOriginal = original;
  let alignedRestored = restored;
  for (const [ascii, diacritic] of Object.entries(reverseMappings)) {
    if (ascii.length > 1) {
      alignedOriginal = alignedOriginal.replace(new RegExp(ascii, "gi"), diacritic);
    }
  }
  return applyCasePattern(alignedOriginal, alignedRestored);
}
function applyCasePattern(original, restored) {
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
      return vscode.l10n.t("Invalid key: '{key}'. Keys must be single characters.", { key });
    }
    if (typeof value !== "string") {
      return vscode.l10n.t("Invalid value for key '{key}': '{value}'. Values must be strings.", { key, value });
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

// src/characterMappings.ts
var languageCharacterMappings = [
  {
    language: "czech",
    letters: [
      { letter: "\xE1", ascii: "a" },
      { letter: "\xC1", ascii: "A" },
      { letter: "\u010D", ascii: "c" },
      { letter: "\u010C", ascii: "C" },
      { letter: "\u010F", ascii: "d" },
      { letter: "\u010E", ascii: "D" },
      { letter: "\xE9", ascii: "e" },
      { letter: "\xC9", ascii: "E" },
      { letter: "\u011B", ascii: "e" },
      { letter: "\u011A", ascii: "E" },
      { letter: "\xED", ascii: "i" },
      { letter: "\xCD", ascii: "I" },
      { letter: "\u0148", ascii: "n" },
      { letter: "\u0147", ascii: "N" },
      { letter: "\xF3", ascii: "o" },
      { letter: "\xD3", ascii: "O" },
      { letter: "\u0159", ascii: "r" },
      { letter: "\u0158", ascii: "R" },
      { letter: "\u0161", ascii: "s" },
      { letter: "\u0160", ascii: "S" },
      { letter: "\u0165", ascii: "t" },
      { letter: "\u0164", ascii: "T" },
      { letter: "\xFA", ascii: "u" },
      { letter: "\xDA", ascii: "U" },
      { letter: "\u016F", ascii: "u" },
      { letter: "\u016E", ascii: "U" },
      { letter: "\xFD", ascii: "y" },
      { letter: "\xDD", ascii: "Y" },
      { letter: "\u017E", ascii: "z" },
      { letter: "\u017D", ascii: "Z" }
    ]
  },
  {
    language: "danish",
    letters: [
      { letter: "\xE6", ascii: "ae" },
      { letter: "\xC6", ascii: "Ae" },
      { letter: "\xF8", ascii: "oe" },
      { letter: "\xD8", ascii: "Oe" },
      { letter: "\xE5", ascii: "aa" },
      { letter: "\xC5", ascii: "Aa" }
    ]
  },
  {
    language: "french",
    letters: [
      { letter: "\xE0", ascii: "a" },
      { letter: "\xC0", ascii: "A" },
      { letter: "\xE2", ascii: "a" },
      { letter: "\xC2", ascii: "A" },
      { letter: "\xE4", ascii: "a" },
      { letter: "\xC4", ascii: "A" },
      { letter: "\xE6", ascii: "ae" },
      { letter: "\xC6", ascii: "Ae" },
      { letter: "\xE7", ascii: "c" },
      { letter: "\xC7", ascii: "C" },
      { letter: "\xE9", ascii: "e" },
      { letter: "\xC9", ascii: "E" },
      { letter: "\xE8", ascii: "e" },
      { letter: "\xC8", ascii: "E" },
      { letter: "\xEA", ascii: "e" },
      { letter: "\xCA", ascii: "E" },
      { letter: "\xEB", ascii: "e" },
      { letter: "\xCB", ascii: "E" },
      { letter: "\xEF", ascii: "i" },
      { letter: "\xCF", ascii: "I" },
      { letter: "\xEE", ascii: "i" },
      { letter: "\xCE", ascii: "I" },
      { letter: "\xF4", ascii: "o" },
      { letter: "\xD4", ascii: "O" },
      { letter: "\xF6", ascii: "o" },
      { letter: "\xD6", ascii: "O" },
      { letter: "\u0153", ascii: "oe" },
      { letter: "\u0152", ascii: "Oe" },
      { letter: "\xF9", ascii: "u" },
      { letter: "\xD9", ascii: "U" },
      { letter: "\xFB", ascii: "u" },
      { letter: "\xDB", ascii: "U" },
      { letter: "\xFC", ascii: "u" },
      { letter: "\xDC", ascii: "U" },
      { letter: "\xFF", ascii: "y" },
      { letter: "\u0178", ascii: "Y" }
    ]
  },
  {
    language: "german",
    letters: [
      { letter: "\xE4", ascii: "ae" },
      { letter: "\xC4", ascii: "Ae" },
      { letter: "\xF6", ascii: "oe" },
      { letter: "\xD6", ascii: "Oe" },
      { letter: "\xFC", ascii: "ue" },
      { letter: "\xDC", ascii: "Ue" },
      { letter: "\xDF", ascii: "ss" },
      { letter: "\u1E9E", ascii: "SS" }
    ]
  },
  {
    language: "hungarian",
    letters: [
      { letter: "\xE1", ascii: "a" },
      { letter: "\xC1", ascii: "A" },
      { letter: "\xE9", ascii: "e" },
      { letter: "\xC9", ascii: "E" },
      { letter: "\xED", ascii: "i" },
      { letter: "\xCD", ascii: "I" },
      { letter: "\xF3", ascii: "o" },
      { letter: "\xD3", ascii: "O" },
      { letter: "\xF6", ascii: "o" },
      { letter: "\xD6", ascii: "O" },
      { letter: "\u0151", ascii: "o" },
      { letter: "\u0150", ascii: "O" },
      { letter: "\xFA", ascii: "u" },
      { letter: "\xDA", ascii: "U" },
      { letter: "\xFC", ascii: "u" },
      { letter: "\xDC", ascii: "U" },
      { letter: "\u0171", ascii: "u" },
      { letter: "\u0170", ascii: "U" }
    ]
  },
  {
    language: "polish",
    letters: [
      { letter: "\u0105", ascii: "a" },
      { letter: "\u0104", ascii: "A" },
      { letter: "\u0107", ascii: "c" },
      { letter: "\u0106", ascii: "C" },
      { letter: "\u0119", ascii: "e" },
      { letter: "\u0118", ascii: "E" },
      { letter: "\u0142", ascii: "l" },
      { letter: "\u0141", ascii: "L" },
      { letter: "\u0144", ascii: "n" },
      { letter: "\u0143", ascii: "N" },
      { letter: "\xF3", ascii: "o" },
      { letter: "\xD3", ascii: "O" },
      { letter: "\u015B", ascii: "s" },
      { letter: "\u015A", ascii: "S" },
      { letter: "\u017A", ascii: "z" },
      { letter: "\u0179", ascii: "Z" },
      { letter: "\u017C", ascii: "z" },
      { letter: "\u017B", ascii: "Z" }
    ]
  },
  {
    language: "slovak",
    letters: [
      { letter: "\xE1", ascii: "a" },
      { letter: "\xC1", ascii: "A" },
      { letter: "\xE4", ascii: "a" },
      { letter: "\xC4", ascii: "A" },
      { letter: "\u010D", ascii: "c" },
      { letter: "\u010C", ascii: "C" },
      { letter: "\u010F", ascii: "d" },
      { letter: "\u010E", ascii: "D" },
      { letter: "\xE9", ascii: "e" },
      { letter: "\xC9", ascii: "E" },
      { letter: "\xED", ascii: "i" },
      { letter: "\xCD", ascii: "I" },
      { letter: "\u013E", ascii: "l" },
      { letter: "\u013D", ascii: "L" },
      { letter: "\u013A", ascii: "l" },
      { letter: "\u0139", ascii: "L" },
      { letter: "\u0148", ascii: "n" },
      { letter: "\u0147", ascii: "N" },
      { letter: "\xF3", ascii: "o" },
      { letter: "\xD3", ascii: "O" },
      { letter: "\xF4", ascii: "o" },
      { letter: "\xD4", ascii: "O" },
      { letter: "\u0155", ascii: "r" },
      { letter: "\u0154", ascii: "R" },
      { letter: "\u0161", ascii: "s" },
      { letter: "\u0160", ascii: "S" },
      { letter: "\u0165", ascii: "t" },
      { letter: "\u0164", ascii: "T" },
      { letter: "\xFA", ascii: "u" },
      { letter: "\xDA", ascii: "U" },
      { letter: "\xFD", ascii: "y" },
      { letter: "\xDD", ascii: "Y" },
      { letter: "\u017E", ascii: "z" },
      { letter: "\u017D", ascii: "Z" }
    ]
  },
  {
    language: "spanish",
    letters: [
      { letter: "\xE1", ascii: "a" },
      { letter: "\xC1", ascii: "A" },
      { letter: "\xE9", ascii: "e" },
      { letter: "\xC9", ascii: "E" },
      { letter: "\xED", ascii: "i" },
      { letter: "\xCD", ascii: "I" },
      { letter: "\xF3", ascii: "o" },
      { letter: "\xD3", ascii: "O" },
      { letter: "\xFA", ascii: "u" },
      { letter: "\xDA", ascii: "U" },
      { letter: "\xFC", ascii: "u" },
      { letter: "\xDC", ascii: "U" },
      { letter: "\xF1", ascii: "n" },
      { letter: "\xD1", ascii: "N" }
    ]
  },
  {
    language: "swedish",
    letters: [
      { letter: "\xE5", ascii: "aa" },
      { letter: "\xC5", ascii: "Aa" },
      { letter: "\xE4", ascii: "ae" },
      { letter: "\xC4", ascii: "Ae" },
      { letter: "\xF6", ascii: "oe" },
      { letter: "\xD6", ascii: "Oe" }
    ]
  },
  {
    language: "portuguese",
    letters: [
      { letter: "\xE1", ascii: "a" },
      { letter: "\xC1", ascii: "A" },
      { letter: "\xE2", ascii: "a" },
      { letter: "\xC2", ascii: "A" },
      { letter: "\xE3", ascii: "a" },
      { letter: "\xC3", ascii: "A" },
      { letter: "\xE0", ascii: "a" },
      { letter: "\xC0", ascii: "A" },
      { letter: "\xE9", ascii: "e" },
      { letter: "\xC9", ascii: "E" },
      { letter: "\xEA", ascii: "e" },
      { letter: "\xCA", ascii: "E" },
      { letter: "\xED", ascii: "i" },
      { letter: "\xCD", ascii: "I" },
      { letter: "\xF3", ascii: "o" },
      { letter: "\xD3", ascii: "O" },
      { letter: "\xF4", ascii: "o" },
      { letter: "\xD4", ascii: "O" },
      { letter: "\xF5", ascii: "o" },
      { letter: "\xD5", ascii: "O" },
      { letter: "\xFA", ascii: "u" },
      { letter: "\xDA", ascii: "U" },
      { letter: "\xE7", ascii: "c" },
      { letter: "\xC7", ascii: "C" }
    ]
  },
  {
    language: "italian",
    letters: [
      { letter: "\xE0", ascii: "a" },
      { letter: "\xC0", ascii: "A" },
      { letter: "\xE8", ascii: "e" },
      { letter: "\xC8", ascii: "E" },
      { letter: "\xE9", ascii: "e" },
      { letter: "\xC9", ascii: "E" },
      { letter: "\xEC", ascii: "i" },
      { letter: "\xCC", ascii: "I" },
      { letter: "\xF2", ascii: "o" },
      { letter: "\xD2", ascii: "O" },
      { letter: "\xF3", ascii: "o" },
      { letter: "\xD3", ascii: "O" },
      { letter: "\xF9", ascii: "u" },
      { letter: "\xD9", ascii: "U" }
    ]
  },
  {
    language: "norwegian",
    letters: [
      { letter: "\xE6", ascii: "ae" },
      { letter: "\xC6", ascii: "Ae" },
      { letter: "\xF8", ascii: "oe" },
      { letter: "\xD8", ascii: "Oe" },
      { letter: "\xE5", ascii: "aa" },
      { letter: "\xC5", ascii: "Aa" }
    ]
  },
  {
    language: "icelandic",
    letters: [
      { letter: "\xE1", ascii: "a" },
      { letter: "\xC1", ascii: "A" },
      { letter: "\xE9", ascii: "e" },
      { letter: "\xC9", ascii: "E" },
      { letter: "\xED", ascii: "i" },
      { letter: "\xCD", ascii: "I" },
      { letter: "\xF3", ascii: "o" },
      { letter: "\xD3", ascii: "O" },
      { letter: "\xFA", ascii: "u" },
      { letter: "\xDA", ascii: "U" },
      { letter: "\xFD", ascii: "y" },
      { letter: "\xDD", ascii: "Y" },
      { letter: "\xF0", ascii: "d" },
      { letter: "\xD0", ascii: "D" },
      { letter: "\xFE", ascii: "th" },
      { letter: "\xDE", ascii: "Th" },
      { letter: "\xE6", ascii: "ae" },
      { letter: "\xC6", ascii: "Ae" },
      { letter: "\xF6", ascii: "o" },
      { letter: "\xD6", ascii: "O" }
    ]
  },
  {
    language: "dutch",
    letters: [
      { letter: "\xE1", ascii: "a" },
      { letter: "\xC1", ascii: "A" },
      { letter: "\xE9", ascii: "e" },
      { letter: "\xC9", ascii: "E" },
      { letter: "\xEB", ascii: "e" },
      { letter: "\xCB", ascii: "E" },
      { letter: "\xED", ascii: "i" },
      { letter: "\xCD", ascii: "I" },
      { letter: "\xEF", ascii: "i" },
      { letter: "\xCF", ascii: "I" },
      { letter: "\xF3", ascii: "o" },
      { letter: "\xD3", ascii: "O" },
      { letter: "\xF6", ascii: "o" },
      { letter: "\xD6", ascii: "O" },
      { letter: "\xFA", ascii: "u" },
      { letter: "\xDA", ascii: "U" },
      { letter: "\xFC", ascii: "u" },
      { letter: "\xDC", ascii: "U" }
    ]
  },
  {
    language: "croatian",
    letters: [
      { letter: "\u010D", ascii: "c" },
      { letter: "\u010C", ascii: "C" },
      { letter: "\u0107", ascii: "c" },
      { letter: "\u0106", ascii: "C" },
      { letter: "\u0111", ascii: "d" },
      { letter: "\u0110", ascii: "D" },
      { letter: "\u0161", ascii: "s" },
      { letter: "\u0160", ascii: "S" },
      { letter: "\u017E", ascii: "z" },
      { letter: "\u017D", ascii: "Z" }
    ]
  },
  {
    language: "slovenian",
    letters: [
      { letter: "\u010D", ascii: "c" },
      { letter: "\u010C", ascii: "C" },
      { letter: "\u0161", ascii: "s" },
      { letter: "\u0160", ascii: "S" },
      { letter: "\u017E", ascii: "z" },
      { letter: "\u017D", ascii: "Z" }
    ]
  },
  {
    language: "romanian",
    letters: [
      { letter: "\u0103", ascii: "a" },
      { letter: "\u0102", ascii: "A" },
      { letter: "\xE2", ascii: "a" },
      { letter: "\xC2", ascii: "A" },
      { letter: "\xEE", ascii: "i" },
      { letter: "\xCE", ascii: "I" },
      { letter: "\u0219", ascii: "s" },
      { letter: "\u0218", ascii: "S" },
      { letter: "\u0163", ascii: "t" },
      { letter: "\u0162", ascii: "T" },
      { letter: "\u021B", ascii: "t" },
      { letter: "\u021A", ascii: "T" }
    ]
  },
  {
    language: "lithuanian",
    letters: [
      { letter: "\u0105", ascii: "a" },
      { letter: "\u0104", ascii: "A" },
      { letter: "\u010D", ascii: "c" },
      { letter: "\u010C", ascii: "C" },
      { letter: "\u0119", ascii: "e" },
      { letter: "\u0118", ascii: "E" },
      { letter: "\u0117", ascii: "e" },
      { letter: "\u0116", ascii: "E" },
      { letter: "\u012F", ascii: "i" },
      { letter: "\u012E", ascii: "I" },
      { letter: "\u0161", ascii: "s" },
      { letter: "\u0160", ascii: "S" },
      { letter: "\u0173", ascii: "u" },
      { letter: "\u0172", ascii: "U" },
      { letter: "\u016B", ascii: "u" },
      { letter: "\u016A", ascii: "U" },
      { letter: "\u017E", ascii: "z" },
      { letter: "\u017D", ascii: "Z" }
    ]
  },
  {
    language: "latvian",
    letters: [
      { letter: "\u0101", ascii: "a" },
      { letter: "\u0100", ascii: "A" },
      { letter: "\u010D", ascii: "c" },
      { letter: "\u010C", ascii: "C" },
      { letter: "\u0113", ascii: "e" },
      { letter: "\u0112", ascii: "E" },
      { letter: "\u0123", ascii: "g" },
      { letter: "\u0122", ascii: "G" },
      { letter: "\u012B", ascii: "i" },
      { letter: "\u012A", ascii: "I" },
      { letter: "\u0137", ascii: "k" },
      { letter: "\u0136", ascii: "K" },
      { letter: "\u013C", ascii: "l" },
      { letter: "\u013B", ascii: "L" },
      { letter: "\u0146", ascii: "n" },
      { letter: "\u0145", ascii: "N" },
      { letter: "\u0161", ascii: "s" },
      { letter: "\u0160", ascii: "S" },
      { letter: "\u016B", ascii: "u" },
      { letter: "\u016A", ascii: "U" },
      { letter: "\u017E", ascii: "z" },
      { letter: "\u017D", ascii: "Z" }
    ]
  }
];
var allLanguageCharacterMappings = Object.fromEntries(
  languageCharacterMappings.flatMap((lang) => lang.letters.map((o) => [o.letter, o.ascii]))
);

// src/restoreDiacritic.ts
var DiacriticRestorer = class _DiacriticRestorer {
  /**
   * Main dictionary storage mapping base forms to possible diacritic variations
   * Stored as arrays sorted by frequency (descending - most frequent first)
   * 
   * @type {Map<string, DictionaryEntry[]>}
   * @private
   */
  dictionary = /* @__PURE__ */ new Map();
  /**
   * Language-specific character mappings for the currently active language
   * 
   * Contains the complete set of special characters and their ASCII equivalents
   * for the current language. This is used to handle language-specific diacritics
   * and special characters that aren't covered by standard Unicode normalization.
   * 
   * @private
   * @type {LanguageLetters | undefined}
   */
  currentMappings;
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
   * Minimum stem length for suffix matching (default: 2)
   * 
   * @type {number}
   * @private
   */
  minSuffixStemLength;
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
   * @param {number} [minSuffixStemLength=2] - Minimum stem length for suffix matching
   * 
   * @throws {Error} If language is not provided
   */
  constructor(language, ignoredWords = [], enableSuffixMatching = false, minSuffixStemLength = 2) {
    if (!language) {
      throw new Error("Language parameter is required");
    }
    this.currentLanguage = language;
    this.enableSuffixMatching = enableSuffixMatching;
    this.minSuffixStemLength = minSuffixStemLength;
    this.currentMappings = language ? languageCharacterMappings.find((lang) => lang.language === language) : void 0;
    this.ignoredWords = new Set(
      ignoredWords.map((word) => this.removeDiacritics(word.toLowerCase()))
    );
    this.dictionaryBasePath = path.join(__dirname, "dictionary");
  }
  /**
   * Gets the allMappings object computed from currentMappings
   * Computed on demand to save memory
   * 
   * @private
   */
  getAllMappings() {
    if (!this.currentMappings) {
      return {};
    }
    return Object.fromEntries(
      this.currentMappings.letters.map((o) => [o.letter, o.ascii])
    );
  }
  /**
   * Gets the special characters pattern computed from currentMappings
   * Computed on demand to save memory
   * 
   * @private
   */
  getSpecialCharsPattern() {
    if (!this.currentMappings?.letters.length) {
      return void 0;
    }
    const specialChars = this.currentMappings.letters.map((o) => o.letter).map((char) => char).join("");
    return new RegExp(`[${specialChars}]`, "g");
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
   * Uses optimized insertion sort for memory efficiency
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
    for (let i = 0; i < lines.length; i++) {
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
        const baseForm = this.removeDiacritics(word);
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
          if (entries[mid].frequency >= frequency) {
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
      const lowerWord = word.toLowerCase();
      const baseForm = this.removeDiacritics(lowerWord);
      if (this.ignoredWords.has(baseForm)) {
        this.addToCache(word, word);
        return word;
      }
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
   * @param {string} lowerWord - Pre-computed lowercase version
   * @param {string} baseForm - Pre-computed normalized base form
   * 
   * @returns {string | null} Best matching word with diacritics, or null if no match found
   */
  findBestMatch(word, lowerWord, baseForm) {
    const candidates = this.dictionary.get(baseForm);
    if (!candidates || candidates.length === 0) {
      if (this.enableSuffixMatching) {
        return this.findSuffixMatch(word, lowerWord, baseForm);
      }
      return null;
    }
    const bestMatch = candidates[0].word;
    const mappings = this.getAllMappings();
    return searchAndReplaceCaseSensitive(word, bestMatch, mappings);
  }
  /**
   * Attempts to match inflected word forms by progressively shortening the stem
   * 
   * Optimized to check larger stems first (more likely to match)
   * 
   * @private
   * @param {string} word - Original word
   * @param {string} lowerWord - Pre-computed lowercase version
   * @param {string} normalizedBase - Normalized base form
   * 
   * @returns {string | null} Reconstructed word with diacritics, or null if no match
   */
  findSuffixMatch(word, lowerWord, normalizedBase) {
    const wordLen = normalizedBase.length;
    const minStemLen = Math.max(this.minSuffixStemLength, Math.floor(wordLen * 0.6));
    for (let stemLen = wordLen - 1; stemLen >= minStemLen; stemLen--) {
      const stem = normalizedBase.substring(0, stemLen);
      const candidates = this.dictionary.get(stem);
      if (candidates && candidates.length > 0) {
        const bestStem = candidates[0].word;
        const suffix = lowerWord.substring(stemLen);
        const reconstructed = bestStem + suffix;
        return searchAndReplaceCaseSensitive(word, reconstructed);
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
   * @param {string} text - Input text with potential diacritics
   * 
   * @returns {string} Normalized text without diacritics
   */
  removeDiacritics(text) {
    if (!text || typeof text !== "string") {
      return text;
    }
    let normalized = text.normalize("NFKD").replace(diacriticRegex, "");
    const specialCharsPattern = this.getSpecialCharsPattern();
    if (!specialCharsPattern) {
      return normalized;
    }
    const allMappings = this.getAllMappings();
    return normalized.replace(
      specialCharsPattern,
      (match) => allMappings[match] ?? match
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
    this.currentMappings = void 0;
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
      if (Object.keys(combinedMappings).length === 0) {
        return this.normalize(text);
      }
      const specialChars = Object.keys(combinedMappings).map((letter) => letter).join("");
      const customPattern = new RegExp(`[${specialChars}]`, "g");
      const result = text.replace(customPattern, (match) => {
        const replacement = combinedMappings[match];
        return searchAndReplaceCaseSensitive(match, replacement);
      });
      return this.normalize(result);
    } catch (error) {
      console.error("Error in removeDiacritics:", error);
      return text;
    }
  }
  normalize(str) {
    return str.normalize("NFKD").replace(diacriticRegex, "");
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
      return 0 /* None */;
    }
    let modified = false;
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
      const processedText = text.length > 0 ? transformFn(text, options) : "";
      if (text !== processedText) {
        await editor.edit((editBuilder) => editBuilder.replace(entireDocumentRange, processedText));
        modified = true;
      }
      if (modified) {
        return 2 /* DocumentModified */;
      }
      return 0 /* None */;
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
        const processedText = selectedText.length > 0 ? transformFn(selectedText, options) : "";
        if (selectedText !== processedText) {
          editBuilder.replace(rangeToProcess, processedText);
          modified = true;
        }
      }
    });
    if (modified) {
      return 1 /* SelectionModified */;
    }
    return 0 /* None */;
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
      const result = await processTextInEditor((text) => remover.removeDiacritics(text, userMappings));
      switch (result) {
        case 1 /* SelectionModified */:
          vscode2.window.showInformationMessage(vscode2.l10n.t("Removed diacritics in selection."));
          break;
        case 2 /* DocumentModified */:
          vscode2.window.showInformationMessage(vscode2.l10n.t("Removed diacritics in document."));
          break;
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
      const result = await processTextInEditor((text) => restorer.restoreDiacritics(text));
      restorer.dispose();
      switch (result) {
        case 1 /* SelectionModified */:
          vscode2.window.showInformationMessage(vscode2.l10n.t("Restored diacritics in selection."));
          break;
        case 2 /* DocumentModified */:
          vscode2.window.showInformationMessage(vscode2.l10n.t("Restored diacritics in document."));
          break;
      }
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
