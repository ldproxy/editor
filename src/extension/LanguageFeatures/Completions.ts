import * as vscode from "vscode";
import * as yaml from "js-yaml";
import { defineDefs } from "./GetProviders";

let allYamlKeys: {}[] = [];

export const provider3 = vscode.languages.registerCompletionItemProvider("yaml", {
  provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
    /*  const linePrefix = document.lineAt(position).text.slice(0, position.character);
      if (!linePrefix.endsWith("feature")) {
        return undefined;
      }
      */
    const completionKeys = defineDefs(document)[0];
    const otherCompletions = defineDefs(document)[1];

    const yamlObject = yaml.load(document.getText());
    const line = position.line;
    const column = position.character;

    allYamlKeys = [];
    const pathAtCursor = getPathAtCursor(document, yamlObject, line, column, "");
    console.log("pathAtCursor: " + pathAtCursor);
    console.log("allYamlKeys", allYamlKeys);

    if (pathAtCursor === "connectionInfo") {
      const item1 = new vscode.CompletionItem("featureProviderType");
      item1.kind = vscode.CompletionItemKind.Field;

      item1.command = {
        command: "editor.action.ldproxy: Create new entities",
        title: "Re-trigger completions...",
      };

      const simpleCompletion = new vscode.CompletionItem("Hellooooo World!");

      return [item1, simpleCompletion];
    } else if (pathAtCursor === "") {
      const completions: vscode.CompletionItem[] = [];

      completionKeys.forEach((key) => {
        const completion = new vscode.CompletionItem(key);
        completions.push(completion);
      });
      otherCompletions.forEach((key) => {
        const completion = new vscode.CompletionItem(key);
        completions.push(completion);
      });

      const commitCharacterCompletion = new vscode.CompletionItem("zuuuuuuuu");
      completions.push(commitCharacterCompletion);

      return completions;
    } else if (pathAtCursor === "connectorType.connectionInfo") {
      const simpleCompletion2 = new vscode.CompletionItem("Klaaaaappt!");
      return [simpleCompletion2];
    } else if (pathAtCursor === "connectorType.dudu.connectionInfo") {
      const simpleCompletion3 = new vscode.CompletionItem("Klaaaaappt immer noch!");
      simpleCompletion3.documentation = new vscode.MarkdownString("Press `c` to get `console.`");
      return [simpleCompletion3];
    } else {
      return [];
    }
  },
});

function getPathAtCursor(
  document: vscode.TextDocument,
  yamlObject: any,
  line: number,
  column: number,
  currentPath: string
) {
  if (yamlObject && typeof yamlObject === "object") {
    const keys: string[] = Object.keys(yamlObject);

    for (const key of keys) {
      const value = yamlObject[key];

      if (typeof value !== "object" || value === null) {
        const path = currentPath ? `${currentPath}.${key}` : key;
        allYamlKeys.push(path);
      } else if (value && typeof value === "object") {
        const path = currentPath ? `${currentPath}.${key}` : key;
        allYamlKeys.push(path);

        getPathAtCursor(document, value, line, column, path);
      }
    }
  }
  if (allYamlKeys.length > 0) {
    let newPath;
    let columnPathAtCoursorString;
    const indexToUse = Math.min(line - 1, allYamlKeys.length - 1);
    const pathAtCursor = allYamlKeys[indexToUse];
    const pathAtCursorString = pathAtCursor.toString();

    /* Wenn es noch keinen eingerückten Key gibt, damit die App erkennt, wenn man vorhat dies zu tun 
    und entsprechende Vorschläge macht.
    */
    const lineText = document.lineAt(line - 1).text;
    if (pathAtCursorString.includes(".")) {
      const lastDotIndex = pathAtCursorString.lastIndexOf(".");
      const pathPartAfterLastDot = pathAtCursorString.substring(lastDotIndex + 1);

      if (lineText.includes(pathPartAfterLastDot)) {
        columnPathAtCoursorString = lineText.indexOf(pathPartAfterLastDot);
      }
    } else if (lineText.includes(pathAtCursorString)) {
      columnPathAtCoursorString = lineText.indexOf(pathAtCursorString);
    }

    if (columnPathAtCoursorString !== undefined && column > columnPathAtCoursorString) {
      newPath = pathAtCursorString;
    } else {
      const pathParts = pathAtCursorString.split(".");
      pathParts.pop();
      newPath = pathParts.join(".");
    }
    return newPath;
  } else {
    return "";
  }
}
