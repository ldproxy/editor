import * as vscode from "vscode";
import * as yaml from "js-yaml";
import { defineDefs } from "./GetProviders";
import { buildDataObjectForCompletions } from "./GetProviders";

let allYamlKeys: {}[] = [];
let completionKeys: {}[];
let otherCompletions: {}[];

// References from specifieDefs
export const provider1 = vscode.languages.registerCompletionItemProvider("yaml", {
  provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
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

    if (completionKeys && completionKeys.length > 1) {
      const refCompletions: vscode.CompletionItem[] = [];
      completionKeys.forEach((obj: Record<string, string>) => {
        if (obj["ref"] !== undefined) {
          const key = obj.key;
          const value = obj.ref;
          if (key !== undefined && value !== undefined && pathAtCursor === key) {
            const lastSlashIndex = value.lastIndexOf("/");
            const lastPartValue = value.substring(lastSlashIndex + 1);
            const completionWords = buildDataObjectForCompletions(lastPartValue);
            completionWords.forEach((obj) => {
              const valueObj = obj.key;
              if (valueObj !== undefined) {
                const completion = new vscode.CompletionItem(valueObj);
                completion.kind = vscode.CompletionItemKind.Text;
                completion.command = {
                  command: "editor.action.ldproxy: Create new entities",
                  title: "Re-trigger completions...",
                };
                refCompletions.push(completion);
              }
            });
          }
        }
      });
      console.log("refCompletions: ", refCompletions);
      return refCompletions;
    }
  },
});

// References from otherSpecifiedDefs
export const provider2 = vscode.languages.registerCompletionItemProvider("yaml", {
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

    if (otherCompletions && otherCompletions.length > 1) {
      const otherRefCompletions: vscode.CompletionItem[] = [];
      otherCompletions.forEach((obj: Record<string, string>) => {
        if (obj["ref"] !== undefined) {
          const key = obj.key;
          const value = obj.ref;
          console.log("teeeeest", key);
          if (key !== undefined && value !== undefined && pathAtCursor === key) {
            const lastSlashIndex = value.lastIndexOf("/");
            const lastPartValue = value.substring(lastSlashIndex + 1);
            const completionWords = buildDataObjectForCompletions(lastPartValue);
            completionWords.forEach((obj) => {
              const valueObj = obj.key;
              if (valueObj !== undefined) {
                const completion = new vscode.CompletionItem(valueObj);
                completion.kind = vscode.CompletionItemKind.Text;
                completion.command = {
                  command: "editor.action.ldproxy: Create new entities",
                  title: "Re-trigger completions...",
                };
                otherRefCompletions.push(completion);
              }
            });
          }
        }
      });
      console.log("otherRefCompletions: ", otherRefCompletions);
      return otherRefCompletions;
    }
  },
});

//Examples and Completions for non-indented keys
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
    console.log("otherCompletions", otherCompletions);

    if (
      pathAtCursor === "" &&
      completionKeys &&
      otherCompletions &&
      completionKeys.length > 1 &&
      otherCompletions.length > 1
    ) {
      console.log("tatüta");

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
    const indexToUse = Math.min(line - 2, allYamlKeys.length - 1);
    const pathAtCursor = allYamlKeys[indexToUse];
    const pathAtCursorString = pathAtCursor.toString();
    console.log("pathAtCursorString", pathAtCursorString);
    console.log("line", line);
    console.log("indexToUse", indexToUse);

    /* Wenn es noch keinen eingerückten Key gibt, damit die App erkennt, wenn man vorhat dies zu tun 
    und entsprechende Vorschläge macht.
    */
    const lineText = document.lineAt(line - 1).text;
    console.log("lineText", lineText);
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
