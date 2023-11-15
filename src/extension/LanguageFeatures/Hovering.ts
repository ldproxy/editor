import * as vscode from "vscode";
import { hoverData } from "./providers";
import * as yaml from "js-yaml";

let providerType = "";
let featureProviderType = "";
let providerSubType = "";

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
  let specifiedDefs: string = "";

  if (
    (providerType === "FEATURE" && providerSubType === "WFS") ||
    (providerType === "FEATURE" && featureProviderType === "WFS")
  ) {
    specifiedDefs = "FeatureProviderWfsData";
  } else if (
    (providerType === "FEATURE" && providerSubType === "SQL") ||
    (providerType === "FEATURE" && featureProviderType === "SQL")
  ) {
    specifiedDefs = "FeatureProviderSqlData";
  } else if (providerType === "TILE" && providerSubType === "FEATURES") {
    specifiedDefs = "TileProviderFeaturesData";
  } else if (providerType === "TILE" && providerSubType === "MBTILES") {
    specifiedDefs = "TileProviderMbTilesData";
  } else if (providerType === "TILE" && providerSubType === "HTTP") {
    specifiedDefs = "TileProviderHTTPData";
  }

  if (specifiedDefs !== "") {
    const definition = definitions[specifiedDefs];
    if (definition && definition.properties) {
      console.log("definition", definition.properties);
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
        const config = yaml.load(document.getText()) as LooseDefinition;
        providerType = config["providerType"];
        featureProviderType = config["featureProviderType"];
        providerSubType = config["providerSubType"]; // Einfach moderne Schreibweise von featureProviderType
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
