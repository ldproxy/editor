import * as vscode from "vscode";
import { extractDocRefs } from "../utilities/refs";
import { getDefinitionsMap, DefinitionsMap, LooseDefinition } from "../utilities/defs";
import {
  extractIndexFromPath,
  getMaxLine,
  AllYamlKeys,
  getLinesForArrayIndex,
  hashDoc,
} from "../utilities/yaml";
import { DEV } from "../utilities/constants";
import { getSchema } from "../utilities/schemas";
import { DocUpdate, Registration } from "../utilities/registration";

let yamlKeysHover: AllYamlKeys;
let specifiedDefs: { ref: string; finalPath: string }[];
let definitionsMap: DefinitionsMap = {};

export const updateHover: DocUpdate = async function (
  event,
  document,
  docUri,
  docHash,
  newAllYamlKeys
) {
  yamlKeysHover = newAllYamlKeys;
  const schema = await getSchema();
  const text = document.getText();
  if (text && schema) {
    specifiedDefs = extractDocRefs(text, schema, docUri, docHash);
    if (DEV) {
      console.log("specifiedDefsGetSchema", specifiedDefs);
    }
    if (specifiedDefs && specifiedDefs.length > 0) {
      definitionsMap = getDefinitionsMap(schema, specifiedDefs, docUri, docHash);
    }
  }
};

let hoverStatus: {
  [docUri: string]: { hash: string; results: { [lineCharacter: string]: vscode.Hover } };
} = {};

export const registerHover: Registration = () => {
  return [vscode.languages.registerHoverProvider("yaml", hover)];
};

const hover: vscode.HoverProvider = {
  provideHover(document, position) {
    const docUri = document.uri.toString();
    const docHash = hashDoc(document);
    const lineOfWord: number = position.line + 1;
    //NOTE: if yaml flow syntax should be supported, then use: `${lineOfWord}_${position.character}`
    const lineCharacter = `${lineOfWord}`;

    if (
      docUri &&
      docHash &&
      hoverStatus[docUri] &&
      hoverStatus[docUri].hash === docHash &&
      Object.keys(hoverStatus[docUri].results).includes(lineCharacter)
    ) {
      if (DEV) {
        console.log("hoverStatus", hoverStatus);
      }
      return hoverStatus[docUri].results[lineCharacter];
    }

    if (DEV) {
      console.log("yamlKeysHover", yamlKeysHover);
    }

    const pathInYaml = yamlKeysHover.find((item) => item.lineOfPath === lineOfWord);
    const pathSplit = pathInYaml?.path.split(".");
    const pathInYamlToUse = pathSplit?.slice(0, -1).join(".");
    const pathInYamlLastKey = pathSplit?.slice(-1)[0];
    let wordInDefinitionsMap: LooseDefinition = {};
    let hoverResult: vscode.Hover | undefined;
    specifiedDefs.forEach((defObj) => {
      if (DEV) {
        console.log("defObjHover", defObj);
      }
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
        maxLine = getMaxLine(yamlKeysHover, minLine, document);
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
      // case1: word part of a ref of specifiedDefs whose path is no array (e.g. not buildingBlock [e.g. not CollectionsConfiguration])
      // Also not refs or addRefs
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
        //Case2: Array
      } else if (
        specifiedDefsPath.includes("[") &&
        pathInYamlToUse === pathForArray &&
        minLine !== undefined &&
        maxLine !== undefined &&
        lineOfWord >= minLine &&
        lineOfWord < maxLine &&
        definitionsMap &&
        pathInYaml &&
        pathInYamlLastKey &&
        definitionsMap.hasOwnProperty(pathInYamlLastKey)
      ) {
        if (DEV) {
          console.log("neuesMinMax", minLine, maxLine, lineOfWord);
        }
        for (const key in definitionsMap) {
          const obj = definitionsMap[key];
          if (
            obj.title === pathInYamlLastKey &&
            ref === obj.groupname &&
            definitionsMap[pathInYamlLastKey].description !== ""
          ) {
            if (DEV) {
              console.log("TTTTTest", obj);
            }
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
        //case3: refs and then addRefs
      } else {
        const pathInYamlParts = pathInYaml?.path.split(".");
        let lastKey = "";
        let secondLastKey = "";
        let thirdLastKey = "";
        if (pathInYamlParts) {
          lastKey = pathInYamlParts[pathInYamlParts.length - 1];
          secondLastKey = pathInYamlParts[pathInYamlParts.length - 2];
          thirdLastKey = pathInYamlParts[pathInYamlParts.length - 3];
          if (DEV) {
            console.log("addRef1", thirdLastKey, lastKey);
          }
        }
        // case ref
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
          if (DEV) {
            console.log("secRef", matchingObject);
          }
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

        // case addRef
        if (definitionsMap.hasOwnProperty(thirdLastKey) && definitionsMap.hasOwnProperty(lastKey)) {
          if (DEV) {
            console.log("addRefThird", thirdLastKey, lastKey);
          }

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
          if (DEV) {
            console.log("thirdLastCase", matchingObject);
          }
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
        if (DEV) {
          console.log("specifiedDefs1", specifiedDefs);
        }
        if (docUri && docHash && lineCharacter && hoverResult) {
          if (hoverStatus[docUri] && hoverStatus[docUri].hash === docHash) {
            hoverStatus[docUri].results[lineCharacter] = hoverResult;
          } else {
            hoverStatus[docUri] = { hash: docHash, results: { [lineCharacter]: hoverResult } };
          }
        }
        return hoverResult;
      }
    });
    if (DEV) {
      console.log("definitionsMap", definitionsMap);
    }
    if (docUri && docHash && lineCharacter && hoverResult) {
      if (hoverStatus[docUri] && hoverStatus[docUri].hash === docHash) {
        hoverStatus[docUri].results[lineCharacter] = hoverResult;
      } else {
        hoverStatus[docUri] = { hash: docHash, results: { [lineCharacter]: hoverResult } };
      }
    }
    return hoverResult;
  },
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
