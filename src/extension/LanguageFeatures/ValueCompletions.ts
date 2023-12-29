import { services } from "../utilitiesLanguageFeatures/services";
import { hoverData } from "../utilitiesLanguageFeatures/providers";
import * as vscode from "vscode";
import { buildEnumArray } from "../utilitiesLanguageFeatures/getEnums";
import {
  getCurrentFilePath,
  servicesOrProviders,
} from "../utilitiesLanguageFeatures/servicesOrProviders";
import { getDefinitionsMap } from "../utilitiesLanguageFeatures/getDefinitionsMap";
import { removeDuplicates } from "../utilitiesLanguageFeatures/removeDuplicatesInArray";
import { defineDefs } from "../utilitiesLanguageFeatures/defineDefs";

let allYamlKeys: {
  path: string;
  index: number;
  lineOfPath: number;
  startOfArray?: number;
  arrayIndex?: number;
}[];

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
let uniqueDefs: any;

export function getSchemaMapCompletions() {
  const currentDocument = vscode.window.activeTextEditor?.document;
  if (currentDocument) {
    specifiedDefs = defineDefs(currentDocument);
    uniqueDefs = removeDuplicates(specifiedDefs);
    if (uniqueDefs && uniqueDefs.length > 0) {
      definitionsMap = getDefinitionsMap(uniqueDefs);
    }
  }
}

export const provider4 = vscode.languages.registerCompletionItemProvider("yaml", {
  provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
    let currentFilePath = getCurrentFilePath();
    let serviceOrProvider: string | undefined;
    if (currentFilePath) {
      serviceOrProvider = servicesOrProviders(currentFilePath);
    }

    let enumArray: { key: string; enum: string; groupname: string }[] = [];
    if (serviceOrProvider && serviceOrProvider === "services") {
      enumArray = buildEnumArray(services);
    } else if (serviceOrProvider && serviceOrProvider === "providers") {
      enumArray = buildEnumArray(hoverData);
    }

    console.log("enumArray", enumArray);
    const valueCompletions: vscode.CompletionItem[] = [];
    const line = position.line;
    const keyAtCursor = findKeyForValueCompletion(line, document, position);
    const yamlKeysObject = allYamlKeys.find((obj) => obj.lineOfPath === line + 1);
    let pathAtCursor = "";
    if (yamlKeysObject) {
      pathAtCursor = yamlKeysObject.path;
    }
    let pathAtCursorTwoLastParts = "";
    let pathAtCursorThreeLastParts = "";
    if (pathAtCursor && pathAtCursor.length > 0) {
      const pathAtCursorSplit = pathAtCursor.split(".");
      pathAtCursorTwoLastParts = pathAtCursorSplit.slice(-2).join(".");
      pathAtCursorThreeLastParts = pathAtCursorSplit.slice(-3).join(".");
    }

    console.log("keyAtCursor", keyAtCursor);
    console.log("pathAtCursorssssss", pathAtCursor);
    console.log("yamlKeysObject", yamlKeysObject);
    console.log("pathAtCursorTwoLastParts", pathAtCursorTwoLastParts);
    console.log("pathAtCursorThreeLastParts", pathAtCursorThreeLastParts);
    console.log("ttttt", definitionsMap);
    console.log("aaaaaa", allYamlKeys);
    console.log("uuuu", uniqueDefs);

    if (enumArray) {
      enumArray.forEach((enumObj) => {
        if (enumObj.hasOwnProperty("key")) {
          const key = enumObj.key;
          const myEnum = enumObj.enum;
          const enumGroupname = enumObj.groupname;
          if (
            key !== undefined &&
            myEnum !== undefined &&
            keyAtCursor !== "" &&
            keyAtCursor === key
          ) {
            if (definitionsMap) {
              for (const key in definitionsMap) {
                if (definitionsMap.hasOwnProperty(key)) {
                  const obj = definitionsMap[key];
                  // case addRef
                  if (obj["addRef"] !== "") {
                    const title = obj.title;
                    const value = obj.addRef;
                    if (
                      title !== undefined &&
                      value !== undefined &&
                      enumGroupname === value &&
                      new RegExp(`${title}\\.\\b\\w+\\b\\.${keyAtCursor}`).test(
                        pathAtCursorThreeLastParts
                      )
                    ) {
                      console.log("valueCompletionsKey", myEnum);
                      const completion = new vscode.CompletionItem(myEnum);
                      completion.kind = vscode.CompletionItemKind.Method;
                      completion.command = {
                        command: "editor.action.ldproxy: Create new entities",
                        title: "Re-trigger completions...",
                      };
                      const existing = valueCompletions.find(
                        (existingComp) => existingComp.label === myEnum
                      );
                      if (existing === undefined) {
                        valueCompletions.push(completion);
                      }
                    }
                  }
                  // case ref
                  else if (obj["ref"] !== "") {
                    const title = obj.title;
                    const value = obj.ref;
                    console.log("ttitle", title);
                    console.log("enumGroupname", enumGroupname);
                    if (
                      title !== undefined &&
                      value !== undefined &&
                      enumGroupname === value &&
                      pathAtCursorTwoLastParts === `${title}.${keyAtCursor}`
                    ) {
                      console.log("valueCompletionsKey", myEnum);
                      const completion = new vscode.CompletionItem(myEnum);
                      completion.kind = vscode.CompletionItemKind.Method;
                      completion.command = {
                        command: "editor.action.ldproxy: Create new entities",
                        title: "Re-trigger completions...",
                      };
                      const existing = valueCompletions.find(
                        (existingComp) => existingComp.label === myEnum
                      );
                      if (existing === undefined) {
                        valueCompletions.push(completion);
                      }
                    }
                    // case non indented
                  } else {
                    uniqueDefs.forEach((def: any) => {
                      if (
                        key !== undefined &&
                        myEnum !== undefined &&
                        (def.ref === enumGroupname || enumGroupname === "") &&
                        !pathAtCursor.includes(".")
                      ) {
                        console.log("valueCompletionsKey", myEnum);
                        const completion = new vscode.CompletionItem(myEnum);
                        completion.kind = vscode.CompletionItemKind.Method;
                        completion.command = {
                          command: "editor.action.ldproxy: Create new entities",
                          title: "Re-trigger completions...",
                        };
                        const existing = valueCompletions.find(
                          (existingComp) => existingComp.label === myEnum
                        );
                        if (existing === undefined) {
                          valueCompletions.push(completion);
                        }
                      }
                    });
                  }
                }
              }
            }
          }
        }
      });
      return valueCompletions;
    }
  },
});

function findKeyForValueCompletion(line: number, document: vscode.TextDocument, position: any) {
  const textBeforeCursor = document.getText(
    new vscode.Range(new vscode.Position(line, 0), position)
  );

  let textBeforeColon = "";
  if (textBeforeCursor.includes(":")) {
    const lastIndex = textBeforeCursor.lastIndexOf(":");
    const substringBeforeColon = textBeforeCursor.substring(0, lastIndex).trim();

    const lastSpaceIndex = substringBeforeColon.lastIndexOf(" ");

    if (lastSpaceIndex !== -1) {
      textBeforeColon = substringBeforeColon.substring(lastSpaceIndex + 1);
    } else {
      textBeforeColon = substringBeforeColon; // Wenn kein Leerzeichen vorhanden ist
    }

    console.log("Text vor dem Doppelpunkt:", textBeforeColon);
  }
  return textBeforeColon;
}

/*
Pfad berücksichtigen Fälle:

Gibt es in DefMap eine prop mit ref oder addRef mit dem Groupname?
Dann genau wie in Completions vorgehen: Entweder der part des keys in allYamlKeys vor dem betreffenden key
(z.B. type) oder der davor (im Falle eines addRef) muss der key mit dem ref oder addRef sein.

Wenn nicht, darf der Pfad in allYamlKeys ja keine Punkte enthalten, sonst sollen die Completions nicht erscheinen.
Außerdem muss der Pfad in uniqueDefs vertreten sein.

*/
