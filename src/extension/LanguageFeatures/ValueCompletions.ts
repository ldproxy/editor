import * as vscode from "vscode";
import { buildEnumArray } from "../utilitiesLanguageFeatures/getEnums";
import { getSchemaDefs } from "../utilitiesLanguageFeatures/schemas";

export const provider4 = vscode.languages.registerCompletionItemProvider("yaml", {
  async provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
    const schemaDefs = await getSchemaDefs();

    if (!schemaDefs) {
      return [];
    }

    const enumArray: { key: string; enum: string }[] = buildEnumArray(schemaDefs);
    console.log("enumArray", enumArray);
    const line = position.line;
    const keyAtCursor = findKeyForValueCompletion(line, document, position);
    const valueCompletions: vscode.CompletionItem[] = [];

    enumArray.forEach((enumObj) => {
      if (enumObj.hasOwnProperty("key")) {
        const key = enumObj.key;
        const myEnum = enumObj.enum;
        if (
          key !== undefined &&
          myEnum !== undefined &&
          keyAtCursor !== "" &&
          keyAtCursor === key
        ) {
          console.log("valueCompletionsKey", key);
          const completion = new vscode.CompletionItem(myEnum);
          completion.kind = vscode.CompletionItemKind.Method;
          completion.command = {
            command: "editor.action.ldproxy: Create new entities",
            title: "Re-trigger completions...",
          };
          const existing = valueCompletions.find((existingComp) => existingComp.label === myEnum);
          if (existing === undefined) {
            valueCompletions.push(completion);
          }
        }
      }
    });

    return valueCompletions;
  },
});

function findKeyForValueCompletion(line: number, document: vscode.TextDocument, position: any) {
  const textBeforeCursor = document.getText(
    new vscode.Range(new vscode.Position(line, 0), position)
  );

  let textBeforeColon = "";
  if (textBeforeCursor.includes(":")) {
    const lastIndex = textBeforeCursor.lastIndexOf(":");
    textBeforeColon = textBeforeCursor.substring(0, lastIndex).trim();
    console.log("Text vor dem Doppelpunkt:", textBeforeColon);
  }
  return textBeforeColon;
}
