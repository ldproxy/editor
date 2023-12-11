import * as vscode from "vscode";
// import { hoverData } from "../utilitiesLanguageFeatures/providers";
import { processProperties, findObjectsWithRef } from "../utilitiesLanguageFeatures/GetProviders";
import { defineDefs } from "../utilitiesLanguageFeatures/DefineDefs";
import { services } from "../utilitiesLanguageFeatures/services";
import { getNextLineOfPath } from "../utilitiesLanguageFeatures/GetLineOfNextPath";
// import { allYamlKeys } from "..";
import {
  extractIndexFromPath,
  getLinesForArrayIndex,
} from "../utilitiesLanguageFeatures/completionsForArray";

let allYamlKeys: {
  path: string;
  index: number;
  lineOfPath: number;
  arrayIndex?: number;
}[];

interface LooseDefinition {
  title?: string;
  description?: string;
  [key: string]: any;
}

interface DefinitionsMap {
  [key: string]: LooseDefinition;
}

let definitionsMap: DefinitionsMap = {};
let specifiedDefs: { ref: string; finalPath: string }[];
let allRefs: string[] | undefined = [];

const currentDocument = vscode.window.activeTextEditor?.document;
if (currentDocument) {
  specifiedDefs = defineDefs(currentDocument);

  if (specifiedDefs && specifiedDefs.length > 0) {
    getDefintionsMap(specifiedDefs);
  }
}

export function getKeys(
  yamlkeys: {
    path: string;
    index: number;
    lineOfPath: number;
    arrayIndex?: number;
  }[]
) {
  allYamlKeys = yamlkeys;
}

function getDefintionsMap(specifiedDefs: { ref: string; finalPath: string }[]) {
  specifiedDefs.map((def) => {
    definitionsMap = processProperties(def.ref, services.$defs, definitionsMap);
  });
  console.log("111", specifiedDefs);
  if (definitionsMap && Object.keys(definitionsMap).length > 0) {
    allRefs = findObjectsWithRef(definitionsMap);
    console.log("222", allRefs);
  }

  if (allRefs && allRefs.length > 0) {
    allRefs.map((ref) => {
      definitionsMap = {
        ...definitionsMap,
        ...processProperties(ref, services.$defs, definitionsMap),
      };
    });
  }
}
// References from specifieDefs
export const provider1 = vscode.languages.registerCompletionItemProvider("yaml", {
  provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
    const line = position.line;
    const column = position.character;
    const pathAtCursor = getPathAtCursor(allYamlKeys, line, column);

    console.log("pathAtCursor: " + pathAtCursor);
    console.log("bbb", definitionsMap);

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
                    console.log("allYamlKeys: ", allYamlKeys);
                    if (
                      finalValue !== undefined &&
                      allYamlKeys &&
                      !allYamlKeys.some((key) => key.path === `${title}.${finalValue}`)
                    ) {
                      console.log("ccc", refCompletions);
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
    const line = position.line;
    const column = position.character;
    const pathAtCursor = getPathAtCursor(allYamlKeys, line, column);

    console.log("allYamlKeys: ", allYamlKeys);
    console.log("pathAtCursor: " + pathAtCursor);
    const completions: vscode.CompletionItem[] = [];

    specifiedDefs.forEach((defObj) => {
      const ref = defObj.ref;
      const path = defObj.finalPath;
      const pathSplit = path.split(".");
      const specifiedDefsPath = pathSplit.slice(0, -1).join(".");
      const pathForArray = pathSplit.slice(0, -2).join(".");
      const arrayIndex = extractIndexFromPath(path);
      const possibleLines = getLinesForArrayIndex(allYamlKeys, arrayIndex ? arrayIndex : 0);
      const minLine = Math.min(...possibleLines);
      const maxLine = Math.max(...possibleLines);
      const lineOfNextPath = getNextLineOfPath(allYamlKeys, maxLine, arrayIndex);

      console.log("püp", minLine, lineOfNextPath, line);

      if (
        !specifiedDefsPath.includes("[") &&
        pathAtCursor === specifiedDefsPath &&
        definitionsMap
      ) {
        for (const key in definitionsMap) {
          if (definitionsMap.hasOwnProperty(key)) {
            const obj = definitionsMap[key];
            if (obj.groupname === ref) {
              const value = obj.title;
              if (
                value !== undefined &&
                allYamlKeys &&
                !allYamlKeys.some((key) => {
                  const fullPath = specifiedDefsPath ? `${specifiedDefsPath}.${value}` : value;
                  return key.path === fullPath;
                })
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
      } else if (
        specifiedDefsPath.includes("[") &&
        pathAtCursor === pathForArray &&
        line >= minLine &&
        line < lineOfNextPath &&
        definitionsMap
      ) {
        for (const key in definitionsMap) {
          if (definitionsMap.hasOwnProperty(key)) {
            const obj = definitionsMap[key];
            if (obj.groupname === ref) {
              console.log("ref", ref);
              const value = obj.title;
              if (
                value !== undefined &&
                allYamlKeys &&
                !allYamlKeys.some((key) => {
                  const fullPath = pathForArray ? `${pathForArray}.${value}` : value;
                  return key.path === fullPath;
                })
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
      }
    });
    return completions;
  },
});

// additionalReferences from specifiedDefs
export const provider3 = vscode.languages.registerCompletionItemProvider("yaml", {
  provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
    const line = position.line;
    const column = position.character;
    const pathAtCursor = getPathAtCursor(allYamlKeys, line, column);

    console.log("allYamlKeys: ", allYamlKeys);
    console.log("pathAtCursor: " + pathAtCursor);

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
  allYamlKeys: {
    path: string;
    index: number;
    lineOfPath: number;
    arrayIndex?: number;
  }[],
  line: number,
  column: number
) {
  if (allYamlKeys.length > 0) {
    let indexToUse;
    if (line - 2 < 0) {
      indexToUse = 0;
    } else {
      indexToUse = Math.min(line, allYamlKeys.length - 1);
    }
    function getPathAtCursorString(
      indexToUse: number,
      column: number,
      allYamlKeys: { path: string; index: number | null; lineOfPath: number }[]
    ): string {
      let foundObj = allYamlKeys.find((obj) => obj.lineOfPath === line);
      while (!foundObj && line > 0) {
        line--;

        foundObj = allYamlKeys.find((obj) => obj.lineOfPath === line);
      }
      console.log("foundObj", foundObj);
      if (foundObj) {
        indexToUse = allYamlKeys.indexOf(foundObj);
        console.log("iii", indexToUse);
      }

      for (let i = indexToUse; i >= 0; i--) {
        const obj = allYamlKeys[i];
        console.log("neu", obj, "indexToUse", indexToUse, "column", column);
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
