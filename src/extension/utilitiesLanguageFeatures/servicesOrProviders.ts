import * as vscode from "vscode";

export function getCurrentFilePath(): string | undefined {
  const activeTextEditor = vscode.window.activeTextEditor;
  if (activeTextEditor) {
    return activeTextEditor.document.uri.fsPath;
  }
  return undefined;
}

export function servicesOrProviders(currentFilePath: string) {
  const splitPath = currentFilePath.split("\\");
  if (splitPath.length >= 2) {
    return splitPath[splitPath.length - 2];
  }
}
