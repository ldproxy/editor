import * as vscode from "vscode";
import { newXtracfg } from "../utilities/xtracfg";
import { getRelativeFilePath, getWorkspacePath } from "../utilities/paths";
import { DEV } from "../utilities/constants";

interface YamlKeysDiagnostic {
  path: string;
  index: number;
  lineOfPath: number;
  arrayIndex?: number;
}

const xtracfg = newXtracfg();

const diagnosticsResults: {
  [key: string]: {
    result: Promise<string[]>;
    resolve: (result: string[]) => void;
    reject: (reason: string) => void;
    pending: boolean;
  };
} = {};

export const initDiagnostics = () => {
  xtracfg.listen(
    (response) => {
      if (DEV) {
        console.log("RESP", response);
      }
      if (response.results && response.details && response.details.path) {
        if (Object.hasOwn(diagnosticsResults, response.details.path)) {
          const results = response.results
            .filter((result) => result.status === "INFO")
            .map((result) => {
              const match = result.message;

              return match ? match : "";
            });
          if (DEV) {
            console.log("DIAGNOSTICS", results);
          }
          diagnosticsResults[response.details.path].resolve(results);
          diagnosticsResults[response.details.path].pending = false;
        }
      }
    },
    (error) => {
      console.error("ERR", error);
    }
  );
};

const requestDiagnostics = async (path: string): Promise<string[]> => {
  if (!path) {
    return Promise.resolve([]);
  }

  if (diagnosticsResults[path] && diagnosticsResults[path].pending) {
    return diagnosticsResults[path].result;
  }

  const results: any = {};
  results.result = new Promise((resolve, reject) => {
    results.resolve = resolve;
    results.reject = reject;
  });

  diagnosticsResults[path] = results;

  xtracfg.send({
    command: "check",
    subcommand: "entities",
    source: getWorkspacePath(),
    path: path,
    verbose: true,
    debug: true,
  });

  return diagnosticsResults[path].result;
};

export async function updateDiagnostics(
  yamlKeysDiagnostic: YamlKeysDiagnostic[],
  document: vscode.TextDocument,
  collection: vscode.DiagnosticCollection
): Promise<void> {
  if (DEV) {
    console.log("yamlKeysDiagnosticUpdateDiagnostics", yamlKeysDiagnostic);
  }
  if (document.uri.path.includes(".yml")) {
    const diagnostics: vscode.Diagnostic[] = [];
    const path = getRelativeFilePath(document.uri);

    if (!path) {
      return;
    }

    const results = await requestDiagnostics(path);

    results.forEach((info) => {
      const infoText = info.match(/\$.(.*):/);
      const infoWord = infoText ? infoText[1].trim() : "";
      const infoWordWithoutIndex = infoWord.replace(/\[\d+\]/g, "");
      if (DEV) {
        console.log("infoWord", infoWord);
      }
      try {
        const keys = infoWord.split(".");
        const lastKey: string = keys[keys.length - 1];
        const match = infoWord.match(/\[(\d+)\]/);
        let index: number | null = null;
        if (match && match[1]) {
          index = parseInt(match[1], 10);
        }
        let lastKeyIndex: number | undefined;

        let lineOfPath: number | null = 0;
        if (DEV) {
          console.log("indexUpdateDiagnostics", index);
        }
        if (index !== null) {
          const foundItem = yamlKeysDiagnostic.find(
            (item) => item.path === infoWordWithoutIndex && item.arrayIndex === index
          );
          if (DEV) {
            console.log("foundItem", foundItem);
          }
          if (foundItem) {
            lineOfPath = foundItem.lineOfPath - 1;
          }
        } else {
          const foundItem = yamlKeysDiagnostic.find((item) => item.path === infoWord);
          if (DEV) {
            console.log("foundItem", foundItem);
          }
          if (foundItem) {
            lineOfPath = foundItem.lineOfPath - 1;
          }
        }
        if (DEV) {
          console.log("lineOfPath", lineOfPath);
        }
        if (lineOfPath && lineOfPath !== 0) {
          const lineText = document.lineAt(lineOfPath).text;
          if (DEV) {
            console.log("lineText", lineText);
          }
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
              vscode.DiagnosticSeverity.Warning
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
