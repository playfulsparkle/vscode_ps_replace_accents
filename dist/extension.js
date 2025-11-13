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
function normalizeText(str) {
  return str.normalize("NFKD").replace(diacriticRegex, "");
}
function searchAndReplaceCaseSensitive(original, restored, characterMappings) {
  if (!original || !restored) {
    return restored;
  }
  if (characterMappings && Object.keys(characterMappings).length > 0) {
    return applyCasePatternWithMappings(original, restored, characterMappings);
  }
  return applyCasePattern(original, restored);
}
function applyCasePatternWithMappings(original, restored, characterMappings) {
  const origLen = original.length;
  const restLen = restored.length;
  const result = new Array(restLen);
  let i = 0;
  let j = 0;
  while (i < origLen && j < restLen) {
    if (i + 1 < origLen) {
      const twoChar = original.substring(i, i + 2);
      const diacritic = characterMappings[twoChar];
      if (diacritic && diacritic === restored[j]) {
        const restoredChar2 = restored[j];
        result[j] = twoChar[0] === twoChar[0].toUpperCase() ? restoredChar2.toUpperCase() : restoredChar2.toLowerCase();
        i += 2;
        j++;
        continue;
      }
    }
    const origChar = original[i];
    const restoredChar = restored[j];
    result[j] = origChar === origChar.toUpperCase() ? restoredChar.toUpperCase() : restoredChar.toLowerCase();
    i++;
    j++;
  }
  return result.join("");
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

// src/restoreDiacritic.ts
var DiacriticRestorer = class _DiacriticRestorer {
  /**
  * Main dictionary storage mapping base forms to possible diacritic variations
  * Stored as arrays sorted by frequency (descending - most frequent first)
  *
  * @private
  *
  * @type {Map<string, DictionaryEntry[]>}
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
  *
  * @type {LanguageLetters | undefined}
  */
  currentMappings;
  /**
  * Set of words to ignore during restoration (in normalized form)
  *
  * @private
  *
  * @type {Set<string>}
  */
  ignoredWords;
  /**
  * Currently active language code (e.g., 'hu', 'fr', 'es')
  *
  * @private
  *
  * @type {string | undefined}
  */
  currentLanguage;
  /**
  * Indicates whether the dictionary is loaded and ready for use
  *
  * @private
  *
  * @type {boolean}
  */
  isReady = false;
  /**
  * Base file system path where dictionary files are stored
  *
  * @private
  *
  * @type {string}
  */
  dictionaryBasePath;
  /**
  * LRU cache for restoration results to improve performance
  *
  * @private
  *
  * @type {Map<string, string>}
  */
  restorationCache = /* @__PURE__ */ new Map();
  /**
  * Maximum number of entries to store in the restoration cache
  *
  * @private
  * @readonly
  *
  * @type {number}
  */
  MAX_CACHE_SIZE = 1e3;
  /**
  * Whether to enable suffix matching for inflected word forms
  *
  * @private
  *
  * @type {boolean}
  */
  enableSuffixMatching;
  /**
  * Minimum stem length for suffix matching (default: 2)
  *
  * @private
  *
  * @type {number}
  */
  minSuffixStemLength;
  /**
  * Cached regex pattern for identifying words (including Unicode letters and combining marks)
  * Matches: Unicode letters, combining marks, apostrophes, and hyphens
  *
  * @static
  * @readonly
  *
  * @type {RegExp}
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
  getAllMappings(reversed = false) {
    if (!this.currentMappings) {
      return {};
    }
    return Object.fromEntries(
      this.currentMappings.letters.map((o) => reversed ? [o.ascii, o.letter] : [o.letter, o.ascii])
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
  async initialize() {
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
  *
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
  *
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
  *
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
  findSuffixMatch(word, lowerWord, normalizedBase) {
    const wordLen = normalizedBase.length;
    const mappings = this.getAllMappings(true);
    const minStemLen = Math.max(this.minSuffixStemLength, Math.floor(wordLen * 0.6));
    for (let stemLen = wordLen - 1; stemLen >= minStemLen; stemLen--) {
      const stem = normalizedBase.substring(0, stemLen);
      const candidates = this.dictionary.get(stem);
      if (candidates && candidates.length > 0) {
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
  removeDiacritics(text) {
    if (!text || typeof text !== "string") {
      return text;
    }
    const allMappings = this.getAllMappings();
    if (Object.keys(allMappings).length === 0) {
      return normalizeText(text);
    }
    const specialCharsPattern = this.getSpecialCharsPattern();
    if (!specialCharsPattern) {
      return normalizeText(text);
    }
    let result = text.replace(
      specialCharsPattern,
      (match) => allMappings[match] ?? match
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
  * Currently active language code (e.g., 'hu', 'fr', 'es')
  *
  * @private
  *
  * @type {string | undefined}
  */
  currentLanguage;
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
  currentMappings;
  /**
  * Creates a new DiacriticRemover instance
  *
  * @param {string} language - Language code for dictionary loading (e.g., 'hu', 'fr')
  *
  * @throws {Error} If language is not provided
  */
  constructor(language = void 0, userCharacterMappings = {}) {
    this.currentLanguage = language;
    const languageMappings = language ? languageCharacterMappings.find((lang) => lang.language === language) : void 0;
    const userLetters = Object.entries(userCharacterMappings).map(
      ([letter, ascii]) => ({ letter, ascii })
    );
    if (languageMappings) {
      this.currentMappings = {
        language: languageMappings.language,
        letters: [...languageMappings.letters, ...userLetters]
      };
    } else {
      this.currentMappings = {
        language: "",
        letters: userLetters
      };
    }
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
  * @returns {{[key: string]: string}} Object containing character mappings
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
    return new RegExp(`[${specialChars}]`, "gu");
  }
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
  removeDiacritics(text) {
    if (!text || typeof text !== "string") {
      return text;
    }
    const allMappings = this.getAllMappings();
    if (Object.keys(allMappings).length === 0) {
      return normalizeText(text);
    }
    const specialCharsPattern = this.getSpecialCharsPattern();
    if (!specialCharsPattern) {
      return normalizeText(text);
    }
    let result = text.replace(
      specialCharsPattern,
      (match) => allMappings[match] ?? match
    );
    return normalizeText(result);
  }
};
var removeDiacritic_default = DiacriticRemover;

// src/languageDetector.ts
var LanguageDetector = class {
  /** Array of supported language codes */
  SUPPORTED_LANGUAGES = [
    "czech",
    "danish",
    "french",
    "german",
    "hungarian",
    "polish",
    "slovak",
    "spanish",
    "swedish",
    "portuguese",
    "italian",
    "norwegian",
    "icelandic",
    "dutch",
    "croatian",
    "slovenian",
    "romanian",
    "lithuanian",
    "latvian"
  ];
  /** Minimum text length required for reliable detection */
  MIN_TEXT_LENGTH = 50;
  /** Minimum word count required for reliable detection */
  MIN_WORD_COUNT = 10;
  /** Confidence threshold for considering detection reliable */
  CONFIDENCE_THRESHOLD = 0.25;
  /** Character frequency profiles for supported languages */
  CHAR_FREQUENCIES = {
    polish: { "z": 0.065, "w": 0.045, "y": 0.038, "k": 0.035, "c": 0.04, "j": 0.023 },
    czech: { "v": 0.055, "k": 0.042, "p": 0.031, "t": 0.062, "o": 0.074, "e": 0.084 },
    slovak: { "o": 0.087, "a": 0.089, "e": 0.076, "v": 0.055, "k": 0.044, "n": 0.065 },
    german: { "e": 0.174, "n": 0.098, "r": 0.07, "s": 0.073, "i": 0.065, "t": 0.061 },
    french: { "e": 0.147, "s": 0.079, "a": 0.076, "i": 0.066, "t": 0.072, "n": 0.071 },
    spanish: { "e": 0.137, "a": 0.125, "o": 0.092, "s": 0.072, "n": 0.067, "l": 0.05 },
    italian: { "e": 0.118, "a": 0.117, "i": 0.101, "o": 0.098, "n": 0.069, "l": 0.065 },
    portuguese: { "a": 0.146, "e": 0.126, "o": 0.103, "s": 0.067, "r": 0.065, "d": 0.05 },
    hungarian: { "e": 0.098, "a": 0.088, "t": 0.071, "l": 0.051, "s": 0.057, "n": 0.055 },
    swedish: { "e": 0.1, "a": 0.095, "n": 0.085, "r": 0.084, "t": 0.078, "s": 0.065 },
    norwegian: { "e": 0.156, "r": 0.089, "n": 0.076, "t": 0.073, "a": 0.07, "s": 0.063 },
    danish: { "e": 0.155, "r": 0.089, "n": 0.073, "t": 0.07, "a": 0.06, "i": 0.06 },
    dutch: { "e": 0.189, "n": 0.1, "a": 0.076, "t": 0.069, "r": 0.064, "i": 0.065 },
    icelandic: { "a": 0.109, "r": 0.087, "n": 0.077, "i": 0.076, "u": 0.047, "s": 0.056 },
    croatian: { "a": 0.107, "i": 0.097, "o": 0.089, "e": 0.087, "n": 0.068, "j": 0.047 },
    slovenian: { "e": 0.105, "a": 0.089, "i": 0.088, "o": 0.079, "n": 0.065, "l": 0.048 },
    romanian: { "e": 0.109, "i": 0.108, "a": 0.107, "r": 0.066, "t": 0.059, "u": 0.062 },
    lithuanian: { "i": 0.09, "a": 0.087, "s": 0.062, "o": 0.06, "e": 0.056, "t": 0.051 },
    latvian: { "a": 0.107, "i": 0.09, "s": 0.074, "e": 0.072, "t": 0.061, "u": 0.048 }
  };
  /**
  * Creates a new LanguageDetector instance
  */
  constructor() {
  }
  /**
  * Detects the language of the provided text
  *
  * @param text - The text to analyze for language detection
  *
  * @returns Language detection result with confidence scores
  */
  detect(text) {
    if (!text || text.trim().length === 0) {
      return {
        language: "unknown",
        confidence: 0,
        scores: {},
        isReliable: false
      };
    }
    const trimmedText = text.trim();
    const wordCount = trimmedText.split(/\s+/).length;
    if (trimmedText.length < this.MIN_TEXT_LENGTH || wordCount < this.MIN_WORD_COUNT) {
      return {
        language: "unknown",
        confidence: 0,
        scores: {},
        isReliable: false,
        ambiguousLanguages: ["Text too short for reliable detection"]
      };
    }
    const scores = {};
    for (const language of this.SUPPORTED_LANGUAGES) {
      scores[language] = this.calculateLanguageScore(trimmedText, language);
    }
    this.disambiguateSimilarLanguages(scores, trimmedText);
    const sortedLanguages = Object.entries(scores).sort(([, a], [, b]) => b - a).filter(([, score]) => score > 0);
    if (sortedLanguages.length === 0) {
      return {
        language: "unknown",
        confidence: 0,
        scores,
        isReliable: false
      };
    }
    const [bestLang, bestScore] = sortedLanguages[0];
    const [secondLang, secondScore] = sortedLanguages[1] || [null, 0];
    const confidence = secondScore > 0 ? Math.min((bestScore - secondScore) / bestScore, 1) : bestScore > 0 ? 1 : 0;
    const isReliable = confidence >= this.CONFIDENCE_THRESHOLD;
    const ambiguousLanguages = sortedLanguages.slice(1, 4).filter(([, score]) => score > bestScore * 0.7).map(([lang]) => lang);
    return {
      language: bestLang,
      confidence,
      scores,
      isReliable,
      ambiguousLanguages: ambiguousLanguages.length > 0 ? ambiguousLanguages : void 0
    };
  }
  /**
  * Calculates a comprehensive language score using multiple linguistic features
  *
  * @private
  *
  * @param text - Text to analyze
  * @param language - Target language to score against
  *
  * @returns Numerical score representing language match confidence
  */
  calculateLanguageScore(text, language) {
    const words = text.toLowerCase().split(/\s+/).filter((w) => w.length > 0);
    if (words.length === 0) {
      return 0;
    }
    let score = 0;
    const stopwordScore = this.calculateStopwordRatio(words, language);
    score += stopwordScore * 150;
    const charFreqScore = this.analyzeCharacterFrequency(text, language);
    score += charFreqScore * 80;
    score += this.analyzeTrigrams(text, language) * 60;
    for (const word of words) {
      score += this.scoreWordPatterns(word, language) * 1.2;
      score += this.scoreWordStructure(word, language) * 0.9;
    }
    score += this.analyzeBigrams(text, language) * 40;
    score += this.applyNegativePatterns(words, language);
    score += this.checkLanguageSpecificMarkers(words, language) * 50;
    score += this.analyzeVowelConsonantPatterns(words, language) * 25;
    return Math.max(score, 0);
  }
  /**
  * Disambiguates between highly similar language pairs using specific linguistic markers
  *
  * @private
  *
  * @param scores - Current language scores to modify
  * @param text - Text being analyzed
  */
  disambiguateSimilarLanguages(scores, text) {
    const words = text.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
    if (scores["czech"] > 0 || scores["slovak"] > 0) {
      let czechBoost = 0;
      let slovakBoost = 0;
      for (const word of words) {
        if (/(ia|ie|iu)/.test(word)) {
          slovakBoost += 3;
        }
        if (/(krat|prav|vlast|robot)/.test(word)) {
          slovakBoost += 4;
        }
        if (/ovat$/.test(word)) {
          slovakBoost += 2;
        }
        if (/(vsetk|prist|buduci|minul)/.test(word)) {
          slovakBoost += 5;
        }
        if (/(ou|ej|uj)/.test(word)) {
          czechBoost += 3;
        }
        if (/(kdo|kde|proc|jake|ktery)/.test(word)) {
          czechBoost += 5;
        }
        if (/(budou|jsou|maji|mame|mate)/.test(word)) {
          czechBoost += 4;
        }
        if (/(prave|vsak|tedy|takze|protoze)/.test(word)) {
          czechBoost += 5;
        }
      }
      const slovakStops = ["som", "ste", "budem", "budes", "vsetci", "vsetky"];
      const czechStops = ["jsem", "jste", "budou", "budeme", "budete", "vsichni"];
      for (const word of words) {
        if (slovakStops.includes(word)) {
          slovakBoost += 15;
        }
        if (czechStops.includes(word)) {
          czechBoost += 15;
        }
      }
      scores["slovak"] += slovakBoost;
      scores["czech"] += czechBoost;
    }
    if (scores["norwegian"] > 0 || scores["danish"] > 0) {
      let norwegianBoost = 0;
      let danishBoost = 0;
      for (const word of words) {
        if (/(kje|sje|gje|bla|bru)/.test(word)) {
          norwegianBoost += 4;
        }
        if (/(ikke|ogsa|nar|blir|ble|var)/.test(word)) {
          norwegianBoost += 3;
        }
        if (/(ige|ede|hed|rod|hod)/.test(word)) {
          danishBoost += 4;
        }
        if (/(ikke|ogsaa|naar|bliver|blev|var)/.test(word)) {
          danishBoost += 3;
        }
      }
      scores["norwegian"] += norwegianBoost;
      scores["danish"] += danishBoost;
    }
    if (scores["croatian"] > 0 || scores["slovenian"] > 0) {
      let croatianBoost = 0;
      let slovenianBoost = 0;
      for (const word of words) {
        if (/(ije|jet|ijel|ijat)/.test(word)) {
          croatianBoost += 4;
        }
        if (/(biti|imati|raditi|govoriti)/.test(word)) {
          croatianBoost += 3;
        }
        if (/(ija|uje|oval)/.test(word)) {
          slovenianBoost += 4;
        }
        if (/(biti|imeti|delati|govoriti)/.test(word)) {
          slovenianBoost += 3;
        }
      }
      scores["croatian"] += croatianBoost;
      scores["slovenian"] += slovenianBoost;
    }
    if (scores["portuguese"] > 0 || scores["spanish"] > 0) {
      let portugueseBoost = 0;
      let spanishBoost = 0;
      for (const word of words) {
        if (/(ao|oe|nh|lh|cao|sao)/.test(word)) {
          portugueseBoost += 4;
        }
        if (/(voce|nao|muito|tambem|quando)/.test(word)) {
          portugueseBoost += 5;
        }
        if (/(usted|muy|tambien|cuando|porque)/.test(word)) {
          spanishBoost += 5;
        }
        if (/(cion|sion)$/.test(word)) {
          spanishBoost += 3;
        }
      }
      scores["portuguese"] += portugueseBoost;
      scores["spanish"] += spanishBoost;
    }
  }
  /**
  * Gets stopwords for a specific language
  *
  * @private
  *
  * @param language - Language code
  *
  * @returns Set of stopwords for the language
  */
  getStopwords(language) {
    const stopwordLists = {
      hungarian: ["a", "az", "es", "hogy", "nem", "van", "egy", "meg", "ki", "de", "is", "be", "le", "fel", "ez", "azt", "akkor", "aki", "csak", "vagy", "volt", "lehet"],
      german: ["der", "die", "das", "und", "ist", "zu", "den", "von", "mit", "sich", "ein", "sie", "auf", "des", "im", "dem", "auch", "als", "aber", "nach", "wie", "bei", "oder"],
      french: ["le", "la", "et", "est", "pas", "vous", "nous", "dans", "qui", "que", "il", "ce", "ne", "se", "une", "ont", "les", "des", "un", "pour", "par", "plus", "tout"],
      spanish: ["el", "la", "de", "que", "y", "en", "un", "es", "se", "no", "por", "los", "las", "del", "al", "una", "con", "para", "como", "mas", "pero", "sus", "sobre"],
      italian: ["il", "la", "e", "di", "che", "in", "un", "non", "per", "una", "le", "del", "da", "al", "sono", "si", "con", "come", "anche", "questo", "tutto", "ma", "pi\xF9"],
      portuguese: ["o", "a", "e", "de", "do", "da", "em", "um", "para", "com", "os", "as", "dos", "das", "uma", "no", "na", "ao", "mais", "por", "como", "mas", "se"],
      swedish: ["och", "att", "i", "av", "med", "som", "en", "det", "den", "ett", "har", "inte", "om", "var", "till", "kan", "for", "ar", "pa", "eller", "vid", "men"],
      norwegian: ["og", "i", "er", "av", "med", "for", "som", "en", "det", "at", "til", "har", "ikke", "den", "om", "var", "pa", "kan", "men", "eller", "nar", "fra"],
      danish: ["og", "i", "er", "af", "med", "for", "som", "en", "det", "at", "til", "har", "ikke", "den", "om", "var", "pa", "kan", "men", "eller", "naar", "fra"],
      dutch: ["de", "en", "het", "van", "een", "te", "dat", "die", "niet", "met", "op", "is", "voor", "in", "zijn", "ook", "als", "maar", "door", "naar", "bij", "aan"],
      czech: ["a", "se", "na", "je", "v", "s", "o", "z", "k", "i", "to", "do", "po", "ve", "by", "ze", "aby", "ale", "jsem", "jste", "jsou", "jak", "nebo", "ten", "ta"],
      polish: ["i", "w", "sie", "na", "nie", "do", "o", "z", "co", "to", "ze", "jak", "za", "od", "po", "jest", "byl", "te", "byly", "bez", "ale", "lub", "gdy"],
      slovak: ["a", "sa", "na", "je", "v", "s", "o", "z", "k", "i", "to", "do", "po", "ve", "by", "zo", "aby", "ale", "som", "ste", "su", "ako", "alebo", "ten", "ta"],
      icelandic: ["og", "i", "er", "a", "ad", "um", "en", "ef", "ekki", "ha", "sem", "vid", "til", "med", "fra", "var", "fyrir", "hann", "hun", "thad", "thetta", "vi\xF0"],
      croatian: ["i", "u", "se", "na", "je", "s", "o", "za", "da", "su", "od", "do", "po", "bio", "ali", "ili", "kao", "biti", "ima", "samo", "jos", "sve"],
      slovenian: ["in", "je", "se", "na", "ni", "za", "s", "o", "z", "k", "v", "so", "da", "do", "po", "ki", "od", "ali", "tudi", "kot", "pa", "biti", "ima"],
      romanian: ["si", "cu", "in", "se", "la", "este", "un", "o", "ca", "pe", "de", "nu", "sunt", "ii", "din", "sau", "ce", "mai", "pentru", "care", "fi", "sunt"],
      lithuanian: ["ir", "yra", "su", "i", "o", "is", "kaip", "ne", "tai", "kad", "bet", "ar", "bus", "uz", "del", "nuo", "dar", "jau", "nes", "kol", "kai", "kas"],
      latvian: ["un", "ir", "ar", "ka", "no", "uz", "par", "bet", "vai", "kas", "tas", "lai", "to", "so", "vai", "ir", "kura", "kurs", "kadi", "tad", "v\u0113l", "jau"]
    };
    return new Set(stopwordLists[language] || []);
  }
  /**
  * Calculates the ratio of stopwords in the text for a given language
  *
  * @private
  *
  * @param words - Array of words from the text
  * @param language - Language to check against
  *
  * @returns Ratio of matching stopwords (0-1)
  */
  calculateStopwordRatio(words, language) {
    const stopwords = this.getStopwords(language);
    const stopwordCount = words.filter((w) => stopwords.has(w)).length;
    return stopwordCount / words.length;
  }
  /**
  * Analyzes character frequency distribution against language profiles
  *
  * @private
  *
  * @param text - Text to analyze
  * @param language - Language to compare against
  *
  * @returns Score based on character frequency match (0-1)
  */
  analyzeCharacterFrequency(text, language) {
    const lowerText = text.toLowerCase();
    const charCount = {};
    let totalChars = 0;
    for (const char of lowerText) {
      if (/[a-z]/.test(char)) {
        charCount[char] = (charCount[char] || 0) + 1;
        totalChars++;
      }
    }
    if (totalChars === 0) {
      return 0;
    }
    const langProfile = this.CHAR_FREQUENCIES[language];
    if (!langProfile) {
      return 0;
    }
    let score = 0;
    for (const [char, expectedFreq] of Object.entries(langProfile)) {
      const actualFreq = (charCount[char] || 0) / totalChars;
      const deviation = Math.abs(actualFreq - expectedFreq);
      score += Math.max(0, 1 - deviation * 8);
    }
    return score / Object.keys(langProfile).length;
  }
  /**
  * Analyzes three-character sequences specific to languages
  *
  * @private
  *
  * @param text - Text to analyze
  * @param language - Language to check for
  *
  * @returns Trigram analysis score
  */
  analyzeTrigrams(text, language) {
    const trigrams = {
      german: ["sch", "ich", "ein", "und", "cht", "hen", "den", "gen", "ver", "ber"],
      french: ["ent", "les", "ion", "ait", "eur", "ant", "que", "ons", "ais", "eur"],
      spanish: ["ion", "ent", "que", "para", "con", "los", "ado", "nte", "esto", "i\xF3n"],
      italian: ["ion", "ent", "con", "per", "che", "lla", "gli", "del", "una", "ere"],
      portuguese: ["cao", "ent", "que", "para", "com", "dos", "ado", "nte", "nao", "por"],
      polish: ["nie", "prz", "jak", "kie", "nia", "owi", "ego", "ych", "wie", "cie"],
      hungarian: ["sze", "eke", "tek", "nak", "ban", "ben", "ett", "ott", "att", "van"],
      swedish: ["att", "och", "som", "det", "ande", "ade", "het", "for", "ing", "are"],
      norwegian: ["det", "som", "for", "ikke", "har", "var", "ene", "som", "ble", "kan"],
      danish: ["det", "for", "ikke", "har", "var", "ene", "den", "men", "som", "kan"],
      dutch: ["een", "het", "van", "den", "der", "ver", "ijk", "ing", "aar", "oor"],
      czech: ["pro", "kte", "jak", "pra", "ova", "ale", "aby", "jen", "ted", "pri"],
      slovak: ["pre", "kte", "ako", "pra", "ova", "ale", "aby", "len", "ted", "pri"],
      icelandic: ["inn", "ara", "ega", "adur", "anna", "andi", "arna", "inum", "anna", "eyti"],
      croatian: ["ije", "ova", "ako", "ima", "bio", "biti", "nje", "iti", "ost", "ali"],
      slovenian: ["ije", "ova", "kot", "ima", "bil", "biti", "nje", "iti", "ost", "ali"],
      romanian: ["are", "ire", "tor", "cea", "cea", "lor", "lui", "sau", "este", "esc"],
      lithuanian: ["aus", "ius", "ais", "tai", "kai", "kad", "bet", "nuo", "del", "nes"],
      latvian: ["ais", "ies", "aja", "eja", "taj", "kas", "vai", "par", "bet", "tas"]
    };
    const langTrigrams = trigrams[language] || [];
    if (langTrigrams.length === 0) {
      return 0;
    }
    let score = 0;
    const lowerText = text.toLowerCase();
    for (const trigram of langTrigrams) {
      const regex = new RegExp(trigram, "g");
      const matches = lowerText.match(regex);
      if (matches) {
        score += matches.length / 8;
      }
    }
    return Math.min(score, 1);
  }
  /**
  * Analyzes two-character sequences for language identification
  *
  * @private
  *
  * @param text - Text to analyze
  * @param language - Language to check for
  *
  * @returns Bigram analysis score
  */
  analyzeBigrams(text, language) {
    const bigrams = {
      german: ["ch", "en", "er", "ie", "de", "te", "sc", "nd", "ge", "st"],
      french: ["es", "de", "en", "le", "re", "nt", "on", "ou", "ur", "an"],
      spanish: ["de", "es", "en", "el", "la", "os", "ar", "er", "or", "an"],
      italian: ["er", "re", "la", "io", "no", "to", "el", "li", "he", "le"],
      portuguese: ["os", "de", "es", "as", "en", "ra", "te", "ao", "ar", "or"],
      polish: ["rz", "cz", "sz", "ie", "ni", "na", "go", "wi", "ow", "zy"],
      hungarian: ["sz", "gy", "ny", "ly", "et", "en", "tt", "ek", "ke", "te"],
      swedish: ["en", "er", "et", "tt", "an", "de", "om", "ar", "or", "ig"],
      norwegian: ["en", "er", "et", "or", "de", "sk", "te", "le", "ke", "ig"],
      danish: ["en", "er", "de", "et", "or", "nd", "te", "ge", "ke", "ig"],
      dutch: ["en", "de", "er", "te", "aa", "ij", "ee", "oo", "ch", "ng"],
      czech: ["st", "pr", "ov", "ni", "te", "ne", "le", "je", "ch", "po"],
      slovak: ["st", "pr", "ov", "ni", "te", "ne", "le", "je", "ch", "po"],
      icelandic: ["ur", "ar", "ir", "um", "ri", "st", "nn", "ad", "eg", "il"],
      croatian: ["je", "na", "st", "pr", "ra", "no", "ti", "ko", "ni", "ta"],
      slovenian: ["je", "na", "st", "pr", "ra", "no", "ti", "ko", "ni", "ta"],
      romanian: ["de", "re", "ul", "ar", "ea", "le", "te", "ii", "or", "ur"],
      lithuanian: ["as", "is", "us", "ai", "ei", "au", "ta", "ti", "ka", "ur"],
      latvian: ["as", "is", "aj", "am", "ie", "ar", "ka", "ta", "es", "ie"]
    };
    const langBigrams = bigrams[language] || [];
    if (langBigrams.length === 0) {
      return 0;
    }
    let score = 0;
    const lowerText = text.toLowerCase();
    for (const bigram of langBigrams) {
      const regex = new RegExp(bigram, "g");
      const matches = lowerText.match(regex);
      if (matches) {
        score += matches.length / 12;
      }
    }
    return Math.min(score, 1);
  }
  /**
  * Scores word patterns and morphological features specific to languages
  *
  * @private
  *
  * @param word - Individual word to score
  * @param language - Language to check against
  *
  * @returns Pattern matching score
  */
  scoreWordPatterns(word, language) {
    if (word.length < 3) {
      return 0;
    }
    let score = 0;
    switch (language) {
      case "hungarian":
        if (/(sz|cs|gy|ly|ny|ty|zs)/.test(word)) {
          score += 4;
        }
        if (word.length > 4 && /[bcdfghjklmnpqrstvwxz]{3}/.test(word)) {
          score += 2;
        }
        if (/(ban|ben|nak|nek|val|vel)$/.test(word)) {
          score += 3;
        }
        break;
      case "german":
        if (/(sch|ch)/.test(word)) {
          score += 4;
        }
        if (/(^ge|^be|^er|^ver|^zer|^ent)/.test(word)) {
          score += 3;
        }
        if (/(ung|lich|keit)$/.test(word)) {
          score += 3;
        }
        if (/(ss|tz)/.test(word)) {
          score += 2;
        }
        break;
      case "french":
        if (/(eau|eux|aux)/.test(word)) {
          score += 5;
        }
        if (/(qu|ou|ai|eu)/.test(word)) {
          score += 2;
        }
        if (/(tion|ment|eur)$/.test(word)) {
          score += 3;
        }
        break;
      case "spanish":
        if (/(ll|rr)/.test(word)) {
          score += 5;
        }
        if (/(qu|gu|ci|gi)/.test(word)) {
          score += 2;
        }
        if (/(cion|dad|mente)$/.test(word)) {
          score += 3;
        }
        break;
      case "czech":
        if (/(ou|ej|uj)/.test(word)) {
          score += 5;
        }
        if (/(ch|ck)/.test(word)) {
          score += 2;
        }
        if (word.length > 5 && /[bcdfghjklmnpqrstvwxz]{3}/.test(word)) {
          score += 2;
        }
        if (/(stv|ckn|prv)/.test(word)) {
          score += 4;
        }
        break;
      case "slovak":
        if (/(ia|ie|iu)/.test(word)) {
          score += 5;
        }
        if (/(ch|ck)/.test(word)) {
          score += 2;
        }
        if (word.length > 5 && /[bcdfghjklmnpqrstvwxz]{3}/.test(word)) {
          score += 2;
        }
        if (/(stv|ckn)/.test(word)) {
          score += 3;
        }
        break;
      case "polish":
        if (/(sz|cz|rz|dz)/.test(word)) {
          score += 5;
        }
        if (/(prz|trz|krz|szcz)/.test(word)) {
          score += 6;
        }
        if (/(ow|ych|ego|emu)$/.test(word)) {
          score += 3;
        }
        break;
      case "swedish":
      case "norwegian":
      case "danish":
        if (/(sj|skj|tj)/.test(word)) {
          score += 4;
        }
        if (/(het|skap|else|ning)$/.test(word)) {
          score += 3;
        }
        break;
      case "italian":
        if (/(cc|ff|gg|ll|mm|nn|pp|rr|ss|tt|zz)/.test(word)) {
          score += 4;
        }
        if (/(zione|mento|aggio)$/.test(word)) {
          score += 4;
        }
        if (/(gli|gn)/.test(word)) {
          score += 3;
        }
        break;
      case "portuguese":
        if (/(ao|oe|ae|ca|nh|lh)/.test(word)) {
          score += 4;
        }
        if (/(mente|cao|dade|agem)$/.test(word)) {
          score += 4;
        }
        break;
      case "icelandic":
        if (word.length > 3 && /(ur|ir|ar|un)$/.test(word)) {
          score += 4;
        }
        if (/(eyj|ey|ae)/.test(word)) {
          score += 3;
        }
        break;
      case "dutch":
        if (/(ij|sch|ijk)/.test(word)) {
          score += 5;
        }
        if (/(heid|schap|ing|tje)$/.test(word)) {
          score += 3;
        }
        if (/(aa|ee|oo|uu)/.test(word)) {
          score += 2;
        }
        break;
      case "croatian":
      case "slovenian":
        if (word.length > 5 && /[bcdfghjklmnpqrstvwxz]{3}/.test(word)) {
          score += 2;
        }
        if (/(anj|enj|ost|stv)/.test(word)) {
          score += 3;
        }
        break;
      case "romanian":
        if (/(esc|ire|tor|tii)/.test(word)) {
          score += 3;
        }
        if (/(ul|le|lor)$/.test(word)) {
          score += 2;
        }
        break;
      case "lithuanian":
        if (/(tion|mas|ien|ymas)/.test(word)) {
          score += 3;
        }
        if (/(as|is|us)$/.test(word)) {
          score += 2;
        }
        break;
      case "latvian":
        if (/(tion|ana|aja)/.test(word)) {
          score += 3;
        }
        if (/(as|is|us)$/.test(word)) {
          score += 2;
        }
        break;
    }
    return score;
  }
  /**
  * Scores word endings and suffixes characteristic of specific languages
  *
  * @private
  *
  * @param word - Individual word to score
  * @param language - Language to check against
  *
  * @returns Word structure score
  */
  scoreWordStructure(word, language) {
    if (word.length < 4) {
      return 0;
    }
    let score = 0;
    const endings = {
      hungarian: ["ban", "ben", "nak", "nek", "val", "vel", "tol", "kent", "hoz", "hez", "rol", "bol", "ert"],
      german: ["ung", "heit", "keit", "schaft", "chen", "lein", "lich", "bar", "sam", "los", "voll", "haft"],
      french: ["ment", "tion", "eur", "euse", "ique", "iste", "ance", "ence", "able", "ible", "aise", "ois"],
      spanish: ["cion", "miento", "dad", "tad", "eza", "aje", "ero", "ismo", "ador", "ante", "ente", "able"],
      italian: ["zione", "mento", "tore", "trice", "ezza", "aggio", "iere", "ismo", "abile", "ibile", "ante"],
      polish: ["anie", "enie", "osc", "stwo", "cja", "dzki", "ski", "owy", "owy", "nym", "nych", "ego"],
      czech: ["ani", "eni", "stvi", "ost", "cny", "ovat", "ovani", "eho", "ymi", "ych", "emu", "ou"],
      slovak: ["anie", "enie", "stvo", "ost", "cny", "ovat", "ovanie", "eho", "ymi", "ych", "emu", "ou"],
      swedish: ["het", "skap", "else", "ning", "ande", "ende", "are", "ast", "lig", "sam", "bar", "full"],
      portuguese: ["cao", "mente", "dade", "agem", "ario", "orio", "ismo", "ista", "avel", "ivel", "ante"],
      norwegian: ["het", "skap", "else", "ning", "ende", "ande", "ere", "est", "lig", "som", "bar", "full"],
      danish: ["hed", "skab", "else", "ning", "ende", "ande", "ere", "est", "lig", "som", "bar", "fuld"],
      icelandic: ["ur", "ir", "ar", "un", "ing", "ana", "legur", "inn", "andi", "endum", "anna", "arna"],
      dutch: ["heid", "schap", "ing", "tje", "atie", "iteit", "lijk", "baar", "zaam", "loos", "vol", "achtig"],
      croatian: ["anje", "enje", "ost", "stvo", "acija", "iranje", "itelj", "ica", "nik", "ski", "cki", "nja"],
      slovenian: ["anje", "enje", "ost", "stvo", "cija", "iranje", "itelj", "ica", "nik", "ski", "cki", "nja"],
      romanian: ["are", "ire", "tor", "tie", "ism", "ist", "esc", "ului", "ilor", "ului", "oare", "itoare"],
      lithuanian: ["imas", "ymas", "tis", "tys", "umas", "ybe", "tojas", "toja", "inis", "iskas", "iai", "iams"],
      latvian: ["sana", "sanas", "tajs", "taja", "ums", "iens", "ejais", "iska", "iski", "ais", "ajam", "ajos"]
    };
    const langEndings = endings[language] || [];
    for (const ending of langEndings) {
      if (word.endsWith(ending) && word.length > ending.length + 2) {
        score += 3;
        break;
      }
    }
    return score;
  }
  /**
  * Applies negative scoring for patterns unlikely in the target language
  *
  * @private
  *
  * @param words - Array of words from the text
  * @param language - Language to check against
  *
  * @returns Negative score penalty
  */
  applyNegativePatterns(words, language) {
    let penalty = 0;
    for (const word of words) {
      if (word.length < 3) {
        continue;
      }
      switch (language) {
        case "hungarian":
          if (/th|ph|qu|x/.test(word)) {
            penalty -= 3;
          }
          break;
        case "polish":
          if (/qu|x/.test(word)) {
            penalty -= 3;
          }
          if (!/[zywk]/.test(word) && word.length > 6) {
            penalty -= 1;
          }
          break;
        case "italian":
          if (/[kxy]/.test(word)) {
            penalty -= 2;
          }
          break;
        case "spanish":
          if (/[kw]/.test(word) && !/(whisky|kilo)/.test(word)) {
            penalty -= 2;
          }
          break;
        case "czech":
          if (/qu|x/.test(word)) {
            penalty -= 2;
          }
          if (/(ia|ie|iu)/.test(word) && word.length > 4) {
            penalty -= 2;
          }
          break;
        case "slovak":
          if (/qu|x/.test(word)) {
            penalty -= 2;
          }
          if (/(ou|ej|uj)/.test(word) && word.length > 4) {
            penalty -= 2;
          }
          break;
        case "french":
          if (/[kxy]/.test(word) && !/(taxi|examen)/.test(word)) {
            penalty -= 1;
          }
          break;
        case "portuguese":
          if (/[kwy]/.test(word) && !/(whisky|yacht)/.test(word)) {
            penalty -= 1;
          }
          break;
      }
    }
    return penalty;
  }
  /**
  * Checks for highly distinctive language-specific vocabulary markers
  *
  * @private
  *
  * @param words - Array of words from the text
  * @param language - Language to check for
  *
  * @returns Score based on distinctive marker matches
  */
  checkLanguageSpecificMarkers(words, language) {
    const markers = {
      hungarian: ["hogy", "nincs", "lesz", "volt", "lehet", "kell", "minden", "csak", "alatt", "felett"],
      german: ["auch", "oder", "aber", "wenn", "weil", "doch", "noch", "mehr", "sein", "haben"],
      french: ["vous", "nous", "tout", "plus", "peut", "faire", "tous", "leur", "fait", "sans"],
      spanish: ["todo", "todos", "muy", "mas", "puede", "hacer", "todos", "tiene", "hacer", "solo"],
      italian: ["tutto", "tutti", "molto", "piu", "fare", "essere", "solo", "anche", "dove", "cosa"],
      portuguese: ["tudo", "todos", "muito", "mais", "fazer", "ser", "pode", "tem", "esse", "onde"],
      polish: ["wszystko", "bardzo", "teraz", "byl", "byla", "bylo", "moge", "mozna", "trzeba", "juz"],
      czech: ["vsechno", "vse", "vsak", "velmi", "ted", "jeste", "uz", "ale", "take", "tedy"],
      slovak: ["vsetko", "vsetci", "velmi", "teraz", "este", "uz", "ale", "tiez", "teda", "len"],
      swedish: ["alla", "allt", "mycket", "kan", "ska", "skulle", "vara", "hur", "nar", "varfor"],
      norwegian: ["alle", "alt", "meget", "kan", "skal", "skulle", "vaere", "hvordan", "nar", "hvorfor"],
      danish: ["alle", "alt", "meget", "kan", "skal", "skulle", "vaere", "hvordan", "naar", "hvorfor"],
      dutch: ["alle", "alles", "veel", "kan", "zal", "zou", "zijn", "hoe", "wanneer", "waarom"],
      icelandic: ["allir", "allt", "mjog", "geta", "skulu", "vera", "hvernig", "hven\xE6r", "hvers vegna"],
      croatian: ["svi", "sve", "vrlo", "moze", "biti", "ima", "kako", "kada", "zasto", "gdje"],
      slovenian: ["vsi", "vse", "zelo", "lahko", "biti", "ima", "kako", "kdaj", "zakaj", "kje"],
      romanian: ["toti", "tot", "foarte", "poate", "fi", "are", "cum", "cand", "de ce", "unde"],
      lithuanian: ["visi", "viskas", "labai", "gali", "buti", "turi", "kaip", "kada", "kodel", "kur"],
      latvian: ["visi", "viss", "loti", "var", "but", "ir", "ka", "kad", "kapec", "kur"]
    };
    const langMarkers = markers[language] || [];
    let matchCount = 0;
    for (const word of words) {
      if (langMarkers.includes(word)) {
        matchCount++;
      }
    }
    return matchCount / Math.max(words.length, 1);
  }
  /**
  * Analyzes vowel/consonant patterns and phonological features
  *
  * @private
  *
  * @param words - Array of words from the text
  * @param language - Language to check against
  *
  * @returns Vowel/consonant pattern score
  */
  analyzeVowelConsonantPatterns(words, language) {
    let score = 0;
    for (const word of words) {
      if (word.length < 4) {
        continue;
      }
      switch (language) {
        case "hungarian":
          if (/[bcdfghjklmnpqrstvwxz]{4,}/.test(word)) {
            score += 2;
          }
          if (/^[aou]+[^aeiou]*[aou]+/.test(word) || /^[eiu]+[^aeiou]*[eiu]+/.test(word)) {
            score += 1;
          }
          break;
        case "polish":
          if (/(prz|trz|krz|str|szcz)/.test(word)) {
            score += 3;
          }
          break;
        case "czech":
          if (/^[^aeiou]{3,}/.test(word)) {
            score += 2;
          }
          if (/(ou|ej)/.test(word)) {
            score += 2;
          }
          break;
        case "slovak":
          if (/(ia|ie|iu)/.test(word)) {
            score += 2;
          }
          if (/[aeiou]{2}/.test(word)) {
            score += 1;
          }
          break;
        case "italian":
          const vowelCount = (word.match(/[aeiou]/g) || []).length;
          if (vowelCount / word.length > 0.45) {
            score += 2;
          }
          if (/[aeiou]$/.test(word)) {
            score += 1;
          }
          break;
        case "finnish":
          if (/([aeiou])\1/.test(word) || /([bcdfghjklmnpqrstvwxz])\1/.test(word)) {
            score += 2;
          }
          break;
        case "icelandic":
          if (/(ey|ae|au)/.test(word)) {
            score += 2;
          }
          break;
        case "dutch":
          if (/(aa|ee|oo|uu|ij)/.test(word)) {
            score += 2;
          }
          break;
      }
    }
    return score / Math.max(words.length, 1);
  }
  /**
  * Gets the list of supported languages
  *
  * @returns Array of supported language codes
  */
  getSupportedLanguages() {
    return [...this.SUPPORTED_LANGUAGES];
  }
  /**
  * Gets the confidence threshold for reliable detection
  *
  * @returns Confidence threshold value (0-1)
  */
  getConfidenceThreshold() {
    return this.CONFIDENCE_THRESHOLD;
  }
  /**
  * Checks if a language is supported by the detector
  *
  * @param language - Language code to check
  *
  * @returns True if the language is supported
  */
  isLanguageSupported(language) {
    return this.SUPPORTED_LANGUAGES.includes(language.toLowerCase());
  }
  /**
  * Gets the minimum text requirements for reliable detection
  *
  * @returns Object containing minimum text length and word count
  */
  getMinimumRequirements() {
    return {
      minTextLength: this.MIN_TEXT_LENGTH,
      minWordCount: this.MIN_WORD_COUNT
    };
  }
};

// src/extension.ts
function activate(context) {
  let CommandId;
  ((CommandId2) => {
    CommandId2["ReportIssue"] = "ps-replace-accents.reportIssue";
    CommandId2["RemoveDiacriticts"] = "ps-replace-accents.removeDiacritics";
    CommandId2["RemoveDiacritictsFileOrFolder"] = "ps-replace-accents.removeDiacriticsFileOrFolder";
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
  const getEditorTextSample = () => {
    const editor = vscode2.window.activeTextEditor;
    if (!editor) {
      return "";
    }
    const document = editor.document;
    const selections = editor.selections;
    if (selections.length && !selections.every((s) => s.isEmpty)) {
      for (const selection of selections) {
        if (!selection.isEmpty) {
          const text2 = document.getText(selection);
          return normalizeText(text2.substring(0, 125));
        }
      }
    }
    const entireDocumentRange = new vscode2.Range(
      0,
      0,
      document.lineCount - 1,
      document.lineAt(document.lineCount - 1).text.length
    );
    const text = document.getText(entireDocumentRange);
    return normalizeText(text.substring(0, 125));
  };
  const removeDiacritictsFileOrFolder = async (language, userMappings = {}, uri) => {
    const remover = new removeDiacritic_default(language, userMappings);
    const oldPath = uri.fsPath;
    const itemName = path2.basename(oldPath);
    const parentPath = path2.dirname(oldPath);
    const itemNameWithoutAccent = remover.removeDiacritics(itemName);
    if (itemNameWithoutAccent.length === 0) {
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
    if (await isFileExists(newUri)) {
      const overwritePrompt = await vscode2.window.showWarningMessage(
        vscode2.l10n.t("'{0}' already exists. Do you want to overwrite it?", itemNameWithoutAccent),
        { modal: true },
        vscode2.l10n.t("Yes"),
        vscode2.l10n.t("No")
      );
      if (overwritePrompt === vscode2.l10n.t("Yes")) {
        shouldOverwrite = true;
      } else {
        return;
      }
    }
    try {
      await vscode2.workspace.fs.rename(uri, newUri, { overwrite: shouldOverwrite });
      vscode2.window.showInformationMessage(
        vscode2.l10n.t("Renamed: {0} to {1}", itemName, itemNameWithoutAccent)
      );
    } catch (error) {
      vscode2.window.showErrorMessage(
        vscode2.l10n.t("Failed to rename '{0}': {1}", itemName, error.message)
      );
    }
  };
  const isFileExists = async (uri) => {
    try {
      const parentUri = vscode2.Uri.joinPath(uri, "..");
      const fileName = path2.basename(uri.fsPath);
      if (!fileName || fileName === "." || fileName === "..") {
        return false;
      }
      const entries = await vscode2.workspace.fs.readDirectory(parentUri);
      return entries.some(([name]) => name === fileName);
    } catch (error) {
      if (error instanceof vscode2.FileSystemError) {
        return false;
      }
      throw error;
    }
  };
  const getConfiLanguage = async (sample) => {
    const language = vscode2.workspace.getConfiguration("ps-replace-accents").get("textLanguage", "auto");
    if (language !== "auto") {
      return language;
    }
    const detector = new LanguageDetector();
    const result = detector.detect(sample);
    console.log(sample, result);
    return result.language !== "unknown" ? result.language : void 0;
  };
  const showLanguageSelectionDialog = async (sample) => {
    const language = await getConfiLanguage(sample);
    if (!language) {
      const openPrompt = await vscode2.window.showWarningMessage(
        vscode2.l10n.t("Select a text language in Settings to restore diacritics."),
        vscode2.l10n.t("Open Settings"),
        vscode2.l10n.t("Cancel")
      );
      if (openPrompt === vscode2.l10n.t("Open Settings")) {
        await vscode2.commands.executeCommand(
          "workbench.action.openSettings",
          "ps-replace-accents.textLanguage"
        );
      }
    }
    return language;
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
    ["ps-replace-accents.removeDiacritics" /* RemoveDiacriticts */]: async () => {
      const userMappings = vscode2.workspace.getConfiguration("ps-replace-accents").get("userCharacterMapping", {});
      const mappingsError = validateUserCharacterMappings(userMappings);
      if (mappingsError) {
        vscode2.window.showErrorMessage(mappingsError);
        return;
      }
      const textSample = getEditorTextSample();
      const language = await getConfiLanguage(textSample);
      const remover = new removeDiacritic_default(language, userMappings);
      const result = await processTextInEditor((text) => remover.removeDiacritics(text));
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
    ["ps-replace-accents.removeDiacriticsFileOrFolder" /* RemoveDiacritictsFileOrFolder */]: async (uri, selectedUris) => {
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
      const language = await showLanguageSelectionDialog(urisToRename.join(" "));
      if (!language) {
        return;
      }
      for (const currentUri of urisToRename) {
        await removeDiacritictsFileOrFolder(language, userMappings, currentUri);
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
      const textSample = getEditorTextSample();
      const language = await showLanguageSelectionDialog(textSample);
      if (!language) {
        return;
      }
      const restorer = new restoreDiacritic_default(language, ignoredWords, suffixMatching);
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
