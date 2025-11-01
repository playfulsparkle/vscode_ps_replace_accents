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
var fs = __toESM(require("fs"));
var path = __toESM(require("path"));
var AccentRestorer = class _AccentRestorer {
  dictionary = /* @__PURE__ */ new Map();
  ignoredWords;
  currentLanguage;
  isReady = false;
  dictionaryBasePath;
  // Cached regex patterns for better performance
  static WORD_REGEX = /[\w\u00C0-\u017F]+/g;
  static DIACRITIC_REGEX = /[\u0300-\u036f]/g;
  constructor(language, ignoredWords = []) {
    this.currentLanguage = language;
    this.ignoredWords = new Set(
      ignoredWords.map((word) => this.removeAccents(word.toLowerCase()))
    );
    this.dictionaryBasePath = path.join(__dirname, "dictionary");
  }
  async initialize() {
    if (this.isReady) {
      return;
    }
    const dictionaryFile = path.join(this.dictionaryBasePath, `dict_${this.currentLanguage}.txt`);
    const data = await this.readDictionaryFile(dictionaryFile);
    this.buildDictionary(data);
    this.isReady = true;
  }
  readDictionaryFile(filePath) {
    return new Promise((resolve, reject) => {
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
        reject(new Error(`Dictionary file not found: ${filePath}. Error: ${err.message}`));
      });
    });
  }
  buildDictionary(csvData) {
    const lines = csvData.split("\n");
    let lineCount = 0;
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) {
        continue;
      }
      const tabIndex = line.indexOf("	");
      if (tabIndex === -1) {
        continue;
      }
      const word = line.substring(0, tabIndex);
      const frequencyStr = line.substring(tabIndex + 1);
      if (!word || !frequencyStr) {
        continue;
      }
      const frequency = parseInt(frequencyStr, 10);
      if (isNaN(frequency)) {
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
    }
    console.log(`Loaded ${lineCount} words for language ${this.currentLanguage}`);
  }
  restoreAccents(text) {
    if (!this.isReady) {
      throw new Error("Accent restorer not initialized. Call initialize() first.");
    }
    return text.replace(_AccentRestorer.WORD_REGEX, (word) => {
      const baseForm = this.removeAccents(word.toLowerCase());
      if (this.ignoredWords.has(baseForm)) {
        return word;
      }
      const restored = this.findBestMatch(word, baseForm);
      return restored || word;
    });
  }
  findBestMatch(word, baseForm) {
    const normalizedBase = baseForm || this.removeAccents(word.toLowerCase());
    const candidates = this.dictionary.get(normalizedBase);
    if (!candidates || candidates.length === 0) {
      return null;
    }
    const bestMatch = candidates[0].word;
    return this.preserveOriginalCase(word, bestMatch);
  }
  removeAccents(text) {
    return text.normalize("NFD").replace(_AccentRestorer.DIACRITIC_REGEX, "").toLowerCase();
  }
  preserveOriginalCase(original, restored) {
    const origLen = original.length;
    const restLen = restored.length;
    if (original === original.toUpperCase()) {
      return restored.toUpperCase();
    }
    if (origLen > 0 && original[0] === original[0].toUpperCase() && original.slice(1) === original.slice(1).toLowerCase()) {
      return restored[0].toUpperCase() + restored.slice(1).toLowerCase();
    }
    let result = "";
    const minLength = Math.min(origLen, restLen);
    for (let i = 0; i < minLength; i++) {
      const origChar = original[i];
      result += origChar === origChar.toUpperCase() ? restored[i].toUpperCase() : restored[i].toLowerCase();
    }
    if (restLen > minLength) {
      const lastCharIsUpper = origLen > 0 && original[origLen - 1] === original[origLen - 1].toUpperCase();
      for (let i = minLength; i < restLen; i++) {
        result += lastCharIsUpper ? restored[i].toUpperCase() : restored[i].toLowerCase();
      }
    }
    return result;
  }
  async changeLanguage(language) {
    this.dictionary.clear();
    this.ignoredWords.clear();
    this.currentLanguage = language;
    this.isReady = false;
    await this.initialize();
  }
  // Memory optimization: clear dictionary when not needed
  dispose() {
    this.dictionary.clear();
    this.ignoredWords.clear();
    this.isReady = false;
    this.currentLanguage = void 0;
  }
  getMemoryUsage() {
    const entries = Array.from(this.dictionary.values()).reduce((sum, arr) => sum + arr.length, 0);
    const uniqueBaseForms = this.dictionary.size;
    return `Dictionary: ${uniqueBaseForms} base forms, ${entries} total entries, Language: ${this.currentLanguage}`;
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
      const accentDictionary = vscode2.workspace.getConfiguration("ps-replace-accents").get("accentDictionary", "hungarian");
      const restorer = new accent_default(accentDictionary);
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
