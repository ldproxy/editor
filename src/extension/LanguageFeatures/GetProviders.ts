import * as vscode from "vscode";
import * as yaml from "js-yaml";
import { hoverData } from "./providers";

interface LooseDefinition {
  title?: string;
  description?: string;
  [key: string]: any;
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

export function buildDataObjectForCompletions(defs: string) {
  const data: Record<string, LooseDefinition> = hoverData.$defs;
  const completionParentKeys = data[defs];
  interface CompletionWordInterface {
    key: string;
    ref: string;
  }
  let completionWords: CompletionWordInterface[] = [];
  if (completionParentKeys && completionParentKeys.properties) {
    for (const propKey in completionParentKeys.properties) {
      const key = propKey;
      const ref = completionParentKeys.properties[propKey].$ref;
      completionWords.push({ key, ref });
    }
  }
  console.log("completionWords: ", completionWords);
  return completionWords;
}
