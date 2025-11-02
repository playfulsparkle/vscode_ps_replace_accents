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

// src/utils.ts
var vscode = __toESM(require("vscode"));

// src/shared.ts
var diacriticRegex = /[\p{Mn}\u0300-\u036f]/gu;
var languageSpecificMappings = {
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
  "danish": {
    "\xE6": "ae",
    "\xC6": "Ae",
    "\xF8": "oe",
    "\xD8": "Oe",
    "\xE5": "aa",
    "\xC5": "Aa"
  },
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
  "swedish": {
    "\xE5": "aa",
    "\xC5": "Aa",
    "\xE4": "ae",
    "\xC4": "Ae",
    "\xF6": "oe",
    "\xD6": "Oe"
  }
};
var mergedLanguageMappings = Object.assign(
  {},
  ...Object.values(languageSpecificMappings)
);
function preserveOriginalCase(original, restored) {
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

// src/utils.ts
function replaceAccents(text, charMappings = {}) {
  if (!text || typeof text !== "string") {
    return text;
  }
  try {
    const combinedMappings = { ...mergedLanguageMappings, ...charMappings };
    const specialChars = Object.keys(combinedMappings).join("");
    const customPattern = new RegExp(`[${specialChars}]`, "g");
    let result = text.replace(customPattern, (match) => {
      const replacement = combinedMappings[match];
      return preserveOriginalCase(match, replacement);
    });
    return result.normalize("NFKD").replace(diacriticRegex, "");
  } catch (error) {
    console.error("Error in replaceAccents:", error);
    return text;
  }
}
function validateAccentRemoveMapping(mappings) {
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

// src/accent.ts
var fs = __toESM(require("fs"));
var path = __toESM(require("path"));
var AccentRestorer = class _AccentRestorer {
  dictionary = /* @__PURE__ */ new Map();
  ignoredWords;
  currentLanguage;
  isReady = false;
  dictionaryBasePath;
  // LRU cache for restoration results
  restorationCache = /* @__PURE__ */ new Map();
  MAX_CACHE_SIZE = 1e3;
  enableSuffixMatching;
  // Cached regex patterns for better performance
  // Use Unicode property escapes to match all letters and combining marks
  static WORD_REGEX = /[\p{L}\p{M}'\u2019-]+/gu;
  constructor(language, ignoredWords = [], enableSuffixMatching = false) {
    this.currentLanguage = language;
    this.enableSuffixMatching = enableSuffixMatching;
    this.ignoredWords = new Set(
      ignoredWords.map((word) => this.removeAccents(word.toLowerCase()))
    );
    this.dictionaryBasePath = path.join(__dirname, "dictionary");
  }
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
        const baseForm = this.removeAccents(word.toLowerCase());
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
  restoreAccents(text) {
    if (!this.isReady) {
      throw new Error("Accent restorer not initialized. Call initialize() first.");
    }
    return text.replace(_AccentRestorer.WORD_REGEX, (word) => {
      const cached = this.restorationCache.get(word);
      if (cached !== void 0) {
        return cached;
      }
      const baseForm = this.removeAccents(word.toLowerCase());
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
  addToCache(key, value) {
    if (this.restorationCache.size >= this.MAX_CACHE_SIZE) {
      const firstKey = this.restorationCache.keys().next().value;
      if (firstKey) {
        this.restorationCache.delete(firstKey);
      }
    }
    this.restorationCache.set(key, value);
  }
  findBestMatch(word, baseForm) {
    const normalizedBase = baseForm || this.removeAccents(word.toLowerCase());
    const candidates = this.dictionary.get(normalizedBase);
    if (!candidates || candidates.length === 0) {
      if (this.enableSuffixMatching) {
        return this.findSuffixMatch(word, normalizedBase);
      }
      return null;
    }
    const bestMatch = candidates[0].word;
    return preserveOriginalCase(word, bestMatch);
  }
  findSuffixMatch(word, normalizedBase) {
    const wordLower = word.toLowerCase();
    const wordLen = normalizedBase.length;
    const minStemLen = Math.max(4, Math.floor(wordLen * 0.6));
    const maxSuffixLen = 3;
    for (let stemLen = wordLen - 1; stemLen >= Math.max(minStemLen, wordLen - maxSuffixLen); stemLen--) {
      const stem = normalizedBase.substring(0, stemLen);
      const candidates = this.dictionary.get(stem);
      if (candidates && candidates.length > 0) {
        const bestStem = candidates[0].word;
        const suffix = wordLower.substring(stemLen);
        const reconstructed = bestStem + suffix;
        return preserveOriginalCase(word, reconstructed);
      }
    }
    return null;
  }
  removeAccents(text) {
    if (!text || typeof text !== "string") {
      return text;
    }
    const allMappings = this.currentLanguage ? languageSpecificMappings[this.currentLanguage] || {} : {};
    let normalized = text.toLowerCase().normalize("NFKD").replace(diacriticRegex, "");
    const specialChars = Object.keys(allMappings).join("");
    const specialCharsPattern = new RegExp(`[${specialChars}]`, "g");
    return normalized.replace(
      specialCharsPattern,
      (match) => allMappings[match]
    );
  }
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
  // Memory optimization: clear dictionary when not needed
  dispose() {
    this.dictionary.clear();
    this.ignoredWords.clear();
    this.restorationCache.clear();
    this.isReady = false;
    this.currentLanguage = void 0;
  }
  getMemoryUsage() {
    const entries = Array.from(this.dictionary.values()).reduce((sum, arr) => sum + arr.length, 0);
    const uniqueBaseForms = this.dictionary.size;
    return `Dictionary: ${uniqueBaseForms} base forms, ${entries} total entries, Cache: ${this.restorationCache.size} words, Language: ${this.currentLanguage || "none"}`;
  }
  // Utility method to check if initialized
  getIsReady() {
    return this.isReady;
  }
  // Utility method to get current language
  getCurrentLanguage() {
    return this.currentLanguage;
  }
};
var accent_default = AccentRestorer;

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
    const itemName = path2.basename(oldPath);
    const parentPath = path2.dirname(oldPath);
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
    ["ps-replace-accents.reportIssue" /* ReportIssue */]: () => vscode2.env.openExternal(vscode2.Uri.parse("https://github.com/playfulsparkle/vscode_ps_replace_accents/issues")),
    ["ps-replace-accents.replaceAccents" /* ReplaceAccents */]: async () => {
      const userMappings = vscode2.workspace.getConfiguration("ps-replace-accents").get("accentRemoveMapping", {});
      const userMappingsErrors = validateAccentRemoveMapping(userMappings);
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
      const userMappings = vscode2.workspace.getConfiguration("ps-replace-accents").get("accentRemoveMapping", {});
      const userMappingsErrors = validateAccentRemoveMapping(userMappings);
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
      const suffixMatching = vscode2.workspace.getConfiguration("ps-replace-accents").get("accentRestoreSuffixMatching", false);
      const ignoredWordsRaw = vscode2.workspace.getConfiguration("ps-replace-accents").get("accentIgnoredWords", "");
      const ignoredWords = normalizeIgnoreWords(ignoredWordsRaw);
      const accentDictionary = vscode2.workspace.getConfiguration("ps-replace-accents").get("accentDictionary", "hungarian");
      const restorer = new accent_default(accentDictionary, ignoredWords, suffixMatching);
      await restorer.initialize();
      await processTextInEditor((text) => restorer.restoreAccents(text));
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
