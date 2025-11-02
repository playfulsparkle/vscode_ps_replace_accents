import * as vscode from "vscode";
import * as path from "path";
import {
	validateUserCharacterMappings,
	normalizeIgnoreWords
} from "./shared";
import DiacriticRestorer from "./restoreDiacritic";
import DiacriticRemover from "./removeDiacritic";

/**
 * VS Code Extension: Playful Sparkle Replace Accents
 * 
 * A comprehensive diacritic management extension that provides:
 * - Removal of accent marks from text and file names
 * - Restoration of accent marks using language-specific dictionaries
 * - Support for multiple languages and custom character mappings
 * - File and folder name processing in Explorer context menu
 * 
 * @module extension
 */

/**
 * Activates the PS Replace Accents extension
 * 
 * This function is called by VS Code when the extension is activated.
 * It registers all commands, sets up event handlers, and initializes
 * the extension functionality.
 * 
 * @param {vscode.ExtensionContext} context - The extension context provided by VS Code

 * @see {@link https://code.visualstudio.com/api/references/vscode-api#ExtensionContext | ExtensionContext}
 */
export function activate(context: vscode.ExtensionContext) {
	/**
	 * Command identifiers for the extension
	 * @enum {string}
	 */
	enum CommandId {
		/** Opens the GitHub issues page to report problems */
		ReportIssue = "ps-replace-accents.reportIssue",
		/** Removes diacritics from selected text or entire document */
		ReplaceDiacriticts = "ps-replace-accents.removeDiacritics",
		/** Removes diacritics from file or folder names in Explorer */
		ReplaceDiacritictsFileOrFolder = "ps-replace-accents.removeDiacriticsFileOrFolder",
		/** Restores diacritics to normalized text using dictionary */
		RestoreDiacritics = "ps-replace-accents.restoreDiacritics",
	}

	/**
	 * Processes text in the active editor with a transformation function
	 * 
	 * Handles both text selections and entire document processing with
	 * optional line expansion for better paragraph handling.
	 * 
	 * @param {function} transformFn - The transformation function to apply to text
	 * @param {boolean} [expandToFullLines=false] - Whether to expand selections to full lines
	 * @param {any} [options] - Optional parameters to pass to the transform function
	 * @returns {Promise<number>} Processing status code: 
	 *   -1: No active editor
	 *    0: Processed selections
	 *    1: Processed entire document
	 * 
	 * @throws {Error} May throw errors during editor edit operations
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

	/**
	 * Removes diacritics from file or folder names in the file system
	 * 
	 * Handles the renaming process with safety checks, overwrite confirmation,
	 * and proper error handling. Used by the Explorer context menu command.
	 * 
	 * @param {vscode.Uri} uri - The URI of the file or folder to rename
	 * @param {Object} userMappings - Custom character mappings for diacritic removal
	 * @returns {Promise<void>}
	 * 
	 * @throws {Error} Shows error messages to user but doesn't throw to caller
	 */
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

	// Command handlers for all extension commands
	const commandHandlers = {
		/**
		 * Opens the GitHub issues page for reporting problems or suggestions
		 * 
		 * @returns {void}
		 */
		[CommandId.ReportIssue]: () => vscode.env.openExternal(vscode.Uri.parse("https://github.com/playfulsparkle/vscode_ps_replace_accents/issues")),

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
		[CommandId.ReplaceDiacriticts]: async () => {
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
		[CommandId.ReplaceDiacritictsFileOrFolder]: async (uri: vscode.Uri, selectedUris?: vscode.Uri[]) => {
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

		/**
		 * Restores diacritics to normalized text using language dictionaries
		 * 
		 * Reads configuration for dictionary language, suffix matching, and
		 * ignored words. Initializes the diacritic restorer and processes
		 * the active editor content.
		 * 
		 * @returns {Promise<void>}
		 */
		[CommandId.RestoreDiacritics]: async () => {
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

/**
 * Deactivates the PS Replace Accents extension
 * 
 * Called by VS Code when the extension is deactivated. Currently performs
 * no cleanup as all resources are managed by VS Code's subscription system.
 * 
 * @returns {void}
 */
export function deactivate() { }