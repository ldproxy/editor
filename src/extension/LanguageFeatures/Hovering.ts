import * as vscode from "vscode";
import { hoverData } from "../utilitiesLanguageFeatures/providers";
import { processProperties, findObjectsWithRef } from "../utilitiesLanguageFeatures/GetProviders";
import { defineDefs } from "../utilitiesLanguageFeatures/DefineDefs";
import { findPathInDocument } from "../utilitiesLanguageFeatures/findPathInDoc";
import * as yaml from "js-yaml";
import { allYamlKeys } from "./Completions";

let yamlKeysHover: { path: string; index: number; lineOfPath: number | null }[] = [];
const currentDocument = vscode.window.activeTextEditor?.document;
if (currentDocument) {
  const yamlObject: any = yaml.load(currentDocument.getText());
  getAllYamlPaths(currentDocument, yamlObject, "");
}

interface LooseDefinition {
  title?: string;
  description?: string;
  [key: string]: any;
}

interface DefinitionsMap {
  [key: string]: LooseDefinition;
}

export const hover = () => {
  vscode.languages.registerHoverProvider(
    { language: "yaml", pattern: "**/dvg.yml" },
    {
      provideHover(document, position) {
        const word: string = document.getText(document.getWordRangeAtPosition(position));
        const lineOfWord: number = position.line;
        const specifiedDefs: string[] = defineDefs(document);
        let definitionsMap: DefinitionsMap = {};
        let allRefs: string[] | undefined = [];

        if (specifiedDefs && specifiedDefs.length > 0) {
          specifiedDefs.map((def) => {
            definitionsMap = Object.assign(definitionsMap, processProperties(def, hoverData.$defs));
          });
        }
        if (definitionsMap && Object.keys(definitionsMap).length > 0) {
          allRefs = findObjectsWithRef(definitionsMap);
        }

        if (allRefs && allRefs.length > 0) {
          allRefs.map((ref) => {
            definitionsMap = Object.assign(definitionsMap, processProperties(ref, hoverData.$defs));
          });
        }

        const pathInYaml = yamlKeysHover.find((item) => item.lineOfPath === lineOfWord);
        let wordInDefinitionsMap: LooseDefinition = {};
        let hoverResult: vscode.Hover | undefined;

        if (pathInYaml?.index === 0) {
          if (
            definitionsMap.hasOwnProperty(pathInYaml.path) &&
            definitionsMap[pathInYaml.path].description !== ""
          ) {
            wordInDefinitionsMap = definitionsMap[pathInYaml.path];
          }
          specifiedDefs.forEach((def) => {
            if (def === wordInDefinitionsMap.groupname) {
              const hoverText = `${wordInDefinitionsMap.title}: ${wordInDefinitionsMap.description}`;
              hoverResult = new vscode.Hover(hoverText);
            }
          });

          console.log("definitionsMap", definitionsMap);
          return hoverResult;
        } else if (pathInYaml && pathInYaml.index > 0) {
          const pathInYamlParts = pathInYaml.path.split(".");
          const lastKey = pathInYamlParts[pathInYamlParts.length - 1];
          const secondLastKey = pathInYamlParts[pathInYamlParts.length - 2];
          const thirdLastKey = pathInYamlParts[pathInYamlParts.length - 3];

          if (
            definitionsMap.hasOwnProperty(secondLastKey) &&
            definitionsMap.hasOwnProperty(lastKey) &&
            definitionsMap[lastKey].description !== ""
          ) {
            wordInDefinitionsMap = definitionsMap[lastKey];
            const possibleRefWord = definitionsMap[secondLastKey];
            if (
              possibleRefWord.ref !== "" &&
              possibleRefWord.ref === wordInDefinitionsMap.groupname
            ) {
              const hoverText = `${wordInDefinitionsMap.title}: ${wordInDefinitionsMap.description}`;
              hoverResult = new vscode.Hover(hoverText);
            }
          }

          if (
            definitionsMap.hasOwnProperty(thirdLastKey) &&
            definitionsMap.hasOwnProperty(lastKey) &&
            definitionsMap[lastKey].description !== ""
          ) {
            wordInDefinitionsMap = definitionsMap[lastKey];
            const possibleAddRefWord = definitionsMap[thirdLastKey];

            if (
              possibleAddRefWord.addRef !== "" &&
              possibleAddRefWord.addRef === wordInDefinitionsMap.groupname
            ) {
              const hoverText = `${wordInDefinitionsMap.title}: ${wordInDefinitionsMap.description}`;
              hoverResult = new vscode.Hover(hoverText);
            }
          }

          return hoverResult;
        }
      },
    }
  );
};

/*
Hover Logik ab Line 52:

Line von word herausfinden.
Path in allYamlKeys finden.

Index=0: SpecifiedDefs sind ja die ursprünglichen. Wenn der Groupnname des Wortes in definitionsMap identisch mit 
einem der specifiedDefs ist, dann soll die dazugehörige Description für das passende Wort, falls es Index 0 hat, 
angezeigt werden.

Passende Descriptions für Index>0: Alle Objekte mit ref aus definitionsMap herausfiltern. 
Wenn das Wort in definitionsMap gefunden wurde, soll die Beschreibung nur angezeigt werden, wenn der 
vorletzte Teil des Pfades ein ref hat. Das Wort muss in der DefinitionsMap dann den groupname dieses refs haben.

Oder falls es sich im additionalProperty handelt:

Alle Objekte mit addRef aus definitionsMap herausfiltern. 
Wenn das Wort in definitionsMap gefunden wurde, soll die Beschreibung nur angezeigt werden, wenn der 
3. letzte Teil des Pfades in definitionsMap ein addRef hat. Das Wort muss in der DefinitionsMap dann den groupname 
dieses addRefs haben.
*/

export function getAllYamlPaths(
  document: vscode.TextDocument,
  yamlObject: any,
  currentPath: string
) {
  if (yamlObject && typeof yamlObject === "object") {
    const keys: string[] = Object.keys(yamlObject);

    for (const key of keys) {
      const value = yamlObject[key];

      if (typeof value !== "object" || value === null) {
        const path = currentPath ? `${currentPath}.${key}` : key;

        const results = findPathInDocument(document, path);
        if (results && results.column !== undefined && results.lineOfPath !== undefined) {
          const { column, lineOfPath } = results;

          yamlKeysHover = [...yamlKeysHover, { path, index: column, lineOfPath }];
        }
      } else if (value && typeof value === "object") {
        const path = currentPath ? `${currentPath}.${key}` : key;
        const results = findPathInDocument(document, path);
        if (results && results.column !== undefined && results.lineOfPath !== undefined) {
          const { column, lineOfPath } = results;

          yamlKeysHover = [...yamlKeysHover, { path, index: column, lineOfPath }];
        }
        getAllYamlPaths(document, value, path);
      }
    }
  }
}
