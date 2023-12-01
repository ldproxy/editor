import * as vscode from "vscode";
import * as yaml from "js-yaml";
// import { hoverData } from "../utilitiesLanguageFeatures/providers";
import { processProperties, findObjectsWithRef } from "../utilitiesLanguageFeatures/GetProviders";
import { defineDefs } from "../utilitiesLanguageFeatures/DefineDefs";
import { findPathInDocument } from "../utilitiesLanguageFeatures/findPathInDoc";
import { services } from "../utilitiesLanguageFeatures/services";

interface LooseDefinition {
  title?: string;
  description?: string;
  [key: string]: any;
}

interface DefinitionsMap {
  [key: string]: LooseDefinition;
}

let definitionsMap: DefinitionsMap = {};
let allRefs: string[] | undefined = [];
export let allYamlKeys: {
  path: string;
  index: number;
  lineOfPath: number | null;
  arrayIndex?: number;
}[] = [];

function getDefintionsMap(specifiedDefs: { ref: string; finalPath: string }[]) {
  specifiedDefs.map((def) => {
    definitionsMap = Object.assign(definitionsMap, processProperties(def.ref, services.$defs));
  });

  if (definitionsMap && Object.keys(definitionsMap).length > 0) {
    allRefs = findObjectsWithRef(definitionsMap);
  }

  if (allRefs && allRefs.length > 0) {
    console.log("allRefs", allRefs);
    allRefs.map((ref) => {
      definitionsMap = Object.assign(definitionsMap, processProperties(ref, services.$defs));
    });
  }
}
// References from specifieDefs
export const provider1 = vscode.languages.registerCompletionItemProvider("yaml", {
  provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
    const specifiedDefs = defineDefs(document);

    if (specifiedDefs && specifiedDefs.length > 0) {
      getDefintionsMap(specifiedDefs);
    }

    const yamlObject = yaml.load(document.getText());
    const line = position.line;
    const column = position.character;

    allYamlKeys = [];
    const pathAtCursor = getPathAtCursor(document, yamlObject, line, column, "");

    console.log("pathAtCursor: " + pathAtCursor);
    console.log("allYamlKeys", allYamlKeys);

    if (definitionsMap) {
      const refCompletions: vscode.CompletionItem[] = [];
      for (const key in definitionsMap) {
        if (definitionsMap.hasOwnProperty(key)) {
          const obj = definitionsMap[key];
          if (obj["ref"] !== "") {
            const title = obj.title;
            const value = obj.ref;
            if (title !== undefined && value !== undefined && pathAtCursor.endsWith(title)) {
              for (const key2 in definitionsMap) {
                if (definitionsMap.hasOwnProperty(key2)) {
                  const obj2 = definitionsMap[key2];
                  if (obj2.groupname === value) {
                    const finalValue = obj2.title;
                    if (
                      finalValue !== undefined &&
                      allYamlKeys &&
                      !allYamlKeys.some((key) => key.path === `${title}.${finalValue}`)
                    ) {
                      const completion = new vscode.CompletionItem(finalValue);
                      completion.kind = vscode.CompletionItemKind.Text;
                      if (obj2.description !== "") {
                        completion.documentation = new vscode.MarkdownString(obj2.description);
                      }
                      completion.command = {
                        command: "editor.action.ldproxy: Create new entities",
                        title: "Re-trigger completions...",
                      };
                      refCompletions.push(completion);
                    }
                  }
                }
              }
            }
          }
        }
      }
      return refCompletions;
    }
  },
});

//Examples and Completions for non-indented keys
export const provider2 = vscode.languages.registerCompletionItemProvider("yaml", {
  provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
    const specifiedDefs = defineDefs(document);

    if (specifiedDefs && specifiedDefs.length > 0) {
      getDefintionsMap(specifiedDefs);
    }

    const yamlObject = yaml.load(document.getText());
    const line = position.line;
    const column = position.character;

    allYamlKeys = [];
    const pathAtCursor = getPathAtCursor(document, yamlObject, line, column, "");

    console.log("pathAtCursor: " + pathAtCursor);
    console.log("allYamlKeys", allYamlKeys);

    if (pathAtCursor === "" && definitionsMap) {
      const completions: vscode.CompletionItem[] = [];

      for (const key in definitionsMap) {
        if (definitionsMap.hasOwnProperty(key)) {
          const obj = definitionsMap[key];
          if (!obj.ref) {
            const value = obj.title;
            if (
              value !== undefined &&
              allYamlKeys &&
              !allYamlKeys.some((key) => key.path === `${value}` && key.index === 0)
            ) {
              const completion = new vscode.CompletionItem(value);
              completion.kind = vscode.CompletionItemKind.Text;
              if (obj.description !== "") {
                completion.documentation = new vscode.MarkdownString(obj.description);
              }
              completions.push(completion);
            }
          }
        }
      }
      const commitCharacterCompletion = new vscode.CompletionItem("zuuuuuuuu");
      completions.push(commitCharacterCompletion);

      return completions;
    } else if (pathAtCursor === "connectorType.dudu.connectionInfo") {
      const simpleCompletion3 = new vscode.CompletionItem("Klaaaaappt immer noch!");
      simpleCompletion3.documentation = new vscode.MarkdownString("Press `c` to get `console.`");
      return [simpleCompletion3];
    } else {
      return [];
    }
  },
});

// additionalReferences from specifiedDefs
export const provider3 = vscode.languages.registerCompletionItemProvider("yaml", {
  provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
    const specifiedDefs = defineDefs(document);

    if (specifiedDefs && specifiedDefs.length > 0) {
      getDefintionsMap(specifiedDefs);
    }

    const yamlObject = yaml.load(document.getText());
    const line = position.line;
    const column = position.character;

    allYamlKeys = [];
    const pathAtCursor = getPathAtCursor(document, yamlObject, line, column, "");

    console.log("pathAtCursor: " + pathAtCursor);
    console.log("allYamlKeys", allYamlKeys);

    if (definitionsMap) {
      const refCompletions: vscode.CompletionItem[] = [];
      for (const key in definitionsMap) {
        if (definitionsMap.hasOwnProperty(key)) {
          const obj = definitionsMap[key];
          if (obj["addRef"] !== "") {
            console.log("zz", obj);
            const title = obj.title;
            const value = obj.addRef;
            if (
              title !== undefined &&
              value !== undefined &&
              new RegExp(`${title}\\.\\w*$`).test(pathAtCursor)
            ) {
              for (const key2 in definitionsMap) {
                if (definitionsMap.hasOwnProperty(key2)) {
                  const obj2 = definitionsMap[key2];

                  if (obj2.groupname === value) {
                    const finalValue = obj2.title;

                    if (
                      finalValue !== undefined &&
                      allYamlKeys &&
                      !allYamlKeys.some((key) =>
                        new RegExp(`${title}\\.\\b\\w+\\b\\.${finalValue}`).test(key.path)
                      )
                    ) {
                      const completion = new vscode.CompletionItem(finalValue);
                      completion.kind = vscode.CompletionItemKind.Text;
                      if (obj2.description !== "") {
                        completion.documentation = new vscode.MarkdownString(obj2.description);
                      }
                      completion.command = {
                        command: "editor.action.ldproxy: Create new entities",
                        title: "Re-trigger completions...",
                      };
                      refCompletions.push(completion);
                    }
                  }
                }
              }
            }
          }
        }
      }
      return refCompletions;
    }
  },
});

export function getPathAtCursor(
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
      if (Array.isArray(value)) {
        const arrayPath = currentPath ? `${currentPath}.${key}` : key;
        const arrayResults = findPathInDocument(document, arrayPath);
        if (
          arrayResults &&
          arrayResults.column !== undefined &&
          arrayResults.lineOfPath !== undefined
        ) {
          const { column, lineOfPath } = arrayResults;
          allYamlKeys = [...allYamlKeys, { path: arrayPath, index: column, lineOfPath }];
        }

        if (value.length > 1) {
          for (let i = 0, length = value.length; i < length; i++) {
            const object = value[i];
            const keysOfObject = Object.keys(object);
            for (const keyOfObject of keysOfObject) {
              const path = currentPath
                ? `${currentPath}.${key}.${keyOfObject}`
                : `${key}.${keyOfObject}`;
              console.log("pathi", path);
              const results = findPathInDocument(document, path, object[keyOfObject]);
              console.log("results", results);
              if (results && results.column !== undefined && results.lineOfPath !== undefined) {
                const { column, lineOfPath } = results;

                allYamlKeys = [
                  ...allYamlKeys,
                  { path, index: column - 2, lineOfPath, arrayIndex: i },
                ];
              }
            }
          }
        }
      } else if (typeof value !== "object" || value === null) {
        const path = currentPath ? `${currentPath}.${key}` : key;
        const result = findPathInDocument(document, path);

        if (result && result.column !== undefined && result.lineOfPath !== undefined) {
          const { column, lineOfPath } = result;
          allYamlKeys = [...allYamlKeys, { path, index: column, lineOfPath }];
        }
      } else if (value && typeof value === "object") {
        const path = currentPath ? `${currentPath}.${key}` : key;
        const result = findPathInDocument(document, path);

        if (result && result.column !== undefined && result.lineOfPath !== undefined) {
          const { column, lineOfPath } = result;
          allYamlKeys = [...allYamlKeys, { path, index: column, lineOfPath }];
        }
        getPathAtCursor(document, value, line, column, path);
      }
    }
  }
  if (allYamlKeys.length > 0) {
    let indexToUse;
    if (line - 2 < 0) {
      indexToUse = 0;
    } else {
      indexToUse = Math.min(line - 2, allYamlKeys.length - 1);
    }
    function getPathAtCursorString(
      indexToUse: number,
      column: number,
      allYamlKeys: { path: string; index: number | null }[]
    ): string {
      for (let i = indexToUse; i >= 0; i--) {
        const obj = allYamlKeys[i];
        if (obj.index !== null && obj.index < column) {
          return obj.path;
        }
      }
      return "";
    }

    const pathAtCursorString =
      column > 0 ? getPathAtCursorString(indexToUse, column, allYamlKeys) : "";

    console.log("column", column);
    console.log("lineeee", line);
    return pathAtCursorString;
  } else {
    return "";
  }
}
