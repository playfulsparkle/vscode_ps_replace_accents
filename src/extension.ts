import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	const disposable = vscode.commands.registerCommand('ps-dev-tools.helloWorld', () => {
		vscode.window.showInformationMessage(vscode.l10n.t('Hello World from {name}!', { name: 'Zsolt' }));
	});

	context.subscriptions.push(disposable);
}

export function deactivate() { }
