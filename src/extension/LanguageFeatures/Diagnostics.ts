import * as vscode from "vscode";
import { results } from "./DiagnosticResponse";
import * as yaml from "js-yaml";

let workspace = "c:/Users/p.zahnen/Documents/GitHub/editor/data/";
let diagnostic; // to be named results
/* const workspaceFolders = vscode.workspace.workspaceFolders;
if (workspaceFolders && workspaceFolders[0]) {
  workspace = workspaceFolders[0].uri.fsPath;
} */

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
  if (document.uri.path.includes("dvg.yml")) {
    const diagnostics: vscode.Diagnostic[] = [];

    infoMessages.forEach((info) => {
      const infoText = info.match(/\$.(.*):/);
      const infoWord = infoText ? infoText[1].trim() : "";
      try {
        const yamlObject = yaml.load(document.getText());
        const keys = infoWord.split(".");
        let lastKey: string | undefined;
        let lastKeyIndex: number | undefined;
        let errorIndex: number | undefined;

        let currentObject: any = yamlObject;
        for (const key of keys) {
          if (currentObject[key] !== undefined) {
            lastKey = key;
            currentObject = currentObject[key];
            lastKeyIndex = document.getText().indexOf(currentObject);

            if (lastKey) {
              const textBeforeIndex = document.getText().substring(0, lastKeyIndex);
              const lastColonIndex = textBeforeIndex.lastIndexOf(":");
              if (lastColonIndex !== -1) {
                const textBeforeColon = textBeforeIndex.substring(0, lastColonIndex).trim();
                const match = textBeforeColon.match(/(\S+)$/);

                if (match && match.index) {
                  errorIndex = lastColonIndex - (textBeforeColon.length - match.index);
                }
              }
            }

            const startPosition = document.positionAt(errorIndex ? errorIndex : 0);
            const endPosition = document.positionAt(
              errorIndex && lastKey ? errorIndex + lastKey.length : 0
            );

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
            console.error(`Key "${key}" not found in path "${infoWord}"`);
            break;
          }
        }
      } catch (e) {
        console.error("Error parsing YAML:", e);
      }
    });
  } else {
    collection.clear();
  }
}
