import * as vscode from "vscode";

export const getWorkspace = (): vscode.Uri | undefined => {
  const workspaceFolders = vscode.workspace.workspaceFolders;

  if (workspaceFolders && workspaceFolders[0]) {
    return workspaceFolders[0].uri;
  }

  return undefined;
};

export const getWorkspacePath = (): string | undefined => {
  const workspace = getWorkspace();

  return workspace ? workspace.fsPath : undefined;
};

export const getCurrentFilePath = (): string | undefined => {
  const activeTextEditor = vscode.window.activeTextEditor;
  const workspacePath = getWorkspacePath();

  if (activeTextEditor && workspacePath) {
    const path = activeTextEditor.document.uri.fsPath;

    if (path.startsWith(workspacePath)) {
      return path.substring(workspacePath.length + 1);
    }
  }

  return undefined;
};
