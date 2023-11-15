import * as vscode from "vscode";
import { results } from "./DiagnosticResponse";
import * as path from "path";
import * as yaml from "js-yaml";

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
      console.log("infoWord: " + infoWord);
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
            console.log("lastKey: " + lastKey);
            console.log("lastKeyIndex: " + lastKeyIndex);

            console.log(`Value ${lastKey} found at position: ${JSON.stringify(currentObject)}`);

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
