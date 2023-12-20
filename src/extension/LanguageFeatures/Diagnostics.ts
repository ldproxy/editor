import * as vscode from "vscode";
import { testresults } from "./DiagnosticResponse";

interface YamlKeysDiagnostic {
  path: string;
  index: number;
  lineOfPath: number;
  arrayIndex?: number;
}

let workspace = "c:/Users/p.zahnen/Documents/GitHub/editor/data/";
let results = testresults; // to be named results
const workspaceFolders = vscode.workspace.workspaceFolders;
if (workspaceFolders && workspaceFolders[0]) {
  workspace = workspaceFolders[0].uri.fsPath;
}

const diagnosticSubmitData = {
  command: "check",
  subcommand: "entities",
  source: workspace,
  onlyEntities: true,
  path: "entities/instances/services/cfg.yml",
};

export const getDiagnostics = () => {
  try {
    JSON.parse(JSON.stringify(diagnosticSubmitData));
    const socket = new WebSocket("ws://localhost:8081/sock");

    socket.addEventListener("open", () => {
      const jsonData = JSON.stringify(diagnosticSubmitData);
      socket.send(jsonData);
    });

    socket.addEventListener("message", (event) => {
      const response = JSON.parse(event.data);
      results = response;
      console.log("responsee1", response);
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
  yamlKeysDiagnostic: YamlKeysDiagnostic[],
  document: vscode.TextDocument,
  collection: vscode.DiagnosticCollection
): void {
  console.log("sss", yamlKeysDiagnostic);
  if (document.uri.path.includes(".yml")) {
    const diagnostics: vscode.Diagnostic[] = [];

    infoMessages.forEach((info) => {
      const infoText = info.match(/\$.(.*):/);
      const infoWord = infoText ? infoText[1].trim() : "";
      console.log("infoWord", infoWord);
      try {
        const keys = infoWord.split(".");
        const lastKey: string = keys[keys.length - 1];
        let lastKeyIndex: number | undefined;

        let lineOfPath: number | null = 0;

        const foundItem = yamlKeysDiagnostic.find((item) => item.path === infoWord);
        console.log("foundItem", foundItem);
        if (foundItem) {
          lineOfPath = foundItem.lineOfPath - 1;
        }
        console.log("lineOfPath", lineOfPath);
        if (lineOfPath && lineOfPath !== 0) {
          const lineText = document.lineAt(lineOfPath).text;
          console.log("lineText", lineText);
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
