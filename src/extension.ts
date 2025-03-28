import * as vscode from 'vscode';
import { removeAccents } from './utils';

export function activate(context: vscode.ExtensionContext) {

	const disposable = vscode.commands.registerCommand('ps-remove-accent.helloWorld', () => {
		vscode.window.showInformationMessage(vscode.l10n.t('Hello World from {name}!', { name: 'Zsolt' }));
	});

	context.subscriptions.push(disposable);
}

export function deactivate() { }
