import * as vscode from "vscode";
import * as yaml from "js-yaml";

let allYamlKeys: {}[] = [];

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

      allYamlKeys = [];
      const pathAtCursor = getPathAtCursor(yamlObject, line, "");
      console.log("pathAtCursor: " + pathAtCursor);
      console.log("allYamlKeys", allYamlKeys);

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

function getPathAtCursor(yamlObject: any, line: number, currentPath: string) {
  if (yamlObject && typeof yamlObject === "object") {
    const keys: string[] = Object.keys(yamlObject);

    for (const key of keys) {
      const value = yamlObject[key];

      if (typeof value !== "object") {
        const path = currentPath ? `${currentPath}.${key}` : key;
        allYamlKeys.push(path);
      } else if (value && typeof value === "object") {
        const path = currentPath ? `${currentPath}.${key}` : key;
        allYamlKeys.push(path);

        getPathAtCursor(value, line, path);
      }
    }
  }
  console.log("line", line);
  const pathAtCursor = allYamlKeys[line - 1];
  return pathAtCursor;
}
