import * as vscode from "vscode";
import { defineDefs } from "../utilitiesLanguageFeatures/defineDefs";
import {
  extractIndexFromPath,
  getLinesForArrayIndex,
  getMaxLine,
} from "../utilitiesLanguageFeatures/handlingYamlArrays";
import { getDefinitionsMap } from "../utilitiesLanguageFeatures/getDefinitionsMap";
import { removeDuplicates } from "../utilitiesLanguageFeatures/removeDuplicatesInArray";
import { DEV } from "../utilities/constants";

let allYamlKeys: {
  path: string;
  index: number;
  lineOfPath: number;
  startOfArray?: number;
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

export async function getSchemaMapCompletions() {
  const currentDocument = vscode.window.activeTextEditor?.document;
  if (currentDocument) {
    specifiedDefs = await defineDefs(currentDocument);
    const uniqueDefs = removeDuplicates(specifiedDefs);
    if (uniqueDefs && uniqueDefs.length > 0) {
      definitionsMap = await getDefinitionsMap(uniqueDefs);
    }
  }
}

export function getKeys(
  yamlkeys: {
    path: string;
    index: number;
    lineOfPath: number;
    startOfArray?: number;
  }[]
) {
  allYamlKeys = yamlkeys;
}
// References from specifiedDefs
export const provider1 = vscode.languages.registerCompletionItemProvider("yaml", {
  provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
    const line = position.line + 1;
    const column = position.character;
    const pathAtCursor = getPathAtCursor(allYamlKeys, line, column);
    const currentStartOfArray = allYamlKeys.find(
      (item) => item.lineOfPath === line - 1
    )?.startOfArray;
    if (DEV) {
      console.log("pathAtCursor: " + pathAtCursor);
      console.log("bbb", definitionsMap);
      console.log("currentArrayIndex: " + currentStartOfArray);
    }

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
                      obj2.deprecated !== true &&
                      allYamlKeys &&
                      !allYamlKeys.some((key) => {
                        if (
                          key.hasOwnProperty("startOfArray") &&
                          key.startOfArray === currentStartOfArray &&
                          key.path.includes(`${title}.${finalValue}`)
                        ) {
                          return true;
                        } else if (key.hasOwnProperty("startOfArray")) {
                          return false;
                        } else {
                          return key.path === `${title}.${finalValue}`;
                        }
                      })
                    ) {
                      console.log("ccc", refCompletions);
                      const completion = new vscode.CompletionItem(finalValue);
                      completion.kind = vscode.CompletionItemKind.Method;
                      if (obj2.description !== "") {
                        completion.documentation = new vscode.MarkdownString(obj2.description);
                      }
                      completion.command = {
                        command: "editor.action.ldproxy: Create new entities",
                        title: "Re-trigger completions...",
                      };
                      const existing = refCompletions.find(
                        (existingComp) => existingComp.label === finalValue
                      );
                      if (existing === undefined) {
                        refCompletions.push(completion);
                      }
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
    const line = position.line + 1;
    const column = position.character;
    const pathAtCursor = getPathAtCursor(allYamlKeys, line, column);

    console.log("allYamlKeys: ", allYamlKeys);
    console.log("pathAtCursor: " + pathAtCursor);
    const completions: vscode.CompletionItem[] = [];
    const uniqueDefs = removeDuplicates(specifiedDefs);
    console.log("uniqueDefs", uniqueDefs);

    uniqueDefs.forEach((defObj) => {
      const ref = defObj.ref;
      const path = defObj.finalPath;
      const pathSplit = path.split(".");
      const specifiedDefsPath = pathSplit.slice(0, -1).join(".");
      const pathForArray = pathSplit.slice(0, -2).join(".");
      const arrayIndex = extractIndexFromPath(path);
      const minLine = getLinesForArrayIndex(
        allYamlKeys,
        arrayIndex ? arrayIndex : 0,
        specifiedDefsPath
      );
      let maxLine: number | undefined;
      if (minLine) {
        maxLine = getMaxLine(allYamlKeys, minLine);
      }
      const keyAtStartOfArray = allYamlKeys.find((key) => key.lineOfPath === minLine);
      const columnOfArray = keyAtStartOfArray ? keyAtStartOfArray.index : 0;

      if (DEV) {
        console.log("minmax", minLine, maxLine, line);
        console.log("speziu2", specifiedDefsPath, pathAtCursor);
        console.log("keyAtStartOfArray: ", keyAtStartOfArray);
      }

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
                obj.deprecated !== true &&
                allYamlKeys &&
                !allYamlKeys.some((key) => {
                  const fullPath = specifiedDefsPath ? `${specifiedDefsPath}.${value}` : value;
                  return key.path === fullPath;
                })
              ) {
                const completion = new vscode.CompletionItem(value);
                completion.kind = vscode.CompletionItemKind.Method;
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
        minLine !== undefined &&
        line >= minLine &&
        maxLine !== undefined &&
        line < maxLine &&
        definitionsMap &&
        column === columnOfArray
      ) {
        if (DEV) {
          console.log("columnOfArray", columnOfArray);
          console.log("speziu", specifiedDefsPath, pathAtCursor);
        }

        for (const key in definitionsMap) {
          if (definitionsMap.hasOwnProperty(key)) {
            const obj = definitionsMap[key];
            if (obj.groupname === ref) {
              console.log("ref", ref);
              const value = obj.title;
              if (
                value !== undefined &&
                obj.deprecated !== true &&
                allYamlKeys &&
                !allYamlKeys.some((key) => {
                  const fullPath = pathForArray ? `${pathForArray}.${value}` : value;
                  return key.path === fullPath;
                })
              ) {
                const completion = new vscode.CompletionItem(value);
                completion.kind = vscode.CompletionItemKind.Method;
                if (obj.description !== "") {
                  completion.documentation = new vscode.MarkdownString(obj.description);
                }
                const existing = completions.find((existingComp) => existingComp.label === value);
                if (existing === undefined) {
                  completions.push(completion);
                }
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
    const line = position.line + 1;
    const column = position.character;
    const pathAtCursor = getPathAtCursor(allYamlKeys, line, column);
    if (DEV) {
      console.log("allYamlKeys: ", allYamlKeys);
      console.log("pathAtCursor: " + pathAtCursor);
    }

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
              let arrayIndex: number | undefined = -1;
              let addRefOfObjInArray: string | undefined = "";
              let refinedObjPath: string | undefined;
              let objPath: string | undefined;
              let foundObj:
                | {
                    path: string;
                    index: number;
                    lineOfPath: number;
                    startOfArray?: number | undefined;
                    arrayIndex?: number | undefined;
                  }
                | undefined;
              for (let i = line; i >= 0; i--) {
                foundObj = allYamlKeys.find((obj) => {
                  const lastDotIndex = obj.path.lastIndexOf(".");
                  const pathAfterLastDot = obj.path.substring(lastDotIndex + 1);
                  return obj.lineOfPath === i && pathAfterLastDot === title;
                });
                if (foundObj) {
                  console.log("foundObj: ", foundObj, foundObj?.arrayIndex);

                  break;
                }
              }
              if (foundObj && foundObj.arrayIndex && foundObj.path) {
                arrayIndex = foundObj.arrayIndex;
                objPath = foundObj.path;
                const partsInObjPath = objPath.split(".").slice(0, -1);
                refinedObjPath = partsInObjPath.join(".");
                console.log("aaarrayIndex: ", arrayIndex);
              }
              let relevantRefs = [""];

              if (arrayIndex !== -1 && refinedObjPath) {
                relevantRefs = specifiedDefs
                  .filter(
                    (obj) =>
                      obj.finalPath.includes(`[${arrayIndex}]`) &&
                      obj.finalPath.split(".").slice(0, -2).join(".") === refinedObjPath
                  )
                  .map((obj) => obj.ref);

                relevantRefs.forEach((ref) => {
                  if (obj.groupname === ref) {
                    console.log("objiii", obj.addRef);
                    addRefOfObjInArray = obj.addRef;
                  }
                });
              }

              for (const key2 in definitionsMap) {
                if (definitionsMap.hasOwnProperty(key2)) {
                  const obj2 = definitionsMap[key2];

                  let finalValue: string = "";
                  if (
                    addRefOfObjInArray !== "" &&
                    addRefOfObjInArray !== undefined &&
                    obj2.groupname === addRefOfObjInArray &&
                    obj2.title
                  ) {
                    console.log("addRefOfObjInArray: ", addRefOfObjInArray);

                    finalValue = obj2.title;
                  } else if (arrayIndex === -1 && obj2 && obj2.title && obj2.groupname === value) {
                    console.log("ohoh");
                    finalValue = obj2.title;
                  }
                  console.log("finalValue: ", finalValue);
                  if (
                    finalValue !== "" &&
                    obj2.deprecated !== true &&
                    allYamlKeys &&
                    !allYamlKeys.some((key) =>
                      new RegExp(`${title}\\.\\b\\w+\\b\\.${finalValue}`).test(key.path)
                    )
                  ) {
                    const completion = new vscode.CompletionItem(finalValue);
                    completion.kind = vscode.CompletionItemKind.Method;
                    if (obj2.description !== "") {
                      completion.documentation = new vscode.MarkdownString(obj2.description);
                    }
                    completion.command = {
                      command: "editor.action.ldproxy: Create new entities",
                      title: "Re-trigger completions...",
                    };
                    const existing = refCompletions.find(
                      (existingComp) => existingComp.label === finalValue
                    );
                    if (existing === undefined) {
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
    startOfArray?: number;
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
    console.log("indexToUse: ", indexToUse);
    function getPathAtCursorString(
      indexToUse: number,
      column: number,
      allYamlKeys: { path: string; index: number | null; lineOfPath: number }[]
    ): string {
      console.log("lineInFucntion", line);
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
    if (DEV) {
      console.log("column", column);
      console.log("lineeee", line);
    }
    return pathAtCursorString;
  } else {
    return "";
  }
}
