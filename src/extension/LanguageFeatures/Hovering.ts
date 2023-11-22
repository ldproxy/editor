import * as vscode from "vscode";
import { hoverData } from "./providers";
import { defineDefs } from "./GetProviders";

interface LooseDefinition {
  title?: string;
  description?: string;
  [key: string]: any;
}

interface DefinitionsMap {
  [key: string]: LooseDefinition;
}

function processProperties(
  defs: string,
  definitions: Record<string, LooseDefinition>,
  definitionsMap: DefinitionsMap = {}
) {
  console.log("def", defs);
  if (defs !== "") {
    const definition = definitions[defs];
    if (definition && definition.properties) {
      for (const propKey in definition.properties) {
        const propDefinition = definition.properties[propKey];
        if (propDefinition.title || propDefinition.description) {
          definitionsMap[propKey] = {
            title: propDefinition.title,
            description: propDefinition.description,
            ref: propDefinition.$ref,
          };
        }
      }
    }
  }

  return definitionsMap;
}

/* 
              auch noch otherProperties.ref rein*/
function findObjectsWithRef(definitionsMap: DefinitionsMap): string[] {
  let lastPartValueArray: string[] | undefined = [];
  for (const key in definitionsMap) {
    const obj = definitionsMap[key];
    if (typeof obj === "object" && obj["ref"] !== undefined) {
      const value = obj.ref;
      if (value) {
        const lastSlashIndex = value.lastIndexOf("/");
        const lastPartValue: string = value.substring(lastSlashIndex + 1);
        lastPartValueArray.push(lastPartValue);
        console.log("valueeeeeeeeee", lastPartValue);

        const nestedDefinitionsMap = processProperties(lastPartValue, hoverData.$defs);
        lastPartValueArray = lastPartValueArray.concat(findObjectsWithRef(nestedDefinitionsMap));
      }
    }
  }
  return lastPartValueArray;
}

export const hover = () => {
  vscode.languages.registerHoverProvider(
    { language: "yaml", pattern: "**/dvg.yml" },
    {
      provideHover(document, position) {
        const word: string = document.getText(document.getWordRangeAtPosition(position));
        const specifiedDefs = defineDefs(document)[0];
        const otherSpecifiedDefs = defineDefs(document)[1];
        let definitionsMap: DefinitionsMap = {};
        let allRefs: string[] | undefined = [];

        console.log("specifiedDefs, otherSpecifiedDefs", specifiedDefs, otherSpecifiedDefs);
        if (
          specifiedDefs &&
          otherSpecifiedDefs &&
          otherSpecifiedDefs.length > 0 &&
          specifiedDefs.length > 0
        ) {
          definitionsMap = processProperties(otherSpecifiedDefs, hoverData.$defs);

          definitionsMap = Object.assign(
            definitionsMap,
            processProperties(specifiedDefs, hoverData.$defs)
          );
        }
        if (definitionsMap && Object.keys(definitionsMap).length > 0) {
          allRefs = findObjectsWithRef(definitionsMap);
        }

        if (allRefs && allRefs.length > 0) {
          allRefs.map((ref) => {
            definitionsMap = Object.assign(definitionsMap, processProperties(ref, hoverData.$defs));
          });
        }

        if (definitionsMap.hasOwnProperty(word) && definitionsMap[word].description !== "") {
          console.log("definitionsMap", definitionsMap);
          const hoverText = `${definitionsMap[word].title}: ${definitionsMap[word].description}`;
          return new vscode.Hover(hoverText);
        }

        return null;
      },
    }
  );
};
