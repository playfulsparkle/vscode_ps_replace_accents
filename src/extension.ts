import * as vscode from "vscode";
import { replaceAccents, validateSpecialCharacterMappings } from "./utils";

/** Activates the extension
 * @param {vscode.ExtensionContext} context - The extension context
 */
export function activate(context: vscode.ExtensionContext) {

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
				.get<{ [key: string]: string }>("specialCharacterMappings", {});

			const userMappingsErrors = validateSpecialCharacterMappings(userMappings);

			if (userMappingsErrors) {
				vscode.window.showErrorMessage(userMappingsErrors);
				return;
			}

			/** @type {boolean} Indicates if there are no selections or only an empty selection */
			const no_selections = selections.length === 0 || (selections.length === 1 && selections[0].isEmpty);

			await editor.edit(editBuilder => {
				if (no_selections) { // Process entire document if no selection
					const fullRange = new vscode.Range(
						document.lineAt(0).range.start,
						document.lineAt(document.lineCount - 1).range.end
					);

					const fullText = document.getText(fullRange);
					const processed = replaceAccents(fullText, userMappings);

					editBuilder.replace(fullRange, processed);
				} else { // Process each selection
					for (const selection of selections) {
						if (!selection.isEmpty) {
							const text = document.getText(selection);
							const processed = replaceAccents(text, userMappings);

							editBuilder.replace(selection, processed);
						}
					}
				}
			});

			if (no_selections) {
				vscode.window.showInformationMessage(vscode.l10n.t("All accented characters were replaced in the entire document."));
			} else {
				vscode.window.showInformationMessage(vscode.l10n.t("All accented characters were replaced in the selected text."));
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : vscode.l10n.t("Unknown error");

			vscode.window.showErrorMessage(vscode.l10n.t("Unable to replace accents: {errorMessage}. If this persists, please try reopening the file or restarting VS Code.", { errorMessage }));
		}
	});

	context.subscriptions.push(replaceAccentsCommand);
}

/** Deactivates the extension */
export function deactivate() { }
