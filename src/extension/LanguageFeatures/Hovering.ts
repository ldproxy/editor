import * as vscode from "vscode";
// import { hoverData } from "../utilitiesLanguageFeatures/providers";
import { processProperties, findObjectsWithRef } from "../utilitiesLanguageFeatures/GetProviders";
import { defineDefs } from "../utilitiesLanguageFeatures/DefineDefs";
import { findPathInDocument } from "../utilitiesLanguageFeatures/findPathInDoc";
import * as yaml from "js-yaml";
import { services } from "../utilitiesLanguageFeatures/services";
import {
  extractIndexFromPath,
  getLinesForArrayIndex,
} from "../utilitiesLanguageFeatures/completionsForArray";

let yamlKeysHover: {
  path: string;
  index: number;
  lineOfPath: number | null;
  arrayIndex?: number;
}[] = [];
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
    // { language: "yaml", pattern: "**/dvg.yml" },
    { language: "yaml" },
    {
      provideHover(document, position) {
        const lineOfWord: number = position.line;
        const specifiedDefs: { ref: string; finalPath: string }[] = defineDefs(document);
        let definitionsMap: DefinitionsMap = {};
        let allRefs: string[] | undefined = [];

        if (specifiedDefs && specifiedDefs.length > 0) {
          specifiedDefs.map((def) => {
            definitionsMap = Object.assign(
              definitionsMap,
              processProperties(def.ref, services.$defs)
            );
          });
        }
        if (definitionsMap && Object.keys(definitionsMap).length > 0) {
          allRefs = findObjectsWithRef(definitionsMap);
        }

        if (allRefs && allRefs.length > 0) {
          allRefs.map((ref) => {
            definitionsMap = Object.assign(definitionsMap, processProperties(ref, services.$defs));
          });
        }

        const pathInYaml = yamlKeysHover.find((item) => item.lineOfPath === lineOfWord);
        const pathSplit = pathInYaml?.path.split(".");
        const pathInYamlToUse = pathSplit?.slice(0, -1).join(".");
        const pathInYamlLastKey = pathSplit?.slice(-1)[0];
        let wordInDefinitionsMap: LooseDefinition = {};
        let hoverResult: vscode.Hover | undefined;
        specifiedDefs.forEach((defObj) => {
          const ref = defObj.ref;
          const path = defObj.finalPath;
          const pathSplit = path.split(".");
          const specifiedDefsPath = pathSplit.slice(0, -1).join(".");
          const pathForArray = pathSplit.slice(0, -2).join(".");
          const arrayIndex = extractIndexFromPath(path);
          const possibleLines = getLinesForArrayIndex(yamlKeysHover, arrayIndex ? arrayIndex : 0);
          const minLine = Math.min(...possibleLines);
          const maxLine = Math.max(...possibleLines);
          if (pathInYaml) {
          }
          if (
            !specifiedDefsPath.includes("[") &&
            pathInYamlToUse === specifiedDefsPath &&
            definitionsMap &&
            pathInYaml &&
            definitionsMap.hasOwnProperty(pathInYaml.path) &&
            definitionsMap[pathInYaml.path].description !== ""
          ) {
            wordInDefinitionsMap = definitionsMap[pathInYaml.path];

            if (ref === wordInDefinitionsMap.groupname) {
              const hoverText = `${wordInDefinitionsMap.title}: ${wordInDefinitionsMap.description}`;
              hoverResult = new vscode.Hover(hoverText);
            }
          } else if (
            specifiedDefsPath.includes("[") &&
            pathInYamlToUse === pathForArray &&
            lineOfWord >= minLine &&
            lineOfWord <= maxLine &&
            definitionsMap &&
            pathInYaml &&
            pathInYamlLastKey &&
            definitionsMap.hasOwnProperty(pathInYamlLastKey) &&
            definitionsMap[pathInYamlLastKey].description !== "" &&
            definitionsMap[pathInYamlLastKey].groupname === ref
          ) {
            wordInDefinitionsMap = definitionsMap[pathInYamlLastKey];

            const hoverText = `${wordInDefinitionsMap.title}: ${wordInDefinitionsMap.description}`;
            hoverResult = new vscode.Hover(hoverText);
          } else {
            const pathInYamlParts = pathInYaml?.path.split(".");
            let lastKey = "";
            let secondLastKey = "";
            let thirdLastKey = "";
            if (pathInYamlParts) {
              lastKey = pathInYamlParts[pathInYamlParts.length - 1];
              secondLastKey = pathInYamlParts[pathInYamlParts.length - 2];
              thirdLastKey = pathInYamlParts[pathInYamlParts.length - 3];
            }
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
            console.log("jjj", specifiedDefs);
            return hoverResult;
          }
        });

        console.log("definitionsMap", definitionsMap);
        return hoverResult;
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
      console.log("hhh", key, value);

      if (Array.isArray(value)) {
        const arrayPath = currentPath ? `${currentPath}.${key}` : key;
        const arrayResults = findPathInDocument(document, arrayPath);
        if (
          arrayResults &&
          arrayResults.column !== undefined &&
          arrayResults.lineOfPath !== undefined
        ) {
          const { column, lineOfPath } = arrayResults;
          yamlKeysHover = [
            ...yamlKeysHover,
            { path: arrayPath, index: column, lineOfPath: lineOfPath },
          ];
        }

        if (value.length > 1) {
          for (let i = 0, length = value.length; i < length; i++) {
            const object = value[i];
            const keysOfObject = Object.keys(object);
            for (const keyOfObject of keysOfObject) {
              const path = currentPath
                ? `${currentPath}.${key}.${keyOfObject}`
                : `${key}.${keyOfObject}`;
              console.log("pathi", path);
              const results = findPathInDocument(document, path, object[keyOfObject]);
              console.log("results", results);
              if (results && results.column !== undefined && results.lineOfPath !== undefined) {
                const { column, lineOfPath } = results;

                yamlKeysHover = [
                  ...yamlKeysHover,
                  { path, index: column, lineOfPath, arrayIndex: i },
                ];
              }
            }
          }
        }
      } else if (typeof value !== "object" || value === null) {
        const path = currentPath ? `${currentPath}.${key}` : key;
        const results = findPathInDocument(document, path, value);
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
