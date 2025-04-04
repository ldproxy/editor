import * as vscode from "vscode";
import { getIndentation, indentationOfYamlObjectAboveCursor } from "./yaml";

interface YamlKey {
  path: string;
  index: number;
  lineOfPath: number;
  startOfArray?: number;
  arrayIndex?: number;
}

export const gatherInformation = (
  position: vscode.Position,
  document: vscode.TextDocument,
  allYamlKeys: any
) => {
  const line = position.line + 1;
  const column = position.character;

  // When a few letters of the key are already typed when hitting auto completion
  const textBeforeCursor: string = document
    .lineAt(position.line)
    .text.substring(0, position.character);
  const lineText: string = document.lineAt(position.line).text;
  const indentation: number = lineText.search(/\S|$/);
  const textBeforeCursorLength: number = textBeforeCursor.trim().length;

  const text = document.getText();
  const lines = text.split("\n");
  const currentLine = lines[line - 1];
  const pathAtCursor = currentLine.includes(":")
    ? undefined
    : textBeforeCursor.trim() !== ""
    ? getPathAtCursor(allYamlKeys, line - 1, indentation)
    : getPathAtCursor(allYamlKeys, line, column);

  // Only show Completions when the Cursor has exactly the correct indentation
  const indentationUsedInYaml = getIndentation(document.getText());
  const indentationOfpathAtCursor = indentationOfYamlObjectAboveCursor(
    allYamlKeys,
    line,
    pathAtCursor
  );

  return {
    textBeforeCursor,
    textBeforeCursorLength,
    indentation,
    indentationOfpathAtCursor,
    line,
    column,
    indentationUsedInYaml,
    pathAtCursor,
  };
};

export function getPathAtCursor(allYamlKeys: YamlKey[], line: number, column: number): string {
  // Wenn textBeforeCursor existiert, muss in getPathAtCursor nicht von der Einrückung des Cursors,
  // sondern vom ersten Buchstaben des Wortes ausgegangen werden. AUßerdem muss line - 1 gerechnet werden.
  // Also werden einfach andere parameter reingegeben.

  if (allYamlKeys.length === 0) {
    return "";
  }

  let indexToUse = Math.min(line, allYamlKeys.length - 1);

  function getPathAtCursorString(
    indexToUse: number,
    column: number,
    allYamlKeys: YamlKey[]
  ): string {
    let foundObj = allYamlKeys.find((obj) => obj.lineOfPath === line);
    while (!foundObj && line > 0) {
      line--;
      foundObj = allYamlKeys.find((obj) => obj.lineOfPath === line);
    }

    if (foundObj) {
      indexToUse = allYamlKeys.indexOf(foundObj);
    }

    for (let i = indexToUse; i >= 0; i--) {
      const obj = allYamlKeys[i];
      if (obj.index !== null && obj.index < column) {
        return obj.path;
      }
    }
    return "";
  }

  return column > 0 ? getPathAtCursorString(indexToUse, column, allYamlKeys) : "";
}

export function shouldFilterExistingCharacters(
  textBeforeCursor: string,
  finalValue: string
): boolean {
  if (textBeforeCursor.trim() !== "") {
    if (textBeforeCursor.trim().includes("-")) {
      const textWithoutHyphen = textBeforeCursor.trim().replace("-", "");
      return finalValue.startsWith(textWithoutHyphen.trim());
    } else {
      return finalValue.startsWith(textBeforeCursor.trim());
    }
  }
  return true;
}

export function createCompletionItem(
  finalValue: string,
  obj2: any,
  enumArray: any[],
  DEV: boolean
): vscode.CompletionItem {
  const completion = new vscode.CompletionItem(finalValue);
  if (obj2.type && obj2.type === "object") {
    completion.insertText = `${finalValue}: \n  `;
  } else if (obj2.type && obj2.type === "array") {
    completion.insertText = `${finalValue}: \n  - `;
  } else {
    completion.insertText = `${finalValue}: `;
  }
  completion.kind = vscode.CompletionItemKind.Method;
  if (
    enumArray.length > 0 &&
    enumArray.some((enumItem) => {
      return (
        obj2.title === enumItem.key &&
        (obj2.groupname === enumItem.groupname ||
          (obj2.groupname === "_TOP_LEVEL_" && enumItem.groupname === ""))
      );
    })
  ) {
    completion.detail = "Enum";
  } else if (obj2.type === "object" && obj2.ref !== "") {
    completion.detail = "obj";
  } else if (obj2.type === "array" && obj2.ref !== "") {
    completion.detail = "array";
  }

  if (obj2.description !== "") {
    completion.documentation = new vscode.MarkdownString(obj2.description);
  }

  if (
    completion.detail === "Enum" ||
    completion.detail === "obj" ||
    completion.detail === "array"
  ) {
    completion.command = {
      title: "Trigger Suggest",
      command: "editor.action.triggerSuggest",
    };
  }

  if (DEV) {
    console.log("completion1", finalValue);
    console.log("insertText1", completion.insertText);
  }

  return completion;
}
