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

// src/utils.ts
var vscode = __toESM(require("vscode"));
function replaceAccents(text, charMappings = {}) {
  if (!text || typeof text !== "string") {
    return text;
  }
  try {
    const normalized = text.normalize("NFD");
    return Array.from(normalized).map((char) => {
      if (char.charCodeAt(0) >= 768 && char.charCodeAt(0) <= 879) {
        return "";
      }
      return charMappings[char] || char;
    }).join("");
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

// src/extension.ts
function activate(context) {
  const replaceAccentsCommand = vscode2.commands.registerCommand("ps-replace-accents.replaceAccents", async () => {
    try {
      const editor = vscode2.window.activeTextEditor;
      if (!editor) {
        return;
      }
      const document = editor.document;
      const selections = editor.selections;
      if (document.uri.scheme !== "file" && document.uri.scheme !== "untitled") {
        vscode2.window.showErrorMessage(vscode2.l10n.t('Cannot modify "{type}" type of document', { "type": document.uri.scheme }));
        return;
      }
      const userMappings = vscode2.workspace.getConfiguration("ps-replace-accents").get("specialCharacterMappings", {});
      const userMappingsErrors = validateSpecialCharacterMappings(userMappings);
      if (userMappingsErrors) {
        vscode2.window.showErrorMessage(userMappingsErrors);
        return;
      }
      const allSelectionsEmpty = !selections.length || selections.every((s) => s.isEmpty);
      let modified = false;
      await editor.edit((editBuilder) => {
        modified = allSelectionsEmpty ? processEntireDocument(editBuilder, document, userMappings) : processSelections(editBuilder, document, selections, userMappings);
      });
      if (modified) {
        const message = allSelectionsEmpty ? vscode2.l10n.t("All accented characters were replaced in the entire document.") : vscode2.l10n.t("All accented characters were replaced in the selected text.");
        vscode2.window.showInformationMessage(message);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : vscode2.l10n.t("Unknown error");
      vscode2.window.showErrorMessage(vscode2.l10n.t("Unable to replace accents: {errorMessage}. If this persists, please try reopening the file or restarting VS Code.", { errorMessage }));
    }
  });
  context.subscriptions.push(replaceAccentsCommand);
}
function processEntireDocument(editBuilder, document, userMappings) {
  let modified = false;
  if (document.lineCount === 0) {
    return modified;
  }
  const CHUNK_SIZE = 1e3;
  for (let startLine = 0; startLine < document.lineCount; startLine += CHUNK_SIZE) {
    const endLine = Math.min(startLine + CHUNK_SIZE - 1, document.lineCount - 1);
    const startPos = new vscode2.Position(startLine, 0);
    const endPos = document.lineAt(endLine).range.end;
    const chunkRange = new vscode2.Range(startPos, endPos);
    const chunkText = document.getText(chunkRange);
    const processedText = replaceAccents(chunkText, userMappings);
    if (chunkText !== processedText) {
      editBuilder.replace(chunkRange, processedText);
      modified = true;
    }
  }
  return modified;
}
function processSelections(editBuilder, document, selections, userMappings) {
  let modified = false;
  const LARGE_SELECTION_THRESHOLD = 1e4;
  for (const selection of selections) {
    if (selection.isEmpty) continue;
    if (document.offsetAt(selection.end) - document.offsetAt(selection.start) < LARGE_SELECTION_THRESHOLD) {
      const text = document.getText(selection);
      const processed = replaceAccents(text, userMappings);
      if (text !== processed) {
        editBuilder.replace(selection, processed);
        modified = true;
      }
    } else {
      for (let idx = selection.start.line; idx <= selection.end.line; idx++) {
        const line = document.lineAt(idx);
        const lineRange = new vscode2.Range(
          idx === selection.start.line ? selection.start : line.range.start,
          idx === selection.end.line ? selection.end : line.range.end
        );
        const text = document.getText(lineRange);
        const processed = replaceAccents(text, userMappings);
        if (text !== processed) {
          editBuilder.replace(lineRange, processed);
          modified = true;
        }
      }
    }
  }
  return modified;
}
function deactivate() {
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
//# sourceMappingURL=extension.js.map
