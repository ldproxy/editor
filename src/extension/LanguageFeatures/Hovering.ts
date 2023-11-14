import * as vscode from "vscode";
import { hoverData } from "./providers";

interface LooseDefinition {
  title?: string;
  description?: string;
  [key: string]: any;
}

interface DefinitionsMap {
  [key: string]: LooseDefinition;
}

function processProperties(
  definitions: Record<string, LooseDefinition>,
  definitionsMap: DefinitionsMap = {}
) {
  for (const key in definitions) {
    const definition = definitions[key];
    if (definition.properties) {
      for (const propKey in definition.properties) {
        const propDefinition = definition.properties[propKey];
        if (propDefinition.title || propDefinition.description) {
          definitionsMap[propKey] = {
            title: propDefinition.title,
            description: propDefinition.description,
          };
        }
      }
      processProperties(definition.properties, definitionsMap);
    }
  }
  return definitionsMap;
}

export const hover = () => {
  vscode.languages.registerHoverProvider(
    { language: "yaml", pattern: "**/dvg.yml" },
    {
      provideHover(document, position) {
        const word: string = document.getText(document.getWordRangeAtPosition(position));

        const definitionsMap: DefinitionsMap = processProperties(hoverData.$defs);
        console.log("definitionsMap", definitionsMap);

        if (definitionsMap.hasOwnProperty(word)) {
          const hoverText = `${definitionsMap[word].title}: ${definitionsMap[word].description}`;
          return new vscode.Hover(hoverText);
        }

        return null;
      },
    }
  );
};
