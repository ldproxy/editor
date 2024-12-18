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
import { buildEnumArray } from "../utilities/enums";
import { DocUpdate, Registration } from "../utilities/registration";
import { shouldShowCompletionsProv1, getRefCompletionsProv1 } from "../utilities/completionsProv1";
import { getPathAtCursor } from "../utilities/completions";
import { shouldFilterExistingCharacters, createCompletionItem } from "../utilities/completions";
import { shouldShowCompletionsProv2 } from "../utilities/completionsProv2";
import {
  shouldShowCompletionsProv3,
  createCompletionItemProv3,
} from "../utilities/completionsProv3";

let enumArray: { key: string; enum: string; groupname: string }[];

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
      enumArray = buildEnumArray(schema);
      specifiedDefs = extractDocRefs(text, schema, docUri, docHash);
      const uniqueDefs = removeDuplicates(specifiedDefs);
      definitionsMap = getDefinitionsMap(schema, uniqueDefs, docUri, docHash);
      console.log("enumArray", enumArray);
      console.log("specifiedDefs", uniqueDefs);
      console.log("definitionsMap", definitionsMap);
    }
  }
};

export const registerCompletions: Registration = () => {
  return [
    vscode.languages.registerCompletionItemProvider("yaml", referencesFromSpecifiedDefs),
    vscode.languages.registerCompletionItemProvider("yaml", nonIndentedKeysAndArrays),
    vscode.languages.registerCompletionItemProvider("yaml", additionalReferencesFromSpecifiedDefs),
  ];
};

const referencesFromSpecifiedDefs: vscode.CompletionItemProvider<vscode.CompletionItem> = {
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

    let currentStartOfArray = allYamlKeys.find(
      (item) => item.lineOfPath === line - 1
    )?.startOfArray;

    // If there is a hyphen in the line, it's a new object and doesn't belong to the one above
    const myLine = document.lineAt(line - 1).text;
    console.log("myLine", myLine);
    if (myLine.trim().startsWith("-")) {
      currentStartOfArray = -1;
    }

    if (DEV) {
      console.log("textBeforeCursor1", textBeforeCursor.trim(), indentation);
      console.log("pathAtCursor: " + pathAtCursor);
      console.log("definitionsMapCompletions", definitionsMap);
      console.log("currentArrayIndex: " + currentStartOfArray);
    }

    if (
      shouldShowCompletionsProv1(
        textBeforeCursor,
        column,
        indentationOfpathAtCursor,
        indentationUsedInYaml,
        textBeforeCursorLength,
        currentStartOfArray
      )
    ) {
      return getRefCompletionsProv1(
        pathAtCursor,
        currentStartOfArray,
        textBeforeCursor,
        definitionsMap,
        DEV,
        allYamlKeys,
        enumArray
      );
    }
  },
};

const nonIndentedKeysAndArrays: vscode.CompletionItemProvider<vscode.CompletionItem> = {
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

    const completions: vscode.CompletionItem[] = [];
    const uniqueDefs = removeDuplicates(specifiedDefs);
    if (DEV) {
      console.log("allYamlKeysInProvider2: ", allYamlKeys);
      console.log("pathAtCursorProvider2: " + pathAtCursor);
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
        maxLine = getMaxLine(allYamlKeys, minLine, document);
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
        /*  Explanation if statement: completions only when position of cursor equal to:
      1. Non indented and no letters typed -> Just the standardIdentation (e.g. 2 again)
      2. Same but with letters already typed, so plus the already typed letters */
        if (
          (textBeforeCursor.trim() === "" && column === 0) ||
          (textBeforeCursor.trim() !== "" && column === textBeforeCursorLength)
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
                  const completion = createCompletionItem(value, obj, enumArray, DEV);
                  const filterExistingCharacters = shouldFilterExistingCharacters(
                    textBeforeCursor,
                    value
                  );
                  if (filterExistingCharacters) {
                    completions.push(completion);
                  }
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
        if (
          shouldShowCompletionsProv2(
            pathAtCursor,
            textBeforeCursor,
            column,
            indentationOfpathAtCursor,
            indentationUsedInYaml,
            textBeforeCursorLength
          )
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
                  const completion = createCompletionItem(value, obj, enumArray, DEV);
                  const filterExistingCharacters = shouldFilterExistingCharacters(
                    textBeforeCursor,
                    value
                  );
                  const existing = completions.find((existingComp) => existingComp.label === value);
                  if (filterExistingCharacters && existing === undefined) {
                    completions.push(completion);
                  }
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

const additionalReferencesFromSpecifiedDefs: vscode.CompletionItemProvider<vscode.CompletionItem> =
  {
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
                  shouldShowCompletionsProv3(
                    textBeforeCursor,
                    arrayIndex,
                    column,
                    indentationOfpathAtCursor,
                    indentationUsedInYaml,
                    textBeforeCursorLength
                  )
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
                        const completion = createCompletionItemProv3(
                          finalValue,
                          obj2,
                          enumArray,
                          DEV
                        );

                        const filterExistingCharacters = shouldFilterExistingCharacters(
                          textBeforeCursor,
                          finalValue
                        );

                        const existing = refCompletions.find(
                          (existingComp) => existingComp.label === finalValue
                        );
                        if (filterExistingCharacters && existing === undefined) {
                          if (DEV) {
                            console.log("completion3", finalValue);
                            console.log("insertText3", completion.insertText);
                          }
                          if (
                            completion.detail === "Enum" ||
                            completion.detail === "obj" ||
                            completion.detail === "array"
                          ) {
                            completion.command = {
                              title: "Trigger Suggest",
                              command: "editor.action.triggerSuggest",
                            };
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
