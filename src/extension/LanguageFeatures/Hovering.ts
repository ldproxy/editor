import * as vscode from "vscode";
import { hoverData } from "./providers";
import * as yaml from "js-yaml";

let specifiedDefs: string = "";
let otherSpecifiedDefs: string = "";

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

function defineDefs() {
  if (
    (providerType.length > 0 && featureProviderType.length > 0) ||
    (providerType.length > 0 && providerSubType.length > 0)
  ) {
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
  }
  if (type.length > 0) {
    if (type === "FEATURE_CHANGES_PG") {
      otherSpecifiedDefs = "FeatureChangesPgConfiguration";
    } else if (type === "Routes") {
      otherSpecifiedDefs = "RoutesConfiguration";
    } else if (type === "JSON_SCHEMA") {
      otherSpecifiedDefs = "JsonSchemaConfiguration";
    }
  }
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
        defineDefs();

        let definitionsMap: DefinitionsMap = processProperties(otherSpecifiedDefs, hoverData.$defs);

        definitionsMap = Object.assign(
          definitionsMap,
          processProperties(specifiedDefs, hoverData.$defs)
        );

        if (definitionsMap.hasOwnProperty(word) && definitionsMap[word].description !== "") {
          const hoverText = `${definitionsMap[word].title}: ${definitionsMap[word].description}`;
          return new vscode.Hover(hoverText);
        }

        return null;
      },
    }
  );
};
