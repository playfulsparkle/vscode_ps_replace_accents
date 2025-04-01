"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const utils_1 = require("./utils");
/** Activates the extension
 * @param {vscode.ExtensionContext} context - The extension context
 */
function activate(context) {
    /** Command to replace accented characters with their non-accented equivalents */
    const replaceAccentsCommand = vscode.commands.registerCommand("ps-replace-accents.replaceAccents", async () => {
        try {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                return; // no editor
            }
            const document = editor.document;
            const selections = editor.selections;
            // Check if the document is writeable
            if (document.uri.scheme !== "file" && document.uri.scheme !== "untitled") {
                vscode.window.showErrorMessage(vscode.l10n.t('Cannot modify "{type}" type of document', { "type": document.uri.scheme }));
                return;
            }
            /** @type {{[key: string]: string}} User-defined character mappings from configuration */
            const userMappings = vscode.workspace
                .getConfiguration("ps-replace-accents")
                .get("specialCharacterMappings", {});
            const userMappingsErrors = (0, utils_1.validateSpecialCharacterMappings)(userMappings);
            if (userMappingsErrors) {
                vscode.window.showErrorMessage(userMappingsErrors);
                return;
            }
            /** @type {boolean} Indicates if all selections are empty */
            const allSelectionsEmpty = !selections.length || selections.every(s => s.isEmpty);
            let modified = false;
            await editor.edit(editBuilder => {
                modified = allSelectionsEmpty
                    ? processEntireDocument(editBuilder, document, userMappings)
                    : processSelections(editBuilder, document, selections, userMappings);
            });
            if (modified) {
                const message = allSelectionsEmpty
                    ? vscode.l10n.t("All accented characters were replaced in the entire document.")
                    : vscode.l10n.t("All accented characters were replaced in the selected text.");
                vscode.window.showInformationMessage(message);
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : vscode.l10n.t("Unknown error");
            vscode.window.showErrorMessage(vscode.l10n.t("Unable to replace accents: {errorMessage}. If this persists, please try reopening the file or restarting VS Code.", { errorMessage }));
        }
    });
    context.subscriptions.push(replaceAccentsCommand);
}
/**
 * Processes the entire document line by line.
 *
 * @param {vscode.TextEditorEdit} editBuilder - The edit builder.
 * @param {vscode.TextDocument} document - The document to process.
 * @param {{[key: string]: string}} userMappings - The character mappings.
 *
 * @returns {boolean} Whether any modifications were made.
 */
function processEntireDocument(editBuilder, document, userMappings) {
    let modified = false;
    if (document.lineCount === 0) {
        return modified;
    }
    const CHUNK_SIZE = 1000;
    for (let startLine = 0; startLine < document.lineCount; startLine += CHUNK_SIZE) {
        const endLine = Math.min(startLine + CHUNK_SIZE - 1, document.lineCount - 1);
        // Create a range for the chunk
        const startPos = new vscode.Position(startLine, 0);
        const endPos = document.lineAt(endLine).range.end;
        const chunkRange = new vscode.Range(startPos, endPos);
        // Get and process the chunk text
        const chunkText = document.getText(chunkRange);
        const processedText = (0, utils_1.replaceAccents)(chunkText, userMappings);
        // Only replace if changed
        if (chunkText !== processedText) {
            editBuilder.replace(chunkRange, processedText);
            modified = true;
        }
    }
    return modified;
}
/**
 * Processes the selected text line by line.
 *
 * @param {vscode.TextEditorEdit} editBuilder - The edit builder.
 * @param {vscode.TextDocument} document - The document to process.
 * @param {readonly vscode.Selection[]} selections - The selections to process.
 * @param {{[key: string]: string}} userMappings - The character mappings.
 *
 * @returns {boolean} Whether any modifications were made.
 */
function processSelections(editBuilder, document, selections, userMappings) {
    let modified = false;
    const LARGE_SELECTION_THRESHOLD = 10000; // Characters - adjust based on testing
    for (const selection of selections) {
        if (selection.isEmpty)
            continue;
        // For small selections, process as a single block
        if (document.offsetAt(selection.end) - document.offsetAt(selection.start) < LARGE_SELECTION_THRESHOLD) {
            const text = document.getText(selection);
            const processed = (0, utils_1.replaceAccents)(text, userMappings);
            if (text !== processed) {
                editBuilder.replace(selection, processed);
                modified = true;
            }
        }
        // For large selections, process line by line (original approach)
        else {
            for (let idx = selection.start.line; idx <= selection.end.line; idx++) {
                const line = document.lineAt(idx);
                const lineRange = new vscode.Range(idx === selection.start.line ? selection.start : line.range.start, idx === selection.end.line ? selection.end : line.range.end);
                const text = document.getText(lineRange);
                const processed = (0, utils_1.replaceAccents)(text, userMappings);
                if (text !== processed) {
                    editBuilder.replace(lineRange, processed);
                    modified = true;
                }
            }
        }
    }
    return modified;
}
/** Deactivates the extension */
function deactivate() { }
//# sourceMappingURL=extension.js.map