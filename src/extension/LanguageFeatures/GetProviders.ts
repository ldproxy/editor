import * as vscode from "vscode";
import * as yaml from "js-yaml";
import { hoverData } from "./providers";

interface LooseDefinition {
  title?: string;
  description?: string;
  [key: string]: any;
}

interface DefinitionsMap {
  [key: string]: LooseDefinition;
}

let specifiedDefs: string = "";
let otherSpecifiedDefs: string = "";

let providerType: string = "";
let featureProviderType: string = "";
let providerSubType: string = ""; // Einfach moderne Schreibweise von featureProviderType
let type: string = "";

export function defineDefs(document: vscode.TextDocument) {
  const config = yaml.load(document.getText()) as LooseDefinition;
  if (config) {
    providerType = config["providerType"];
    featureProviderType = config["featureProviderType"];
    providerSubType = config["providerSubType"]; // Einfach moderne Schreibweise von featureProviderType
    type = config["type"];
  }

  if (
    (providerType && providerType.length > 0 && featureProviderType.length > 0) ||
    (providerType && providerType.length > 0 && providerSubType.length > 0)
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
  if (type && type.length > 0) {
    if (type === "FEATURE_CHANGES_PG") {
      otherSpecifiedDefs = "FeatureChangesPgConfiguration";
    } else if (type === "Routes") {
      otherSpecifiedDefs = "RoutesConfiguration";
    } else if (type === "JSON_SCHEMA") {
      otherSpecifiedDefs = "JsonSchemaConfiguration";
    }
  }

  return [specifiedDefs, otherSpecifiedDefs];
}

export function processProperties(
  defs: string,
  definitions: Record<string, LooseDefinition>,
  definitionsMap: DefinitionsMap = {}
) {
  console.log("def", defs);
  let lastPartValue = "";
  if (defs !== "") {
    const definition = definitions[defs];
    if (definition && definition.properties) {
      for (const propKey in definition.properties) {
        const propDefinition = definition.properties[propKey];
        if (propDefinition.title || propDefinition.description) {
          const reference =
            propDefinition.$ref ||
            (propDefinition.additionalProperties && propDefinition.additionalProperties.$ref);
          if (reference && reference.length > 0) {
            const lastSlashIndex = reference.lastIndexOf("/");
            lastPartValue = reference.substring(lastSlashIndex + 1);
          }
          definitionsMap[propKey] = {
            groupname: defs,
            title: propDefinition.title,
            description: propDefinition.description,
            ref: lastPartValue,
          };
        }
      }
    }
  }

  return definitionsMap;
}

export function findObjectsWithRef(definitionsMap: DefinitionsMap): string[] {
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
        if (Object.keys(nestedDefinitionsMap).length === Object.keys(definitionsMap).length) {
          lastPartValueArray = lastPartValueArray.concat(findObjectsWithRef(nestedDefinitionsMap));
        }
      }
    }
    if (typeof obj === "object" && obj["additionalProperties"] !== undefined) {
      const value = obj.additionalProperties.$ref;
      if (value) {
        const lastSlashIndex = value.lastIndexOf("/");
        const lastPartValue: string = value.substring(lastSlashIndex + 1);
        lastPartValueArray.push(lastPartValue);
        console.log("valueeeeeeeeee", lastPartValue);

        const nestedDefinitionsMap = processProperties(lastPartValue, hoverData.$defs);
        if (Object.keys(nestedDefinitionsMap).length === Object.keys(definitionsMap).length) {
          lastPartValueArray = lastPartValueArray.concat(findObjectsWithRef(nestedDefinitionsMap));
        }
      }
    }
  }
  return lastPartValueArray;
}
