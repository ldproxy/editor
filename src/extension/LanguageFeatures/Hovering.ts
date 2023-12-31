import * as vscode from "vscode";
import { defineDefs } from "../utilitiesLanguageFeatures/defineDefs";
import { getDefinitionsMap } from "../utilitiesLanguageFeatures/getDefinitionsMap";
import {
  extractIndexFromPath,
  getLinesForArrayIndex,
  getMaxLine,
} from "../utilitiesLanguageFeatures/handlingYamlArrays";
import { DEV } from "../utilities/constants";

interface LooseDefinition {
  title?: string;
  description?: string;
  [key: string]: any;
}

interface DefinitionsMap {
  [key: string]: LooseDefinition;
}

let yamlKeysHover: {
  path: string;
  index: number;
  lineOfPath: number;
  startOfArray?: number;
}[];

let specifiedDefs: { ref: string; finalPath: string }[];
let definitionsMap: DefinitionsMap = {};

export async function getSchemaMapHovering() {
  const currentDocument = vscode.window.activeTextEditor?.document;
  if (currentDocument) {
    specifiedDefs = await defineDefs(currentDocument);
    console.log("hjkl", specifiedDefs);
    if (specifiedDefs && specifiedDefs.length > 0) {
      definitionsMap = await getDefinitionsMap(specifiedDefs);
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
  yamlKeysHover = yamlkeys;
}

export const hover = () => {
  vscode.languages.registerHoverProvider(
    // { language: "yaml", pattern: "**/dvg.yml" },
    { language: "yaml" },
    {
      provideHover(document, position) {
        console.log("yamlKeysHover", yamlKeysHover);

        const lineOfWord: number = position.line + 1;

        const pathInYaml = yamlKeysHover.find((item) => item.lineOfPath === lineOfWord);
        const pathSplit = pathInYaml?.path.split(".");
        const pathInYamlToUse = pathSplit?.slice(0, -1).join(".");
        const pathInYamlLastKey = pathSplit?.slice(-1)[0];
        let wordInDefinitionsMap: LooseDefinition = {};
        let hoverResult: vscode.Hover | undefined;
        specifiedDefs.forEach((defObj) => {
          console.log("jjjj", defObj);
          const ref = defObj.ref;
          const path = defObj.finalPath;
          const pathSplit = path.split(".");
          const specifiedDefsPath = pathSplit.slice(0, -1).join(".");
          const pathForArray = pathSplit.slice(0, -2).join(".");
          const arrayIndex = extractIndexFromPath(path);
          const minLine = getLinesForArrayIndex(
            yamlKeysHover,
            arrayIndex ? arrayIndex : 0,
            specifiedDefsPath
          );
          let maxLine: number | undefined;
          if (minLine) {
            maxLine = getMaxLine(yamlKeysHover, minLine);
          }
          if (pathInYaml) {
            if (DEV) {
              console.log("specifiedDefs", specifiedDefs);
              console.log("hoverPathForArray", pathForArray);
              console.log("hoverMinMax", minLine, maxLine, lineOfWord);
              console.log("hoverSpecifiedPath", specifiedDefsPath);
              console.log("hoverPathToUse", pathInYamlToUse);
              console.log("hoverpathInYamlLastKey", pathInYamlLastKey);
              console.log("hoverPathInYaml", pathInYaml);
            }
          }
          if (
            !specifiedDefsPath.includes("[") &&
            pathInYamlToUse === specifiedDefsPath &&
            definitionsMap &&
            pathInYaml &&
            definitionsMap.hasOwnProperty(pathInYaml.path)
          ) {
            for (const key in definitionsMap) {
              const obj = definitionsMap[key];
              if (obj.title === pathInYaml.path && ref === obj.groupname) {
                wordInDefinitionsMap = obj;
                break;
              }
            }

            if (
              wordInDefinitionsMap &&
              wordInDefinitionsMap.description !== "" &&
              wordInDefinitionsMap.description !== undefined
            ) {
              const hoverText = `${wordInDefinitionsMap.title}: ${wordInDefinitionsMap.description}`;
              hoverResult = new vscode.Hover(hoverText);
            }
          } else if (
            specifiedDefsPath.includes("[") &&
            pathInYamlToUse === pathForArray &&
            minLine &&
            maxLine &&
            lineOfWord >= minLine &&
            lineOfWord < maxLine &&
            definitionsMap &&
            pathInYaml &&
            pathInYamlLastKey &&
            definitionsMap.hasOwnProperty(pathInYamlLastKey)
          ) {
            for (const key in definitionsMap) {
              const obj = definitionsMap[key];
              if (
                obj.title === pathInYamlLastKey &&
                ref === obj.groupname &&
                definitionsMap[pathInYamlLastKey].description !== ""
              ) {
                wordInDefinitionsMap = obj;
                break;
              }
            }

            if (
              wordInDefinitionsMap &&
              wordInDefinitionsMap.description !== "" &&
              wordInDefinitionsMap.description !== undefined
            ) {
              const hoverText = `${wordInDefinitionsMap.title}: ${wordInDefinitionsMap.description}`;
              hoverResult = new vscode.Hover(hoverText);
            }
          } else {
            const pathInYamlParts = pathInYaml?.path.split(".");
            let lastKey = "";
            let secondLastKey = "";
            let thirdLastKey = "";
            if (pathInYamlParts) {
              lastKey = pathInYamlParts[pathInYamlParts.length - 1];
              secondLastKey = pathInYamlParts[pathInYamlParts.length - 2];
              thirdLastKey = pathInYamlParts[pathInYamlParts.length - 3];
              console.log("klkladdRef1", thirdLastKey, lastKey);
            }
            if (
              definitionsMap.hasOwnProperty(secondLastKey) &&
              definitionsMap.hasOwnProperty(lastKey)
            ) {
              let matchingObjects = [];

              for (const key in definitionsMap) {
                const obj = definitionsMap[key];
                if (obj.title === lastKey && obj.description !== "") {
                  matchingObjects.push(obj);
                }
              }

              let possibleRefWord;
              let matchingObject;
              for (const key in definitionsMap) {
                const obj = definitionsMap[key];
                if (obj.title === secondLastKey && obj.ref !== "") {
                  matchingObject = matchingObjects.find(
                    (matchingObj) => matchingObj.groupname === obj.ref
                  );

                  if (matchingObject) {
                    possibleRefWord = obj;
                    break;
                  }
                }
              }
              console.log("secRef", matchingObject);
              if (
                matchingObject &&
                possibleRefWord &&
                matchingObject.description &&
                matchingObject.description !== undefined
              ) {
                const hoverText = `${matchingObject.title}: ${matchingObject.description}`;
                hoverResult = new vscode.Hover(hoverText);
              }
            }

            if (
              definitionsMap.hasOwnProperty(thirdLastKey) &&
              definitionsMap.hasOwnProperty(lastKey)
            ) {
              console.log("klkladdRef", thirdLastKey, lastKey);

              let matchingObjects = [];

              for (const key in definitionsMap) {
                const obj = definitionsMap[key];
                if (obj.title === lastKey && obj.description !== "") {
                  matchingObjects.push(obj);
                }
              }

              let possibleAddRefWord;
              let matchingObject;
              for (const key in definitionsMap) {
                const obj = definitionsMap[key];
                if (obj.title === thirdLastKey && obj.addRef !== "") {
                  matchingObject = matchingObjects.find(
                    (matchingObj) => matchingObj.groupname === obj.addRef
                  );

                  if (matchingObject) {
                    possibleAddRefWord = obj;
                    break;
                  }
                }
              }
              console.log("thirdLastCase", matchingObject);
              if (
                matchingObject &&
                possibleAddRefWord &&
                matchingObject.description &&
                matchingObject.description !== undefined
              ) {
                const hoverText = `${matchingObject.title}: ${matchingObject.description}`;
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
Ursprüngliche Hover Logik ab Line 52(nicht mehr ganz aktuell):

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
