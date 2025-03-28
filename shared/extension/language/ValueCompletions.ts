import * as vscode from "vscode";
import { buildEnumArray } from "../utilities/enums";
import { getSchema } from "../utilities/schemas";
import { getDefinitionsMap } from "../utilities/defs";
import { removeDuplicates } from "../utilities/refs";
import { extractDocRefs } from "../utilities/refs";
import { DEV } from "../utilities/constants";
import { AllYamlKeys } from "../utilities/yaml";
import { DocUpdate, Registration } from "../utilities/registration";
import { TransportCreator } from "@xtracfg/core";

interface LooseDefinition {
  title?: string;
  description?: string;
  [key: string]: any;
}

interface DefinitionsMap {
  [key: string]: LooseDefinition;
}

let allYamlKeys: AllYamlKeys;
let definitionsMap: DefinitionsMap = {};
let specifiedDefs: { ref: string; finalPath: string }[];
let uniqueDefs: any;

export const updateValueCompletions: DocUpdate = async function (
  event,
  document,
  docUri,
  docHash,
  newAllYamlKeys
) {
  allYamlKeys = newAllYamlKeys;
  const schema = await getSchema();
  const text = document.getText();
  if (text && schema) {
    specifiedDefs = extractDocRefs(text, schema, docUri, docHash);
    uniqueDefs = removeDuplicates(specifiedDefs);
    if (uniqueDefs && uniqueDefs.length > 0) {
      definitionsMap = getDefinitionsMap(schema, uniqueDefs, docUri, docHash);
    }
  }
};

export const registerValueCompletions: Registration = () => {
  return [vscode.languages.registerCompletionItemProvider("yaml", provider())];
};

const provider = (): vscode.CompletionItemProvider<vscode.CompletionItem> => ({
  async provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
    const schema = await getSchema();

    if (!schema) {
      return [];
    }
    if (DEV) {
      console.log("schemaVC: ", schema);
    }
    const enumArray: { key: string; enum: string; groupname: string }[] = buildEnumArray(schema);
    if (DEV) {
      console.log("enumArrayVC", enumArray);
      console.log("valueCompletionsAllYamlKeysVC", allYamlKeys);
    }

    // When a few letters of the key are already typed when hitting auto completion
    const lineText: string = document.lineAt(position.line).text;
    const lastColonIndex: number = lineText.lastIndexOf(":");

    const textBetweenColonAndCursor: string =
      lastColonIndex !== -1
        ? lineText.substring(lastColonIndex + 1, position.character).trim()
        : "";

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
    if (DEV) {
      console.log("keyAtCursorVC", keyAtCursor);
      console.log("pathAtCursorssssssVC", pathAtCursor);
      console.log("yamlKeysObjectVC", yamlKeysObject);
      console.log("pathAtCursorTwoLastPartsVC", pathAtCursorTwoLastParts);
      console.log("pathAtCursorThreeLastPartsVC", pathAtCursorThreeLastParts);
      console.log("definitionsMapVC", definitionsMap);
      console.log("allYamlKeysVC", allYamlKeys);
      console.log("uniqeDefsVC", uniqueDefs);
    }

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
                    if (DEV) {
                      console.log("valueCompletionsKeyVC1", myEnum);
                    }
                    const completion = new vscode.CompletionItem(myEnum);
                    completion.kind = vscode.CompletionItemKind.Method;
                    completion.command = {
                      command: "editor.action.ldproxy: Create new entities",
                      title: "Re-trigger completions...",
                    };
                    const existing = valueCompletions.find(
                      (existingComp) => existingComp.label === myEnum
                    );

                    let filterExistingCharacters = false;
                    if (textBetweenColonAndCursor !== "") {
                      filterExistingCharacters = myEnum.startsWith(textBetweenColonAndCursor);
                      if (DEV) {
                        console.log("fECVC", filterExistingCharacters);
                      }
                    } else {
                      filterExistingCharacters = true;
                    }

                    if (filterExistingCharacters && existing === undefined) {
                      valueCompletions.push(completion);
                    }
                  }
                }
                // case ref
                else if (obj["ref"] !== "") {
                  const title = obj.title;
                  const value = obj.ref;
                  if (DEV) {
                    console.log("titleVCRef", title);
                    console.log("enumGroupnameVCRef", enumGroupname);
                    console.log("pathAtCursorTwoLastPartsVCRef", pathAtCursorTwoLastParts);
                    console.log("keyAtCursorVCRef", keyAtCursor);
                  }
                  if (
                    title !== undefined &&
                    value !== undefined &&
                    enumGroupname === value &&
                    pathAtCursorTwoLastParts === `${title}.${keyAtCursor}`
                  ) {
                    if (DEV) {
                      console.log("valueCompletionsKeyVC2", myEnum);
                    }
                    const completion = new vscode.CompletionItem(myEnum);
                    completion.kind = vscode.CompletionItemKind.Method;
                    completion.command = {
                      command: "editor.action.ldproxy: Create new entities",
                      title: "Re-trigger completions...",
                    };
                    const existing = valueCompletions.find(
                      (existingComp) => existingComp.label === myEnum
                    );

                    let filterExistingCharacters = false;
                    if (textBetweenColonAndCursor !== "") {
                      filterExistingCharacters = myEnum.startsWith(textBetweenColonAndCursor);
                      if (DEV) {
                        console.log("fECVC", filterExistingCharacters);
                      }
                    } else {
                      filterExistingCharacters = true;
                    }

                    if (filterExistingCharacters && existing === undefined) {
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
                      if (DEV) {
                        console.log("valueCompletionsKeyVC3", myEnum);
                      }
                      const completion = new vscode.CompletionItem(myEnum);
                      completion.kind = vscode.CompletionItemKind.Method;
                      completion.command = {
                        command: "editor.action.ldproxy: Create new entities",
                        title: "Re-trigger completions...",
                      };
                      const existing = valueCompletions.find(
                        (existingComp) => existingComp.label === myEnum
                      );

                      let filterExistingCharacters = false;
                      if (textBetweenColonAndCursor !== "") {
                        filterExistingCharacters = myEnum.startsWith(textBetweenColonAndCursor);
                        if (DEV) {
                          console.log("fECVC", filterExistingCharacters);
                        }
                      } else {
                        filterExistingCharacters = true;
                      }

                      if (filterExistingCharacters && existing === undefined) {
                        valueCompletions.push(completion);
                      }
                      // case Array
                    } else if (
                      key !== undefined &&
                      myEnum !== undefined &&
                      def.ref === enumGroupname &&
                      def.finalPath.includes("[")
                    ) {
                      const completion = new vscode.CompletionItem(myEnum);
                      completion.kind = vscode.CompletionItemKind.Method;
                      completion.command = {
                        command: "editor.action.ldproxy: Create new entities",
                        title: "Re-trigger completions...",
                      };
                      const existing = valueCompletions.find(
                        (existingComp) => existingComp.label === myEnum
                      );

                      let filterExistingCharacters = false;
                      if (textBetweenColonAndCursor !== "") {
                        filterExistingCharacters = myEnum.startsWith(textBetweenColonAndCursor);
                        if (DEV) {
                          console.log("fECVC", filterExistingCharacters);
                        }
                      } else {
                        filterExistingCharacters = true;
                      }

                      if (filterExistingCharacters && existing === undefined) {
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
    if (DEV) {
      console.log("Text vor dem Doppelpunkt:", textBeforeColon);
    }
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
