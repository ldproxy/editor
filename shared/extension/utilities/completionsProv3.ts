import * as vscode from "vscode";

export function shouldShowCompletionsProv3(
  textBeforeCursor: string,
  arrayIndex: number | undefined,
  column: number,
  indentationOfpathAtCursor: number,
  indentationUsedInYaml: number,
  textBeforeCursorLength: number
): boolean {
  return (
    (textBeforeCursor.trim() === "" &&
      arrayIndex !== -1 &&
      (column === indentationOfpathAtCursor + indentationUsedInYaml * 1 ||
        column === indentationOfpathAtCursor + indentationUsedInYaml * 2)) ||
    (textBeforeCursor.trim() === "" &&
      column === indentationOfpathAtCursor + indentationUsedInYaml) ||
    (textBeforeCursor.trim() !== "" &&
      !textBeforeCursor.trim().includes("-") &&
      arrayIndex !== -1 &&
      (column === indentationOfpathAtCursor + indentationUsedInYaml * 1 + textBeforeCursorLength ||
        column ===
          indentationOfpathAtCursor + indentationUsedInYaml * 2 + textBeforeCursorLength)) ||
    (textBeforeCursor.trim() !== "" &&
      textBeforeCursor.trim() === "-" &&
      column === indentationOfpathAtCursor + indentationUsedInYaml + textBeforeCursorLength + 1) ||
    (textBeforeCursor.trim() !== "" &&
      textBeforeCursor.trim() !== "-" &&
      textBeforeCursor.trim().includes("-") &&
      column === indentationOfpathAtCursor + indentationUsedInYaml + textBeforeCursorLength) ||
    (textBeforeCursor.trim() !== "" &&
      !textBeforeCursor.trim().includes("-") &&
      column === indentationOfpathAtCursor + indentationUsedInYaml + textBeforeCursorLength)
  );
}

export function createCompletionItemProv3(
  value: string,
  obj: any,
  enumArray: any[],
  DEV: boolean
): vscode.CompletionItem {
  const completion = new vscode.CompletionItem(value);
  if (obj.type && obj.type === "object") {
    completion.insertText = `${value}: \n  `;
  } else if (obj.type && obj.type === "array") {
    completion.insertText = `${value}: \n  - `;
  } else {
    completion.insertText = `${value}: `;
  }
  completion.kind = vscode.CompletionItemKind.Method;
  if (
    enumArray.length > 0 &&
    enumArray.some((enumItem) => {
      return (
        obj.title === enumItem.key &&
        (obj.groupname === enumItem.groupname ||
          (obj.groupname === "_TOP_LEVEL_" && enumItem.groupname === ""))
      );
    })
  ) {
    completion.detail = "Enum";
  } else if (obj.type === "object" && obj.ref !== "") {
    completion.detail = "obj";
  } else if (obj.type === "array" && obj.ref !== "") {
    completion.detail = "array";
  }

  if (obj.description !== "") {
    completion.documentation = new vscode.MarkdownString(obj.description);
  }

  if (DEV) {
    console.log("completion21", value);
    console.log("insertText21", completion.insertText);
  }

  return completion;
}
