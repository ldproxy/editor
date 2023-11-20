import * as vscode from "vscode";
import * as yaml from "js-yaml";
import { defineDefs } from "./GetProviders";
import { buildDataObjectForCompletions } from "./GetProviders";

let allYamlKeys: {}[] = [];
let completionKeys: {}[];
let otherCompletions: {}[];

export const provider3 = vscode.languages.registerCompletionItemProvider("yaml", {
  provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
    /*  const linePrefix = document.lineAt(position).text.slice(0, position.character);
      if (!linePrefix.endsWith("feature")) {
        return undefined;
      }
      */
    const specifiedDefs = defineDefs(document)[0];
    const otherSpecifiedDefs = defineDefs(document)[1];
    if (specifiedDefs && specifiedDefs.length > 0) {
      completionKeys = buildDataObjectForCompletions(specifiedDefs);
      otherCompletions = buildDataObjectForCompletions(otherSpecifiedDefs);
    }

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

      completionKeys.forEach((obj: Record<string, string>) => {
        const value = obj.key;
        if (value !== undefined) {
          const completion = new vscode.CompletionItem(value);
          completion.kind = vscode.CompletionItemKind.Text;
          completions.push(completion);
        }
      });

      otherCompletions.forEach((obj: Record<string, string>) => {
        const value = obj.key;
        if (value !== undefined) {
          const completion = new vscode.CompletionItem(value);
          completion.kind = vscode.CompletionItemKind.Text;
          completions.push(completion);
        }
      });

      const commitCharacterCompletion = new vscode.CompletionItem("zuuuuuuuu");
      completions.push(commitCharacterCompletion);
      console.log("wichtig", completions);

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
