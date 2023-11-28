import * as vscode from "vscode";

export function findPathInDocument(
  document: vscode.TextDocument,
  fullPath: string
): { column?: number; lineOfPath?: number } | null {
  const lines: string[] = document.getText().split("\n");
  const pathParts = fullPath.split(".");

  let line = 0;
  let column = 0;

  for (const part of pathParts) {
    let found = false;

    while (line < lines.length) {
      const correctLine = document.lineAt(line).text;
      const index = correctLine.indexOf(part);
      if (index !== -1) {
        column = index;
        found = true;
        break;
      }

      line++;
    }

    if (!found) {
      return null;
    }
  }
  return { column, lineOfPath: line };
}
