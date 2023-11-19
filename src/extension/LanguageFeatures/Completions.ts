import * as vscode from "vscode";
import * as yaml from "js-yaml";

let allYamlKeys: {}[] = [];

export const provider3 = vscode.languages.registerCompletionItemProvider("yaml", {
  provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
    /*  const linePrefix = document.lineAt(position).text.slice(0, position.character);
      if (!linePrefix.endsWith("feature")) {
        return undefined;
      }
      */

    const yamlObject = yaml.load(document.getText());
    const line = position.line;
    const column = position.character;

    allYamlKeys = [];
    const pathAtCursor = getPathAtCursor(yamlObject, line, column, "");
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
      const commitCharacterCompletion = new vscode.CompletionItem("zuuuuuuuu");
      commitCharacterCompletion.documentation = new vscode.MarkdownString(
        "Press `c` to get `console.`"
      );
      return [commitCharacterCompletion];
    } else {
      return [];
    }
  },
});

function getPathAtCursor(yamlObject: any, line: number, column: number, currentPath: string) {
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

        getPathAtCursor(value, line, column, path);
      }
    }
  }
  if (allYamlKeys.length > 0) {
    let newPath;
    const indexToUse = Math.min(line - 1, allYamlKeys.length - 1);
    const pathAtCursor = allYamlKeys[indexToUse];
    const pathAtCursorString = pathAtCursor.toString();

    /* Wenn es noch keinen eingerückten Key gibt, damit die App erkennt, wenn man vorhat dies zu tun 
    und entsprechende Vorschläge macht.
    Müsste man dann so natürlich auch noch für eingerücktere Fälle machen. Also dann einfach mehr
    columns und Punkte.
    */
    if (column === 2 && !pathAtCursorString.endsWith(".")) {
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
