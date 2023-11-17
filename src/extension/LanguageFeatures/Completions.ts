import * as vscode from "vscode";
import * as yaml from "js-yaml";

let allYamlKeys: string[] = [];

export const provider3 = vscode.languages.registerCompletionItemProvider(
  "yaml",
  {
    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
      /*  const linePrefix = document.lineAt(position).text.slice(0, position.character);
      if (!linePrefix.endsWith("feature")) {
        return undefined;
      }
      */

      const yamlObject = yaml.load(document.getText());
      const line = position.line;
      const column = position.character;

      const pathAtCursor = getPathAtCursor(yamlObject, line, column);
      console.log("pathAtCursor: " + pathAtCursor);

      const item1 = new vscode.CompletionItem("featureProviderType");
      item1.kind = vscode.CompletionItemKind.Field;

      //   item1.insertText = "featureProviderType ";
      item1.command = {
        command: "editor.action.ldproxy: Create new entities",
        title: "Re-trigger completions...",
      };

      const simpleCompletion = new vscode.CompletionItem("Hellooooo World!");

      const commitCharacterCompletion = new vscode.CompletionItem("zuuuuuuuu");
      commitCharacterCompletion.documentation = new vscode.MarkdownString(
        "Press `c` to get `console.`"
      );

      //   commitCharacterCompletion.commitCharacters = ["z"];

      return [item1, simpleCompletion, commitCharacterCompletion];
    },
  },
  "e"
);

function getPathAtCursor(yamlObject: any, line: number, column: number) {
  if (yamlObject && typeof yamlObject === "object") {
    const keys: string[] = Object.keys(yamlObject);
    allYamlKeys.push(...keys);
    console.log("Alle nicht eingerückten Keys", keys);

    for (const key of keys) {
      const value = yamlObject[key];
      console.log("Ihre Values (Nur Objekte sind interessant und beinhalten weitere Keys)", value);

      if (value && typeof value === "object") {
        console.log("Objekte, wo wiederum weitere Keys drin sind", value);

        const valueKeys = Object.keys(value);

        for (const v of valueKeys) {
          if (typeof value[v] !== "object") {
            allYamlKeys.push(v);
            console.log("Einmal eingerückte Keys", v);
          } else if (value[v] && typeof value[v] === "object") {
            console.log("Objekte mit mehr als einer Einrückung:", value[v]);
            test(value[v]);
          }
        }
      }
    }
  }
}

function test(value: any) {
  const valueKeys = Object.keys(value);
  for (const key of valueKeys) {
    if (typeof value[key] !== "object") {
      allYamlKeys.push(key);
      console.log("Mehrmals eingerückte Keys", key);
    } else if (value[key] && typeof value[key] === "object") {
      test(value[key]);
    }
  }
}

console.log("allYamlKeys", allYamlKeys);
