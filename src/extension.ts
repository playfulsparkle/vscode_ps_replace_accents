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

			/** @type {boolean} Indicates if all selections are empty */
			const allSelectionsEmpty = selections.length === 0 || selections.every(selection => selection.isEmpty);

			let modified = false;

			await editor.edit(editBuilder => {
				if (allSelectionsEmpty) {
					modified = processEntireDocument(editBuilder, document, userMappings);
				} else {
					modified = processSelections(editBuilder, document, selections, userMappings);
				}
			});

			if (modified) {
				const message = allSelectionsEmpty
					? vscode.l10n.t("All accented characters were replaced in the entire document.")
					: vscode.l10n.t("All accented characters were replaced in the selected text.");

				vscode.window.showInformationMessage(message);
			}
		} catch (error) {
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
function processEntireDocument(editBuilder: vscode.TextEditorEdit, document: vscode.TextDocument, userMappings: {}): boolean {
	let modified = false;

	if (document.lineCount === 0) {
		return modified;
	}

	for (let idx = 0; idx < document.lineCount; idx++) {
		const line = document.lineAt(idx);

		if (line.isEmptyOrWhitespace) {
			continue;
		}

		const processed = replaceAccents(line.text, userMappings);

		if (line.text !== processed) {
			editBuilder.replace(line.range, processed);

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
function processSelections(editBuilder: vscode.TextEditorEdit, document: vscode.TextDocument, selections: readonly vscode.Selection[], userMappings: {}): boolean {
	let modified = false;

	for (const selection of selections) {
		if (selection.isEmpty) {
			continue;
		}

		for (let idx = selection.start.line; idx <= selection.end.line; idx++) {
			const line = document.lineAt(idx);

			const lineRange = new vscode.Range(
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

	return modified;
}

/** Deactivates the extension */
export function deactivate() { }
