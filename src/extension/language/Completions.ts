import * as vscode from "vscode";
import { extractDocRefs } from "../utilities/refs";
import {
  extractIndexFromPath,
  getIndentation,
  getMaxLine,
  AllYamlKeys,
  getLinesForArrayIndex,
  indentationOfYamlObjectAboveCursor,
} from "../utilities/yaml";
import { getDefinitionsMap, DefinitionsMap } from "../utilities/defs";
import { removeDuplicates } from "../utilities/refs";
import { DEV } from "../utilities/constants";
import { getSchema } from "../utilities/schemas";
import { DocUpdate, Registration } from "../utilities/registration";

let allYamlKeys: AllYamlKeys;
let definitionsMap: DefinitionsMap = {};
let specifiedDefs: { ref: string; finalPath: string }[];

export const updateCompletions: DocUpdate = async function (
  event,
  document,
  docUri,
  docHash,
  newAllYamlKeys
) {
  allYamlKeys = newAllYamlKeys;
  const schema = await getSchema();
  const text = document.getText();
  if (text) {
    if (text && schema) {
      specifiedDefs = extractDocRefs(text, schema, docUri, docHash);
      const uniqueDefs = removeDuplicates(specifiedDefs);
      definitionsMap = getDefinitionsMap(schema, uniqueDefs, docUri, docHash);
    }
  }
};

export const registerCompletions: Registration = () => {
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

    // When a few letters of the key are already typed when hitting auto completion
    const textBeforeCursor: string = document
      .lineAt(position.line)
      .text.substring(0, position.character);
    const lineText: string = document.lineAt(position.line).text;
    const indentation: number = lineText.search(/\S|$/);
    const textBeforeCursorLength: number = textBeforeCursor.trim().length;

    const text = document.getText();
    const lines = text.split("\n");
    const currentLine = lines[line - 1];
    const pathAtCursor = currentLine.includes(":")
      ? undefined
      : textBeforeCursor.trim() !== ""
      ? getPathAtCursor(allYamlKeys, line - 1, indentation)
      : getPathAtCursor(allYamlKeys, line, column);

    // Only show Completions when the Cursor has exactly the correct indentation
    const indentationUsedInYaml = getIndentation(document.getText());
    const indentationOfpathAtCursor = indentationOfYamlObjectAboveCursor(
      allYamlKeys,
      line,
      pathAtCursor
    );
    if (DEV) {
      console.log("indentationUsedInYaml", indentationUsedInYaml, indentationOfpathAtCursor);
    }

    const currentStartOfArray = allYamlKeys.find(
      (item) => item.lineOfPath === line - 1
    )?.startOfArray;
    if (DEV) {
      console.log("textBeforeCursor1", textBeforeCursor, indentation);
      console.log("pathAtCursor: " + pathAtCursor);
      console.log("definitionsMapCompletions", definitionsMap);
      console.log("currentArrayIndex: " + currentStartOfArray);
    }

    /* Summary if-statement: only show completions when 
    1. there are no characters in the line typed yet, it's an Array, and the Cursor is e.g. 4 places more indented than the start of the property with the ref (in the case of standardYamlIndentation = 2) 
    2. Same case if we are not in an Array. -> 2 indentations less.
    3. Certain characters of key already typed, Array, Cursor has to be 4 places more indented than the start of the property with the ref (in the case of standardYamlIndentation = 2) + the length of the characters already typed.
    4. Same case if we are not in an Array. -> 2 indentations less than in example above.
    */
    if (
      (textBeforeCursor.trim() === "" &&
        currentStartOfArray &&
        column === indentationOfpathAtCursor + indentationUsedInYaml * 2) ||
      (textBeforeCursor.trim() === "" &&
        column === indentationOfpathAtCursor + indentationUsedInYaml) ||
      (textBeforeCursor.trim() !== "" &&
        currentStartOfArray &&
        column ===
          indentationOfpathAtCursor + indentationUsedInYaml * 2 + textBeforeCursorLength) ||
      (textBeforeCursor.trim() !== "" &&
        column === indentationOfpathAtCursor + indentationUsedInYaml + textBeforeCursorLength)
    ) {
      if (Object.keys(definitionsMap).length > 0) {
        const refCompletions: vscode.CompletionItem[] = [];
        for (const key in definitionsMap) {
          if (definitionsMap.hasOwnProperty(key)) {
            const obj = definitionsMap[key];
            if (obj["ref"] !== "") {
              const title = obj.title;
              const value = obj.ref;
              if (
                title !== undefined &&
                value !== undefined &&
                pathAtCursor !== undefined &&
                pathAtCursor.endsWith(title)
              ) {
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
                            return key.path === `${pathAtCursor}.${finalValue}`;
                          }
                        })
                      ) {
                        if (DEV) {
                          console.log("refCompletionsinCompletions", refCompletions);
                        }
                        const completion = new vscode.CompletionItem(finalValue);
                        completion.insertText = `${finalValue}: `;
                        completion.kind = vscode.CompletionItemKind.Method;
                        if (obj2.description !== "") {
                          completion.documentation = new vscode.MarkdownString(obj2.description);
                        }
                        let filterExistingCharacters = false;
                        if (textBeforeCursor.trim() !== "") {
                          filterExistingCharacters = finalValue.startsWith(textBeforeCursor.trim());
                          if (DEV) {
                            console.log("fEC", filterExistingCharacters);
                          }
                        } else {
                          filterExistingCharacters = true;
                        }
                        const existing = refCompletions.find(
                          (existingComp) => existingComp.label === finalValue
                        );
                        if (filterExistingCharacters && existing === undefined) {
                          if (DEV) {
                            console.log("completion1", finalValue);
                          }
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
    }
  },
};

//Completions for non-indented keys and arrays
const provider2: vscode.CompletionItemProvider<vscode.CompletionItem> = {
  provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
    const line = position.line + 1;
    const column = position.character;

    // When a few letters of the key are already typed when hitting auto completion
    const textBeforeCursor: string = document
      .lineAt(position.line)
      .text.substring(0, position.character);
    const lineText: string = document.lineAt(position.line).text;
    const indentation: number = lineText.search(/\S|$/);

    const text = document.getText();
    const lines = text.split("\n");
    const currentLine = lines[line - 1];
    const pathAtCursor = currentLine.includes(":")
      ? undefined
      : textBeforeCursor.trim() !== ""
      ? getPathAtCursor(allYamlKeys, line - 1, indentation)
      : getPathAtCursor(allYamlKeys, line, column);

    const completions: vscode.CompletionItem[] = [];
    const uniqueDefs = removeDuplicates(specifiedDefs);
    if (DEV) {
      console.log("allYamlKeysInProvider2: ", allYamlKeys);
      console.log("pathAtCursorInProvider2: " + pathAtCursor);
      console.log("uniqueDefsInProvider2", uniqueDefs);
      console.log("textBeforeCursor2", textBeforeCursor, indentation);
    }

    uniqueDefs.forEach((defObj) => {
      const ref = defObj.ref;
      const path = defObj.finalPath;
      const pathSplit = path.split(".");
      const specifiedDefsPath = pathSplit.slice(0, -1).join(".");
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
        pathAtCursor !== undefined &&
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
                let filterExistingCharacters;
                if (textBeforeCursor.trim() !== "") {
                  filterExistingCharacters = value.startsWith(textBeforeCursor.trim());
                } else {
                  filterExistingCharacters = true;
                }
                if (DEV) {
                  console.log("existingCharacters", filterExistingCharacters);
                  console.log("valueInProvider", value);
                  console.log("testEC", value.startsWith(textBeforeCursor));
                }
                completion.insertText = `${value}: `;
                completion.kind = vscode.CompletionItemKind.Method;
                if (obj.description !== "") {
                  completion.documentation = new vscode.MarkdownString(obj.description);
                }
                if (filterExistingCharacters) {
                  if (DEV) {
                    console.log("completion21", value);
                  }
                  completions.push(completion);
                }
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
        (indentation === columnOfArray || column === columnOfArray)
      ) {
        if (DEV) {
          console.log("columnOfArray", columnOfArray);
          console.log("speziu", specifiedDefsPath, pathAtCursor);
          console.log("MyMinLine", minLine);
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
                  const fullPath = pathAtCursor ? `${pathAtCursor}.${value}` : value;
                  return key.path === fullPath && key.startOfArray === minLine;
                })
              ) {
                const completion = new vscode.CompletionItem(value);
                completion.insertText = `${value}: `;
                completion.kind = vscode.CompletionItemKind.Method;
                if (obj.description !== "") {
                  completion.documentation = new vscode.MarkdownString(obj.description);
                }
                const existing = completions.find((existingComp) => existingComp.label === value);
                let filterExistingCharacters;
                if (textBeforeCursor.trim() !== "") {
                  filterExistingCharacters = value.startsWith(textBeforeCursor.trim());
                } else {
                  filterExistingCharacters = true;
                }
                if (DEV) {
                  console.log("existingCharacters", filterExistingCharacters);
                  console.log("valueInProvider", value);
                  console.log("testEC", value.startsWith(textBeforeCursor));
                }
                if (filterExistingCharacters && existing === undefined) {
                  if (DEV) {
                    console.log("completion22", value);
                  }
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
};

// additionalReferences from specifiedDefs
const provider3: vscode.CompletionItemProvider<vscode.CompletionItem> = {
  provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
    const line = position.line + 1;
    const column = position.character;
    const uniqueDefs = removeDuplicates(specifiedDefs);

    // When a few letters of the key are already typed when hitting auto completion
    const textBeforeCursor: string = document
      .lineAt(position.line)
      .text.substring(0, position.character);
    const lineText: string = document.lineAt(position.line).text;
    const indentation: number = lineText.search(/\S|$/);
    const textBeforeCursorLength: number = textBeforeCursor.trim().length;

    const text = document.getText();
    const lines = text.split("\n");
    const currentLine = lines[line - 1];
    const pathAtCursor = currentLine.includes(":")
      ? undefined
      : textBeforeCursor.trim() !== ""
      ? getPathAtCursor(allYamlKeys, line - 1, indentation)
      : getPathAtCursor(allYamlKeys, line, column);

    // Only show Completions when the Cursor has exactly the correct indentation
    const indentationUsedInYaml = getIndentation(document.getText());
    const indentationOfpathAtCursor = indentationOfYamlObjectAboveCursor(
      allYamlKeys,
      line,
      pathAtCursor
    );

    if (DEV) {
      console.log("pathAtCursorInProvider3: " + pathAtCursor);
      console.log("textBeforeCursor3", textBeforeCursor, indentation);
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
              pathAtCursor !== undefined &&
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
              // Next 33 lines only for case addRef in ARRAY
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
              // For explanation of if statement see Provider1
              if (
                (textBeforeCursor.trim() === "" &&
                  arrayIndex !== -1 &&
                  column === indentationOfpathAtCursor + indentationUsedInYaml * 2) ||
                (textBeforeCursor.trim() === "" &&
                  column === indentationOfpathAtCursor + indentationUsedInYaml) ||
                (textBeforeCursor.trim() !== "" &&
                  arrayIndex !== -1 &&
                  column ===
                    indentationOfpathAtCursor +
                      indentationUsedInYaml * 2 +
                      textBeforeCursorLength) ||
                (textBeforeCursor.trim() !== "" &&
                  column ===
                    indentationOfpathAtCursor + indentationUsedInYaml + textBeforeCursorLength)
              ) {
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
                    } else if (
                      arrayIndex === -1 &&
                      obj2 &&
                      obj2.title &&
                      obj2.groupname === value
                    ) {
                      finalValue = obj2.title;
                    }
                    if (DEV) {
                      console.log("finalValue: ", finalValue);
                    }
                    if (
                      finalValue !== "" &&
                      obj2.deprecated !== true &&
                      allYamlKeys &&
                      !allYamlKeys.some((key) => key.path === `${pathAtCursor}.${finalValue}`)
                    ) {
                      const completion = new vscode.CompletionItem(finalValue);
                      completion.insertText = `${finalValue}: `;
                      completion.kind = vscode.CompletionItemKind.Method;
                      if (obj2.description !== "") {
                        completion.documentation = new vscode.MarkdownString(obj2.description);
                      }
                      let filterExistingCharacters;
                      if (textBeforeCursor.trim() !== "") {
                        filterExistingCharacters = finalValue.startsWith(textBeforeCursor.trim());
                      } else {
                        filterExistingCharacters = true;
                      }

                      const existing = refCompletions.find(
                        (existingComp) => existingComp.label === finalValue
                      );
                      if (filterExistingCharacters && existing === undefined) {
                        if (DEV) {
                          console.log("completion3", value);
                        }
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

// Wenn textBeforeCursor existiert, muss in getPathAtCursor nicht von der Einrückung des Cursors, sondern
// ersten Buchstaben des Wortes ausgegangen werden. AUßerdem muss line - 1 gerechnet werden.
// Also einfach andere parameter reingeben.
