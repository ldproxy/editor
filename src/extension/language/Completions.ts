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

    /* Summary if-statement: only show completions when 
    1. there are no characters in the line typed yet, it's an Array, and the Cursor is e.g. 4 places more indented than the start of the property with the ref (in the case of standardYamlIndentation = 2) 
    2. Same case if we are not in an Array. -> 2 indentations less.
    3. Certain characters of key already typed, Array, Cursor has to be 4 places more indented than the start of the property with the ref (in the case of standardYamlIndentation = 2) + the length of the characters already typed.
    4. e.g. buildingBlock but only "-" typed yet (whitespace between hyphen and "b" has to be considered).
    5. Same as Case 4 but some letters of e.g. buildingBlock already typed.
    6. Same as case 3 if we are not in an Array. -> 2 indentations less than in example above.
    */
    if (
      (textBeforeCursor.trim() === "" &&
        currentStartOfArray &&
        (column === indentationOfpathAtCursor + indentationUsedInYaml * 1 ||
          column === indentationOfpathAtCursor + indentationUsedInYaml * 2)) ||
      (textBeforeCursor.trim() === "" &&
        column === indentationOfpathAtCursor + indentationUsedInYaml) ||
      (textBeforeCursor.trim() !== "" &&
        !textBeforeCursor.trim().includes("-") &&
        currentStartOfArray &&
        (column ===
          indentationOfpathAtCursor + indentationUsedInYaml * 1 + textBeforeCursorLength ||
          column ===
            indentationOfpathAtCursor + indentationUsedInYaml * 2 + textBeforeCursorLength)) ||
      (textBeforeCursor.trim() !== "" &&
        textBeforeCursor.trim() === "-" &&
        column ===
          indentationOfpathAtCursor + indentationUsedInYaml + textBeforeCursorLength + 1) ||
      (textBeforeCursor.trim() !== "" &&
        textBeforeCursor.trim() !== "-" &&
        textBeforeCursor.trim().includes("-") &&
        column === indentationOfpathAtCursor + indentationUsedInYaml + textBeforeCursorLength) ||
      (textBeforeCursor.trim() !== "" &&
        !textBeforeCursor.trim().includes("-") &&
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
                        console.log("finalValueProv1", finalValue);
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
                        if (obj2.type && obj2.type === "object") {
                          completion.insertText = `${finalValue}: \n  `;
                        } else if (obj2.type && obj2.type === "array") {
                          completion.insertText = `${finalValue}: \n  - `;
                        } else {
                          completion.insertText = `${finalValue}: `;
                        }
                        completion.kind = vscode.CompletionItemKind.Method;
                        if (
                          enumArray.length > 0 &&
                          enumArray.some((enumItem) => {
                            return (
                              obj2.title === enumItem.key &&
                              (obj2.groupname === enumItem.groupname ||
                                (obj2.groupname === "_TOP_LEVEL_" && enumItem.groupname === ""))
                            );
                          })
                        ) {
                          completion.detail = "Enum";
                        } else if (obj2.type === "object" && obj2.ref !== "") {
                          completion.detail = "obj";
                        } else if (obj2.type === "array" && obj2.ref !== "") {
                          completion.detail = "array";
                        }

                        if (obj2.description !== "") {
                          completion.documentation = new vscode.MarkdownString(obj2.description);
                        }
                        let filterExistingCharacters = false;
                        if (textBeforeCursor.trim() !== "") {
                          if (textBeforeCursor.trim().includes("-")) {
                            const textWithoutHyphen = textBeforeCursor.trim().replace("-", "");
                            filterExistingCharacters = finalValue.startsWith(
                              textWithoutHyphen.trim()
                            );
                          } else {
                            filterExistingCharacters = finalValue.startsWith(
                              textBeforeCursor.trim()
                            );
                          }
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
                            console.log("insertText1", completion.insertText);
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

                  if (obj.type && obj.type === "object") {
                    completion.insertText = `${value}: \n  `;
                  } else if (obj.type && obj.type === "array") {
                    completion.insertText = `${value}: \n  - `;
                  } else {
                    completion.insertText = `${value}: `;
                  }

                  completion.kind = vscode.CompletionItemKind.Method;

                  if (
                    enumArray.length > 0 &&
                    enumArray.some((enumItem) => {
                      return (
                        obj.title === enumItem.key &&
                        (obj.groupname === enumItem.groupname ||
                          (obj.groupname === "_TOP_LEVEL_" && enumItem.groupname === ""))
                      );
                    })
                  ) {
                    completion.detail = "Enum";
                  } else if (obj.type === "object" && obj.ref !== "") {
                    completion.detail = "obj";
                  } else if (obj.type === "array" && obj.ref !== "") {
                    completion.detail = "array";
                  }

                  if (obj.description !== "") {
                    completion.documentation = new vscode.MarkdownString(obj.description);
                  }
                  if (filterExistingCharacters) {
                    if (DEV) {
                      console.log("completion21", value);
                      console.log("insertText21", completion.insertText);
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
        // For explanation of if-statement see Provider1
        if (
          (pathAtCursor &&
            pathAtCursor.trim() !== "" &&
            textBeforeCursor.trim() === "" &&
            (column === indentationOfpathAtCursor + indentationUsedInYaml * 1 ||
              column === indentationOfpathAtCursor + indentationUsedInYaml * 2)) ||
          (pathAtCursor &&
            pathAtCursor.trim() !== "" &&
            textBeforeCursor.trim() !== "" &&
            !textBeforeCursor.trim().includes("-") &&
            (column ===
              indentationOfpathAtCursor + indentationUsedInYaml * 1 + textBeforeCursorLength ||
              column ===
                indentationOfpathAtCursor + indentationUsedInYaml * 2 + textBeforeCursorLength)) ||
          (textBeforeCursor.trim() !== "" &&
            textBeforeCursor.trim() === "-" &&
            column ===
              indentationOfpathAtCursor + indentationUsedInYaml + textBeforeCursorLength + 1) ||
          (textBeforeCursor.trim() !== "" &&
            textBeforeCursor.trim() !== "-" &&
            textBeforeCursor.trim().includes("-") &&
            column === indentationOfpathAtCursor + indentationUsedInYaml + textBeforeCursorLength)
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
                  if (obj.type && obj.type === "object") {
                    completion.insertText = `${value}: \n  `;
                  } else if (obj.type && obj.type === "array") {
                    completion.insertText = `${value}: \n  - `;
                  } else {
                    completion.insertText = `${value}: `;
                  }

                  if (
                    enumArray.length > 0 &&
                    enumArray.some((enumItem) => {
                      return (
                        obj.title === enumItem.key &&
                        (obj.groupname === enumItem.groupname ||
                          (obj.groupname === "_TOP_LEVEL_" && enumItem.groupname === ""))
                      );
                    })
                  ) {
                    completion.detail = "Enum";
                  } else if (obj.type === "object" && obj.ref !== "") {
                    completion.detail = "obj";
                  } else if (obj.type === "array" && obj.ref !== "") {
                    completion.detail = "array";
                  }

                  completion.kind = vscode.CompletionItemKind.Method;
                  if (obj.description !== "") {
                    completion.documentation = new vscode.MarkdownString(obj.description);
                  }
                  const existing = completions.find((existingComp) => existingComp.label === value);
                  let filterExistingCharacters;
                  if (textBeforeCursor.trim() !== "") {
                    if (textBeforeCursor.trim().includes("-")) {
                      const textWithoutHyphen = textBeforeCursor.trim().replace("-", "");
                      filterExistingCharacters = value.startsWith(textWithoutHyphen.trim());
                    } else {
                      filterExistingCharacters = value.startsWith(textBeforeCursor.trim());
                    }
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
                      console.log("insertText22", completion.insertText);
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
                  (column === indentationOfpathAtCursor + indentationUsedInYaml * 1 ||
                    column === indentationOfpathAtCursor + indentationUsedInYaml * 2)) ||
                (textBeforeCursor.trim() === "" &&
                  column === indentationOfpathAtCursor + indentationUsedInYaml) ||
                (textBeforeCursor.trim() !== "" &&
                  !textBeforeCursor.trim().includes("-") &&
                  arrayIndex !== -1 &&
                  (column ===
                    indentationOfpathAtCursor +
                      indentationUsedInYaml * 1 +
                      textBeforeCursorLength ||
                    column ===
                      indentationOfpathAtCursor +
                        indentationUsedInYaml * 2 +
                        textBeforeCursorLength)) ||
                (textBeforeCursor.trim() !== "" &&
                  textBeforeCursor.trim() === "-" &&
                  column ===
                    indentationOfpathAtCursor +
                      indentationUsedInYaml +
                      textBeforeCursorLength +
                      1) ||
                (textBeforeCursor.trim() !== "" &&
                  textBeforeCursor.trim() !== "-" &&
                  textBeforeCursor.trim().includes("-") &&
                  column ===
                    indentationOfpathAtCursor + indentationUsedInYaml + textBeforeCursorLength) ||
                (textBeforeCursor.trim() !== "" &&
                  !textBeforeCursor.trim().includes("-") &&
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

                      if (obj2.type && obj2.type === "object") {
                        completion.insertText = `${finalValue}: \n  `;
                      } else if (obj2.type && obj2.type === "array") {
                        completion.insertText = `${finalValue}: \n  - `;
                      } else {
                        completion.insertText = `${finalValue}: `;
                      }
                      completion.kind = vscode.CompletionItemKind.Method;
                      if (
                        enumArray.length > 0 &&
                        enumArray.some((enumItem) => {
                          return (
                            obj2.title === enumItem.key &&
                            (obj2.groupname === enumItem.groupname ||
                              (obj2.groupname === "_TOP_LEVEL_" && enumItem.groupname === ""))
                          );
                        })
                      ) {
                        completion.detail = "Enum";
                      } else if (obj2.type === "object" && obj2.ref !== "") {
                        completion.detail = "obj";
                      } else if (obj2.type === "array" && obj2.ref !== "") {
                        completion.detail = "array";
                      }

                      if (obj2.description !== "") {
                        completion.documentation = new vscode.MarkdownString(obj2.description);
                      }
                      let filterExistingCharacters;
                      if (textBeforeCursor.trim() !== "") {
                        if (textBeforeCursor.trim().includes("-")) {
                          const textWithoutHyphen = textBeforeCursor.trim().replace("-", "");
                          filterExistingCharacters = finalValue.startsWith(
                            textWithoutHyphen.trim()
                          );
                        } else {
                          filterExistingCharacters = finalValue.startsWith(textBeforeCursor.trim());
                        }
                      } else {
                        filterExistingCharacters = true;
                      }

                      const existing = refCompletions.find(
                        (existingComp) => existingComp.label === finalValue
                      );
                      if (filterExistingCharacters && existing === undefined) {
                        if (DEV) {
                          console.log("completion3", value);
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
