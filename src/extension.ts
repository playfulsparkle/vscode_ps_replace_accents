import * as vscode from "vscode";
import * as path from "path";
import {
	validateUserCharacterMappings,
	normalizeIgnoreWords
} from "./shared";
import DiacriticRestorer from "./restoreDiacritic";
import DiacriticRemover from "./removeDiacritic";

/** Activates the extension
 * @param {vscode.ExtensionContext} context - The extension context
 */
export function activate(context: vscode.ExtensionContext) {
	enum CommandId {
		ReportIssue = "ps-replace-accents.reportIssue",
		ReplaceAccents = "ps-replace-accents.removeDiacritics",
		ReplaceAccentsFileOrFolder = "ps-replace-accents.removeDiacriticsFileOrFolder",
		RestoreAccents = "ps-replace-accents.restoreDiacritics",
	}

	/**
	 * Processes text in the editor with a transformation function
	 * @param editor The active text editor
	 * @param transformFn The function to transform the text
	 * @param expandToFullLines Whether to expand selections to full lines
	 * @param options Optional parameters to pass to the transform function
	 */
	const processTextInEditor = async (
		transformFn: (text: string, options?: any) => string,
		expandToFullLines: boolean = false,
		options?: any
	): Promise<number> => {
		const editor = vscode.window.activeTextEditor;

		if (!editor) {
			return -1;
		}

		const document = editor.document;
		const selections = editor.selections;

		// If there are no manual selections or only empty selections, process the entire document
		if (!selections.length || selections.every(s => s.isEmpty)) {
			const entireDocumentRange = new vscode.Range(
				0, 0,
				document.lineCount - 1, document.lineAt(document.lineCount - 1).text.length
			);
			const text = document.getText(entireDocumentRange);
			const processedText = transformFn(text, options);

			await editor.edit(editBuilder => {
				editBuilder.replace(entireDocumentRange, processedText);
			});
			return 1;
		}

		// Process each selection
		await editor.edit(editBuilder => {
			for (const selection of selections) {
				if (selection.isEmpty) {
					continue;
				}

				let rangeToProcess = selection;

				// Expand selection to full lines if requested
				if (expandToFullLines) {
					const startLine = document.lineAt(selection.start.line);
					const endLine = document.lineAt(selection.end.line);
					rangeToProcess = new vscode.Selection(startLine.range.start, endLine.range.end);
				}

				const selectedText = document.getText(rangeToProcess);
				const processedText = transformFn(selectedText, options);

				editBuilder.replace(rangeToProcess, processedText);
			}
		});

		return 0;
	};

	const removeDiacriticsFileOrFolder = async (uri: vscode.Uri, userMappings: {}) => {
		const remover = new DiacriticRemover();

		const oldPath = uri.fsPath;

		const itemName = path.basename(oldPath);
		const parentPath = path.dirname(oldPath);
		const itemNameWithoutAccent = remover.removeDiacritics(itemName, userMappings);

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

		// Check existence using Visual Studio Code API (avoids race condition)
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
			const userMappings: { [key: string]: string } = vscode.workspace
				.getConfiguration("ps-replace-accents")
				.get<{ [key: string]: string }>("userCharacterMapping", {});


			const mappingsError = validateUserCharacterMappings(userMappings);

			if (mappingsError) {
				vscode.window.showErrorMessage(mappingsError);
				return;
			}

			const remover = new DiacriticRemover();

			const allSelectionsEmpty = await processTextInEditor(text => remover.removeDiacritics(text, userMappings));

			let modified = false;

			if (modified) {
				switch (allSelectionsEmpty) {
					case 1: // selection
						vscode.window.showInformationMessage(vscode.l10n.t("All accented characters were replaced in the selected text."));
						break;
					case 0: // entire document
						vscode.window.showInformationMessage(vscode.l10n.t("All accented characters were replaced in the entire document."));
						break;
				}
			}
		},
		[CommandId.ReplaceAccentsFileOrFolder]: async (uri: vscode.Uri, selectedUris?: vscode.Uri[]) => {
			if (!uri) {
				return;
			}

			const userMappings: { [key: string]: string } = vscode.workspace
				.getConfiguration("ps-replace-accents")
				.get<{ [key: string]: string }>("userCharacterMapping", {});


			const mappingsError = validateUserCharacterMappings(userMappings);

			if (mappingsError) {
				vscode.window.showErrorMessage(mappingsError);

				return;
			}

			// Handle multiple selection
			const urisToRename = selectedUris && selectedUris.length > 0 ? selectedUris : [uri];

			for (const currentUri of urisToRename) {
				await removeDiacriticsFileOrFolder(currentUri, userMappings);
			}

			if (urisToRename.length > 1) {
				vscode.window.showInformationMessage(
					vscode.l10n.t("Diacritics removed from {0} items.", urisToRename.length)
				);
			}
		},
		[CommandId.RestoreAccents]: async () => {
			// Read suffix matching setting
			const suffixMatching: boolean = vscode.workspace
				.getConfiguration("ps-replace-accents")
				.get<boolean>("diacriticRestoreSuffixMatching", false);

			// Read ignored words setting
			const ignoredWordsRaw: string = vscode.workspace
				.getConfiguration("ps-replace-accents")
				.get<string>("diacriticIgnoredWords", "");

			// Parse and filter unique ignored words
			const ignoredWords: string[] = normalizeIgnoreWords(ignoredWordsRaw);

			// Read dictionary setting
			const diacriticDictionary: string = vscode.workspace
				.getConfiguration("ps-replace-accents")
				.get<string>("diacriticDictionary", "hungarian");

			const restorer = new DiacriticRestorer(diacriticDictionary, ignoredWords, suffixMatching);

			await restorer.initialize();

			await processTextInEditor(text => restorer.restoreDiacritics(text));

			restorer.dispose();
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