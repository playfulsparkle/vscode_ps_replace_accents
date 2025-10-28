import * as vscode from "vscode";
import * as path from "path";
import * as utils from "./utils";


/** Activates the extension
 * @param {vscode.ExtensionContext} context - The extension context
 */
export function activate(context: vscode.ExtensionContext) {
	enum CommandId {
		ReportIssue = "ps-replace-accents.reportIssue",
		ReplaceAccents = "ps-replace-accents.replaceAccents",
		ReplaceAccentsFileOrFolder = "ps-replace-accents.replaceAccentsFileOrFolder"
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
	const processEntireDocument = (
		editBuilder: vscode.TextEditorEdit,
		document: vscode.TextDocument,
		userMappings: {}
	): boolean => {
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
			const processedText = utils.replaceAccents(chunkText, userMappings);

			// Only replace if changed
			if (chunkText !== processedText) {
				editBuilder.replace(chunkRange, processedText);

				modified = true;
			}
		}

		return modified;
	};

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
	const processSelections = (
		editBuilder: vscode.TextEditorEdit,
		document: vscode.TextDocument,
		selections: readonly vscode.Selection[],
		userMappings: {}
	): boolean => {
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

				const processed = utils.replaceAccents(text, userMappings);

				if (text !== processed) {
					editBuilder.replace(lineRange, processed);

					modified = true;
				}
			}
		}

		return modified;
	};

	const replaceAccentsFileOrFolder = async (uri: vscode.Uri, userMappings: {}) => {
		const oldPath = uri.fsPath;

		const itemName = path.basename(oldPath);
		const parentPath = path.dirname(oldPath);
		const itemNameWithoutAccent = utils.replaceAccents(itemName, userMappings);

		if (itemNameWithoutAccent.trim().length === 0) {
			return;
		}

		if (itemName === itemNameWithoutAccent) {
			vscode.window.showWarningMessage(
				vscode.l10n.t("No diacritics were removed from '{0}'.", itemName)
			);
			return;
		}

		const newPath = path.join(parentPath, itemNameWithoutAccent);
		const newUri = vscode.Uri.file(newPath);
		let shouldOverwrite = false;

		// Check existence using VS Code API (avoids race condition)
		try {
			await vscode.workspace.fs.stat(newUri);

			// File exists - prompt user
			const overwritePrompt = await vscode.window.showWarningMessage(
				vscode.l10n.t("'{0}' already exists. Do you want to overwrite it?", itemNameWithoutAccent),
				{ modal: true },
				vscode.l10n.t("Yes"),
				vscode.l10n.t("No")
			);

			if (overwritePrompt === vscode.l10n.t("Yes")) {
				shouldOverwrite = true;
			} else if (overwritePrompt === vscode.l10n.t("No")) {
				return; // User chose not to overwrite
			}
		} catch (_) {
			// File doesn't exist - this is fine, continue
		}

		try {
			await vscode.workspace.fs.rename(uri, vscode.Uri.file(newPath), { overwrite: shouldOverwrite });

			vscode.window.showInformationMessage(
				vscode.l10n.t("Renamed: {0} to {1}", itemName, itemNameWithoutAccent)
			);
		} catch (error) {
			vscode.window.showErrorMessage(
				vscode.l10n.t("Failed to rename '{0}': {1}", itemName, (error as Error).message)
			);
		}
	};

	const commandHandlers = {
		[CommandId.ReportIssue]: () => vscode.env.openExternal(vscode.Uri.parse("https://github.com/playfulsparkle/vscode_ps_replace_accents/issues")),
		[CommandId.ReplaceAccents]: async () => {
			try {
				const editor = vscode.window.activeTextEditor;

				if (!editor) {
					return; // no editor
				}

				const document = editor.document;

				// Check if the document is writeable
				if (document.uri.scheme !== "file" && document.uri.scheme !== "untitled") {
					vscode.window.showErrorMessage(vscode.l10n.t('Cannot modify "{type}" type of document', { "type": document.uri.scheme }));

					return;
				}

				const userMappings: { [key: string]: string } = vscode.workspace
					.getConfiguration("ps-replace-accents")
					.get<{ [key: string]: string }>("specialCharacterMappings", {});


				const userMappingsErrors = utils.validateSpecialCharacterMappings(userMappings);

				if (userMappingsErrors) {
					vscode.window.showErrorMessage(userMappingsErrors);

					return;
				}

				const selections = editor.selections;
				const allSelectionsEmpty: boolean = !selections.length || selections.every(s => s.isEmpty);

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
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : vscode.l10n.t("Unknown error");

				vscode.window.showErrorMessage(vscode.l10n.t("Unable to replace accents: {errorMessage}. If this persists, please try reopening the file or restarting VS Code.", { errorMessage }));
			}
		},
		[CommandId.ReplaceAccentsFileOrFolder]: async (uri: vscode.Uri, selectedUris?: vscode.Uri[]) => {
			if (!uri) {
				return;
			}

			const userMappings: { [key: string]: string } = vscode.workspace
				.getConfiguration("ps-replace-accents")
				.get<{ [key: string]: string }>("specialCharacterMappings", {});


			const userMappingsErrors = utils.validateSpecialCharacterMappings(userMappings);

			if (userMappingsErrors) {
				vscode.window.showErrorMessage(userMappingsErrors);

				return;
			}

			// Handle multiple selection
			const urisToRename = selectedUris && selectedUris.length > 0 ? selectedUris : [uri];

			for (const currentUri of urisToRename) {
				await replaceAccentsFileOrFolder(currentUri, userMappings);
			}

			if (urisToRename.length > 1) {
				vscode.window.showInformationMessage(
					vscode.l10n.t("Diacritics removed from {0} items.", urisToRename.length)
				);
			}
		}
	};

	// Register all commands
	for (const [commandId, handler] of Object.entries(commandHandlers)) {
		const disposable = vscode.commands.registerCommand(commandId, handler);

		context.subscriptions.push(disposable);
	}
}

/** Deactivates the extension */
export function deactivate() { }