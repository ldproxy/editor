import * as vscode from "vscode";
import { services } from "./services";
import { hoverData } from "./providers";

export interface DefinitionsMap {
  [key: string]: LooseDefinition;
}

export interface LooseDefinition {
  title?: string;
  description?: string;
  [key: string]: any;
}

export const getSchema = (): LooseDefinition | undefined => {
  let currentFilePath = getCurrentFilePath();
  let serviceOrProvider: string | undefined;
  if (currentFilePath) {
    serviceOrProvider = servicesOrProviders(currentFilePath);
  }

  let schema = undefined;

  if (serviceOrProvider && serviceOrProvider === "services") {
    schema = services;
  } else if (serviceOrProvider && serviceOrProvider === "providers") {
    schema = hoverData;
  }

  return schema;
};

export const getSchemaDefs = (): DefinitionsMap | undefined => {
  const schema = getSchema();

  if (!schema) {
    return undefined;
  }

  return schema.$defs;
};

function getCurrentFilePath(): string | undefined {
  const activeTextEditor = vscode.window.activeTextEditor;
  if (activeTextEditor) {
    return activeTextEditor.document.uri.path;
  }
  return undefined;
}

function servicesOrProviders(currentFilePath: string) {
  const splitPath = currentFilePath.split("/");
  if (splitPath.length >= 2) {
    return splitPath[splitPath.length - 2];
  }
}
