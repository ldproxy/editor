import * as vscode from "vscode";

export function findPathInDocument(
  document: vscode.TextDocument,
  fullPath: string,
  value?: any
): { column?: number; lineOfPath?: number } | null {
  const lines: string[] = document.getText().split("\n");
  const pathParts = fullPath.split(".");
  let line = 0;
  let column = 0;

  if (value !== undefined) {
  }
  for (const part of pathParts) {
    let found = false;

    while (line < lines.length) {
      const correctLine = document.lineAt(line).text;

      let index = -1;

      if (pathParts.indexOf(part) === pathParts.length - 1) {
        if (value !== undefined && correctLine.includes(part) && correctLine.includes(value)) {
          index = correctLine.indexOf(part);
        } else if (value === undefined && correctLine.includes(`${part}:`)) {
          index = correctLine.indexOf(part);
        }
      } else {
        if (value !== undefined && correctLine.includes(part) && correctLine.includes(value)) {
          index = correctLine.indexOf(part);
        } else if (correctLine.includes(`${part}:`)) {
          index = correctLine.indexOf(part);
        }
      }
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
