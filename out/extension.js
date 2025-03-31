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
            /** @type {boolean} Indicates if there are no selections or only an empty selection */
            const no_selections = selections.length === 0 || (selections.length === 1 && selections[0].isEmpty);
            await editor.edit(editBuilder => {
                if (no_selections) { // Process entire document if no selection
                    const fullRange = new vscode.Range(document.lineAt(0).range.start, document.lineAt(document.lineCount - 1).range.end);
                    const fullText = document.getText(fullRange);
                    const processed = (0, utils_1.replaceAccents)(fullText, userMappings);
                    editBuilder.replace(fullRange, processed);
                }
                else { // Process each selection
                    for (const selection of selections) {
                        if (!selection.isEmpty) {
                            const text = document.getText(selection);
                            const processed = (0, utils_1.replaceAccents)(text, userMappings);
                            editBuilder.replace(selection, processed);
                        }
                    }
                }
            });
            if (no_selections) {
                vscode.window.showInformationMessage(vscode.l10n.t("All accented characters were replaced in the entire document."));
            }
            else {
                vscode.window.showInformationMessage(vscode.l10n.t("All accented characters were replaced in the selected text."));
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : vscode.l10n.t("Unknown error");
            vscode.window.showErrorMessage(vscode.l10n.t("Unable to replace accents: {errorMessage}. If this persists, please try reopening the file or restarting VS Code.", { errorMessage }));
        }
    });
    context.subscriptions.push(replaceAccentsCommand);
}
/** Deactivates the extension */
function deactivate() { }
//# sourceMappingURL=extension.js.map