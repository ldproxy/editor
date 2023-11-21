import * as vscode from "vscode";
import { hoverData } from "./providers";
import * as yaml from "js-yaml";
import { defineDefs } from "./GetProviders";

let providerType = "";
let featureProviderType = "";
let providerSubType = "";
let type = "";

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
  if (defs !== "") {
    const definition = definitions[defs];
    if (definition && definition.properties) {
      for (const propKey in definition.properties) {
        const propDefinition = definition.properties[propKey];
        if (propDefinition.title || propDefinition.description) {
          definitionsMap[propKey] = {
            title: propDefinition.title,
            description: propDefinition.description,
          };
        }
      }
    }
  }

  return definitionsMap;
}

export const hover = () => {
  vscode.languages.registerHoverProvider(
    { language: "yaml", pattern: "**/dvg.yml" },
    {
      provideHover(document, position) {
        const config = yaml.load(document.getText()) as LooseDefinition;
        providerType = config["providerType"];
        featureProviderType = config["featureProviderType"];
        providerSubType = config["providerSubType"]; // Einfach moderne Schreibweise von featureProviderType
        type = config["type"];

        const word: string = document.getText(document.getWordRangeAtPosition(position));
        const specifiedDefs = defineDefs(document)[0];
        const otherSpecifiedDefs = defineDefs(document)[1];
        let definitionsMap: DefinitionsMap = {};

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

        console.log("definitionsMap", definitionsMap);
        if (definitionsMap.hasOwnProperty(word) && definitionsMap[word].description !== "") {
          const hoverText = `${definitionsMap[word].title}: ${definitionsMap[word].description}`;
          return new vscode.Hover(hoverText);
        }

        return null;
      },
    }
  );
};
