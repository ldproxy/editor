import * as vscode from "vscode";

export const getWorkspacePath = (): string | undefined => {
  const workspace = getWorkspaceUri();

  if (workspace && workspace.fsPath) {
    // workaround for docker + windows
    if (workspace.fsPath.startsWith("\\")) {
      return getWorkspacePathNormalized();
    }

    return workspace.fsPath;
  }

  return undefined;
};

export const getCurrentFilePath = (): string | undefined => {
  const activeTextEditor = vscode.window.activeTextEditor;
  const workspacePath = getWorkspacePathNormalized();

  if (activeTextEditor && workspacePath) {
    const path = activeTextEditor.document.uri.path;

    if (path.startsWith(workspacePath)) {
      return path.substring(workspacePath.length + 1);
    }
  }

  return undefined;
};

export const getRelativeFilePath = (uri: vscode.Uri): string | undefined => {
  const workspacePath = getWorkspacePathNormalized();

  if (uri && workspacePath) {
    const path = uri.path;

    if (path.startsWith(workspacePath)) {
      return path.substring(workspacePath.length + 1);
    }
  }

  return undefined;
};

export const getWorkspaceUri = (): vscode.Uri | undefined => {
  const workspaceFolders = vscode.workspace.workspaceFolders;

  if (workspaceFolders && workspaceFolders[0]) {
    return workspaceFolders[0].uri;
  }

  return undefined;
};

const getWorkspacePathNormalized = (): string | undefined => {
  const workspace = getWorkspaceUri();

  return workspace ? workspace.path : undefined;
};
