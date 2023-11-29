import * as vscode from "vscode";
import { results } from "./DiagnosticResponse";
import * as yaml from "js-yaml";
import { findPathInDocument } from "../utilitiesLanguageFeatures/findPathInDoc";

let workspace = "c:/Users/p.zahnen/Documents/GitHub/editor/data/";
let diagnostic; // to be named results
/* const workspaceFolders = vscode.workspace.workspaceFolders;
if (workspaceFolders && workspaceFolders[0]) {
  workspace = workspaceFolders[0].uri.fsPath;
} */

let yamlKeysDiagnostic: { path: string; index: number; lineOfPath: number | null }[] = [];
const currentDocument = vscode.window.activeTextEditor?.document;
if (currentDocument) {
  const yamlObject: any = yaml.load(currentDocument.getText());
  getAllYamlPaths(currentDocument, yamlObject, "");
}

const diagnosticSubmitData = {
  command: "check",
  subcommand: "entities",
  source: workspace,
  onlyEntities: true,
  // path: "entities/instances/providers/dvg.yml",
};

export const getDiagnostics = () => {
  try {
    JSON.parse(JSON.stringify(diagnosticSubmitData));
    const socket = new WebSocket("ws://localhost:8080/sock");

    socket.addEventListener("open", () => {
      const jsonData = JSON.stringify(diagnosticSubmitData);
      socket.send(jsonData);
    });

    socket.addEventListener("message", (event) => {
      const response = JSON.parse(event.data);
      diagnostic = response;
    });
  } catch (error) {
    console.error("Fehler bei Diagnostics:", error);
  }
};

const infoMessages = results
  .filter((result) => result.status === "INFO")
  .map((result) => {
    const match = result.message;

    return match ? match : "";
  });

export function updateDiagnostics(
  document: vscode.TextDocument,
  collection: vscode.DiagnosticCollection
): void {
  console.log("sss", yamlKeysDiagnostic);
  if (document.uri.path.includes("ogc_api.yml")) {
    const diagnostics: vscode.Diagnostic[] = [];

    infoMessages.forEach((info) => {
      const infoText = info.match(/\$.(.*):/);
      const infoWord = infoText ? infoText[1].trim() : "";
      try {
        const keys = infoWord.split(".");
        const lastKey: string = keys[keys.length - 1];
        let lastKeyIndex: number | undefined;

        let lineOfPath: number | null = 0;

        const foundItem = yamlKeysDiagnostic.find((item) => item.path === infoWord);
        if (foundItem) {
          lineOfPath = foundItem.lineOfPath;
        }
        if (lineOfPath && lineOfPath !== 0) {
          const lineText = document.lineAt(lineOfPath).text;
          if (lineText.includes(lastKey)) {
            const keyIndex = lineText.indexOf(lastKey);
            const lineTextIndex = document.offsetAt(new vscode.Position(lineOfPath, 0));

            lastKeyIndex = lineTextIndex + keyIndex;
          }

          const startPosition = document.positionAt(lastKeyIndex ? lastKeyIndex : 0);
          const endPosition = document.positionAt(lastKeyIndex ? lastKeyIndex + lastKey.length : 0);

          if (lastKeyIndex !== -1) {
            const diagnostic = new vscode.Diagnostic(
              new vscode.Range(startPosition, endPosition),
              `${info}`,
              vscode.DiagnosticSeverity.Error
            );

            diagnostics.push(diagnostic);

            collection.set(document.uri, diagnostics);
          }
        } else {
          console.error(`Key "${lastKey}" not found in path "${infoWord}"`);
        }
      } catch (e) {
        console.error("Error parsing YAML:", e);
      }
    });
  } else {
    collection.clear();
  }
}

export function getAllYamlPaths(
  document: vscode.TextDocument,
  yamlObject: any,
  currentPath: string
) {
  if (yamlObject && typeof yamlObject === "object") {
    const keys: string[] = Object.keys(yamlObject);

    for (const key of keys) {
      const value = yamlObject[key];
      console.log("hhh", key, value);

      if (Array.isArray(value)) {
        const arrayPath = currentPath ? `${currentPath}.${key}` : key;
        console.log("ooo", arrayPath);
        const arrayResults = findPathInDocument(document, arrayPath);
        if (
          arrayResults &&
          arrayResults.column !== undefined &&
          arrayResults.lineOfPath !== undefined
        ) {
          const { column, lineOfPath } = arrayResults;
          yamlKeysDiagnostic = [
            ...yamlKeysDiagnostic,
            { path: arrayPath, index: column, lineOfPath: lineOfPath },
          ];
        }

        if (value.length > 1) {
          for (let i = 0, length = value.length; i < length; i++) {
            const object = value[i];
            const keysOfObject = Object.keys(object);
            for (const keyOfObject of keysOfObject) {
              const path = currentPath
                ? `${currentPath}.${key}.${keyOfObject}`
                : `${key}.${keyOfObject}`;

              const results = findPathInDocument(document, path);
              if (results && results.column !== undefined && results.lineOfPath !== undefined) {
                const { column, lineOfPath } = results;

                yamlKeysDiagnostic = [
                  ...yamlKeysDiagnostic,
                  { path, index: column - 2, lineOfPath },
                ];
              }
            }
          }
        }
      } else if (typeof value !== "object" || value === null) {
        const path = currentPath ? `${currentPath}.${key}` : key;

        const results = findPathInDocument(document, path);
        if (results && results.column !== undefined && results.lineOfPath !== undefined) {
          const { column, lineOfPath } = results;

          yamlKeysDiagnostic = [...yamlKeysDiagnostic, { path, index: column, lineOfPath }];
        }
      } else if (value && typeof value === "object") {
        const path = currentPath ? `${currentPath}.${key}` : key;
        const results = findPathInDocument(document, path);
        if (results && results.column !== undefined && results.lineOfPath !== undefined) {
          const { column, lineOfPath } = results;

          yamlKeysDiagnostic = [...yamlKeysDiagnostic, { path, index: column, lineOfPath }];
        }
        getAllYamlPaths(document, value, path);
      }
    }
  }
}
