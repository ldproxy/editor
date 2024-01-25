import * as vscode from "vscode";
import { extractDocRefs } from "../utilities/refs";
import { extractIndexFromPath } from "../utilities/yaml";
import { getMaxLine, AllYamlKeys } from "../utilities/yaml";
import { getLinesForArrayIndex } from "../utilities/yaml";
import { getDefinitionsMap, DefinitionsMap } from "../utilities/defs";
import { removeDuplicates } from "../utilities/refs";
import { DEV } from "../utilities/constants";
import { getSchema } from "../utilities/schemas";

let allYamlKeys: AllYamlKeys;

let definitionsMap: DefinitionsMap = {};
let specifiedDefs: { ref: string; finalPath: string }[];

export async function getSchemaMapCompletions(docUri: string, docHash?: string) {
  const schema = await getSchema();
  const currentDocument = vscode.window.activeTextEditor?.document;
  const documentGetText = currentDocument?.getText();
  if (documentGetText) {
    if (documentGetText && schema) {
      specifiedDefs = extractDocRefs(documentGetText, schema, docUri, docHash);
      const uniqueDefs = removeDuplicates(specifiedDefs);
      definitionsMap = getDefinitionsMap(schema, uniqueDefs, docUri, docHash);
    }
  }
}

export function setKeys(yamlkeys: AllYamlKeys) {
  allYamlKeys = yamlkeys;
}

export const registerCompletions = (): vscode.Disposable[] => {
  return [
    vscode.languages.registerCompletionItemProvider("yaml", provider1),
    vscode.languages.registerCompletionItemProvider("yaml", provider2),
    vscode.languages.registerCompletionItemProvider("yaml", provider3),
  ];
};

// References from specifiedDefs
const provider1: vscode.CompletionItemProvider<vscode.CompletionItem> = {
  provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
    const line = position.line + 1;
    const column = position.character;
    const pathAtCursor = getPathAtCursor(allYamlKeys, line, column);
    const currentStartOfArray = allYamlKeys.find(
      (item) => item.lineOfPath === line - 1
    )?.startOfArray;
    if (DEV) {
      console.log("pathAtCursor: " + pathAtCursor);
      console.log("definitionsMapCompletions", definitionsMap);
      console.log("currentArrayIndex: " + currentStartOfArray);
    }

    if (Object.keys(definitionsMap).length > 0) {
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
                    if (DEV) {
                      console.log("allYamlKeys: ", allYamlKeys);
                    }
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
                      if (DEV) {
                        console.log("refCompletionsinCompletions", refCompletions);
                      }
                      const completion = new vscode.CompletionItem(finalValue);
                      //  completion.insertText = `${finalValue}: \n  `; (Soll angewendet werden, wenn finalValue ein ref oder addRef hat)
                      completion.insertText = `${finalValue}: `;
                      completion.kind = vscode.CompletionItemKind.Method;
                      if (obj2.description !== "") {
                        completion.documentation = new vscode.MarkdownString(obj2.description);
                      }
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
  resolveCompletionItem(
    item: vscode.CompletionItem,
    token: vscode.CancellationToken
  ): Thenable<vscode.CompletionItem> {
    return new Promise((resolve) => {
      if (item.kind === vscode.CompletionItemKind.Method) {
        // Trigger the suggest widget after a delay to ensure the previous session has ended
        setTimeout(() => {
          vscode.commands.executeCommand("editor.action.triggerSuggest");
        }, 2000); // Mit 1000 klappt es nicht. Alles zwischen 1000 und 2000 könnte man also mal ausprobieren, um den möglichst niedrigsten Wert zu ermitteln.
        console.log("resolve wurde aufgerufen");
      }
      resolve(item);
    });
  },
};

//Completions for non-indented keys and arrays
const provider2: vscode.CompletionItemProvider<vscode.CompletionItem> = {
  provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
    const line = position.line + 1;
    const column = position.character;
    const pathAtCursor = getPathAtCursor(allYamlKeys, line, column);
    const completions: vscode.CompletionItem[] = [];
    const uniqueDefs = removeDuplicates(specifiedDefs);
    if (DEV) {
      console.log("allYamlKeysInProvider2: ", allYamlKeys);
      console.log("pathAtCursorInProvider2: " + pathAtCursor);
      console.log("uniqueDefsInProvider2", uniqueDefs);
    }

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
                completion.insertText = `${value}: `;
                completion.kind = vscode.CompletionItemKind.Method;
                if (obj.description !== "") {
                  completion.documentation = new vscode.MarkdownString(obj.description);
                }
                completions.push(completion);
              }
            }
          }
        }
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
              if (DEV) {
                console.log("refProvider2", ref);
              }
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
                completion.insertText = `${value}: `;
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
      }
    });
    return completions;
  },
  resolveCompletionItem(
    item: vscode.CompletionItem,
    token: vscode.CancellationToken
  ): Thenable<vscode.CompletionItem> {
    return new Promise((resolve) => {
      // Trigger the suggest widget after a delay to ensure the previous session has ended
      if (item.kind === vscode.CompletionItemKind.Method) {
        setTimeout(() => {
          vscode.commands.executeCommand("editor.action.triggerSuggest");
        }, 2000); // Mit 1000 klappt es nicht. Alles zwischen 1000 und 2000 könnte man also mal ausprobieren, um den möglichst niedrigsten Wert zu ermitteln.
        console.log("resolve wurde aufgerufen");
      }
      resolve(item);
    });
  },
};

// additionalReferences from specifiedDefs
const provider3: vscode.CompletionItemProvider<vscode.CompletionItem> = {
  provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
    const line = position.line + 1;
    const column = position.character;
    const uniqueDefs = removeDuplicates(specifiedDefs);
    const pathAtCursor = getPathAtCursor(allYamlKeys, line, column);
    if (DEV) {
      console.log("allYamlKeysProvider3: ", allYamlKeys);
      console.log("pathAtCursorProvider3: " + pathAtCursor);
    }

    if (Object.keys(definitionsMap).length > 0) {
      const refCompletions: vscode.CompletionItem[] = [];
      for (const key in definitionsMap) {
        if (definitionsMap.hasOwnProperty(key)) {
          const obj = definitionsMap[key];
          if (obj.addRef && obj["addRef"] !== "") {
            if (DEV) {
              console.log("objProvider3", obj);
            }
            const title = obj.title; // e.g. "collections"
            const value = obj.addRef; // e.g. "FeatureTypeConfigurationOgcApi"
            if (
              title !== undefined &&
              value !== undefined &&
              new RegExp(`${title}\\.\\w*$`).test(pathAtCursor) // Is cursor at a point where there is a key with an addRef 2 lines before?
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
                }); // foundObject is the object in allYamlKeys which has the addRef
                if (foundObj) {
                  if (DEV) {
                    console.log("foundObjPrv3: ", foundObj, foundObj?.arrayIndex);
                  }
                  break;
                }
              }
              // From here till line 325 only for case addRef in ARRAY
              // Why is that necessary (potentially hypothetical example): the key "transformations" in buildingBlock: GLTF has another addRef as the property "transfomations" in "CollectionsConfiguration" (buildingBlock: COLLECTIONS). Hence it is important to know, in which ref the key "transformations" is in.
              if (foundObj && foundObj.arrayIndex && foundObj.path) {
                arrayIndex = foundObj.arrayIndex;
                objPath = foundObj.path;
                const partsInObjPath = objPath.split(".").slice(0, -1);
                refinedObjPath = partsInObjPath.join(".");
                if (DEV) {
                  console.log("uniqueDefsProv3", uniqueDefs);
                  console.log("arayIndexProvider3: ", arrayIndex, foundObj.path, refinedObjPath);
                }
              }
              let relevantRefs = [""];

              if (arrayIndex !== -1 && refinedObjPath) {
                relevantRefs = uniqueDefs
                  .filter(
                    (obj) =>
                      obj.finalPath.includes(`[${arrayIndex}]`) &&
                      obj.finalPath.split(".").slice(0, -2).join(".") === refinedObjPath
                  )
                  .map((obj) => obj.ref); // Here the possible groupnames of the addRef are being extracted (e.g "CollectionsConfiguration" or "CommonConfiguration")

                relevantRefs.forEach((ref) => {
                  if (obj.groupname === ref) {
                    // if object with the addRef has the same groupname as the ref of the path in specifiedDefs. The ref in specifiedDefs is the one our property with the addRef(e.g. "transformations" or "collections") is in. We found this ref by finding the array we are in by using the path of foundObject (the property with the addRef) and its arrayIndex.
                    if (DEV) {
                      console.log("obj.addRefProvider3", obj.addRef);
                    }
                    addRefOfObjInArray = obj.addRef; // then addRefOfObjInArray is = the addRef we found in the beginning and saved in value
                  }
                });
              }
              // here we push all keys as completions, which have the same groupname as the addRef in question
              for (const key2 in definitionsMap) {
                if (definitionsMap.hasOwnProperty(key2)) {
                  const obj2 = definitionsMap[key2];

                  let finalValue: string = "";
                  // case Array
                  if (
                    addRefOfObjInArray !== "" &&
                    addRefOfObjInArray !== undefined &&
                    obj2.groupname === addRefOfObjInArray &&
                    obj2.title
                  ) {
                    if (DEV) {
                      console.log("addRefOfObjInArray: ", addRefOfObjInArray);
                    }
                    finalValue = obj2.title;
                  } else if (arrayIndex === -1 && obj2 && obj2.title && obj2.groupname === value) {
                    finalValue = obj2.title;
                  }
                  if (DEV) {
                    console.log("finalValue: ", finalValue);
                  }
                  if (
                    finalValue !== "" &&
                    obj2.deprecated !== true &&
                    allYamlKeys &&
                    !allYamlKeys.some((key) =>
                      new RegExp(`${title}\\.\\b\\w+\\b\\.${finalValue}`).test(key.path)
                    )
                  ) {
                    const completion = new vscode.CompletionItem(finalValue);
                    completion.insertText = `${finalValue}: `;
                    completion.kind = vscode.CompletionItemKind.Method;
                    if (obj2.description !== "") {
                      completion.documentation = new vscode.MarkdownString(obj2.description);
                    }
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
  resolveCompletionItem(
    item: vscode.CompletionItem,
    token: vscode.CancellationToken
  ): Thenable<vscode.CompletionItem> {
    return new Promise((resolve) => {
      if (item.kind === vscode.CompletionItemKind.Method) {
        // Trigger the suggest widget after a delay to ensure the previous session has ended
        setTimeout(() => {
          vscode.commands.executeCommand("editor.action.triggerSuggest");
        }, 2000); // Mit 1000 klappt es nicht. Alles zwischen 1000 und 2000 könnte man also mal ausprobieren, um den möglichst niedrigsten Wert zu ermitteln.
        console.log("resolve wurde aufgerufen");
      }
      resolve(item);
    });
  },
};

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
    if (DEV) {
      console.log("indexToUse: ", indexToUse);
    }
    function getPathAtCursorString(
      indexToUse: number,
      column: number,
      allYamlKeys: { path: string; index: number | null; lineOfPath: number }[]
    ): string {
      if (DEV) {
        console.log("lineInFunction", line);
      }
      let foundObj = allYamlKeys.find((obj) => obj.lineOfPath === line);
      while (!foundObj && line > 0) {
        line--;

        foundObj = allYamlKeys.find((obj) => obj.lineOfPath === line);
      }
      if (DEV) {
        console.log("foundObj", foundObj);
      }
      if (foundObj) {
        indexToUse = allYamlKeys.indexOf(foundObj);
        if (DEV) {
          console.log("indexToUseGetPath", indexToUse);
        }
      }

      for (let i = indexToUse; i >= 0; i--) {
        const obj = allYamlKeys[i];
        if (DEV) {
          console.log("neu", obj, "indexToUse", indexToUse, "column", column);
        }
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
