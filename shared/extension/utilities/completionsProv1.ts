import * as vscode from "vscode";
import { DefinitionsMap } from "./defs";
import { shouldFilterExistingCharacters, createCompletionItem } from "./completions";

interface YamlKey {
  path: string;
  index: number;
  lineOfPath: number;
  startOfArray?: number;
  arrayIndex?: number;
}

export function shouldShowCompletionsProv1(
  textBeforeCursor: string,
  column: number,
  indentationOfpathAtCursor: number,
  indentationUsedInYaml: number,
  textBeforeCursorLength: number,
  currentStartOfArray: number | undefined
): boolean {
  return isCompletionValid(
    textBeforeCursor,
    column,
    indentationOfpathAtCursor,
    indentationUsedInYaml,
    textBeforeCursorLength,
    currentStartOfArray
  );
}

function isCompletionValid(
  textBeforeCursor: string,
  column: number,
  indentationOfpathAtCursor: number,
  indentationUsedInYaml: number,
  textBeforeCursorLength: number,
  currentStartOfArray: number | undefined
): boolean {
  /* Summary if-statement: only show completions when 
    1. there are no characters in the line typed yet, it's an Array, and the Cursor is e.g. 4 places more indented than the start of the property with the ref (in the case of standardYamlIndentation = 2) 
    2. Same case if we are not in an Array. -> 2 indentations less.
    3. Certain characters of key already typed, Array, Cursor has to be 4 places more indented than the start of the property with the ref (in the case of standardYamlIndentation = 2) + the length of the characters already typed.
    4. e.g. buildingBlock but only "-" typed yet (whitespace between hyphen and "b" has to be considered).
    5. Same as Case 4 but some letters of e.g. buildingBlock already typed.
    6. Same as case 3 if we are not in an Array. -> 2 indentations less than in example above.
    */

  return (
    (textBeforeCursor.trim() === "" &&
      currentStartOfArray &&
      (column === indentationOfpathAtCursor + indentationUsedInYaml * 1 ||
        column === indentationOfpathAtCursor + indentationUsedInYaml * 2)) ||
    (textBeforeCursor.trim() === "" &&
      column === indentationOfpathAtCursor + indentationUsedInYaml) ||
    (textBeforeCursor.trim() !== "" &&
      !textBeforeCursor.trim().includes("-") &&
      currentStartOfArray &&
      (column === indentationOfpathAtCursor + indentationUsedInYaml * 1 + textBeforeCursorLength ||
        column ===
          indentationOfpathAtCursor + indentationUsedInYaml * 2 + textBeforeCursorLength)) ||
    (textBeforeCursor.trim() !== "" &&
      textBeforeCursor.trim() === "-" &&
      column === indentationOfpathAtCursor + indentationUsedInYaml + textBeforeCursorLength + 1) ||
    (textBeforeCursor.trim() !== "" &&
      textBeforeCursor.trim() !== "-" &&
      textBeforeCursor.trim().includes("-") &&
      column === indentationOfpathAtCursor + indentationUsedInYaml + textBeforeCursorLength) ||
    (textBeforeCursor.trim() !== "" &&
      !textBeforeCursor.trim().includes("-") &&
      column === indentationOfpathAtCursor + indentationUsedInYaml + textBeforeCursorLength)
  );
}

export function getRefCompletionsProv1(
  pathAtCursor: string | undefined,
  currentStartOfArray: number | undefined,
  textBeforeCursor: string,
  definitionsMap: DefinitionsMap,
  DEV: boolean,
  allYamlKeys: YamlKey[],
  enumArray: any[]
): vscode.CompletionItem[] {
  const refCompletions: vscode.CompletionItem[] = [];
  for (const key in definitionsMap) {
    if (definitionsMap.hasOwnProperty(key)) {
      const obj = definitionsMap[key];
      if (obj.ref !== "") {
        const title = obj.title;
        const value = obj.ref;
        if (
          title !== undefined &&
          value !== undefined &&
          pathAtCursor !== undefined &&
          pathAtCursor.endsWith(title)
        ) {
          addRefCompletions(
            refCompletions,
            title,
            value,
            pathAtCursor,
            currentStartOfArray,
            textBeforeCursor,
            definitionsMap,
            DEV,
            allYamlKeys,
            enumArray
          );
        }
      }
    }
  }
  return refCompletions;
}

function addRefCompletions(
  refCompletions: vscode.CompletionItem[],
  title: string,
  value: string,
  pathAtCursor: string,
  currentStartOfArray: number | undefined,
  textBeforeCursor: string,
  definitionsMap: DefinitionsMap,
  DEV: boolean,
  allYamlKeys: YamlKey[],
  enumArray: any[]
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
          finalValue &&
          isValidCompletion(finalValue, obj2, allYamlKeys, currentStartOfArray, title, pathAtCursor)
        ) {
          const completion = createCompletionItem(finalValue, obj2, enumArray, DEV);
          const filterExistingCharacters = shouldFilterExistingCharacters(
            textBeforeCursor,
            finalValue
          );
          const existing = refCompletions.find((existingComp) => existingComp.label === finalValue);
          if (filterExistingCharacters && existing === undefined) {
            refCompletions.push(completion);
          }
        }
      }
    }
  }
}

function isValidCompletion(
  finalValue: string | undefined,
  obj2: any,
  allYamlKeys: YamlKey[],
  currentStartOfArray: number | undefined,
  title: string,
  pathAtCursor: string
): boolean {
  return (
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
  );
}
