import { commands, window, ExtensionContext } from "vscode";
import * as yaml from "js-yaml";
import { AutoCreatePanel } from "./panels/AutoCreatePanel";
import { SourcesProvider } from "./trees/SourcesProvider";
import { EntitiesProvider } from "./trees/EntitiesProvider";
import { hover } from "./LanguageFeatures/Hovering";
import * as vscode from "vscode";
import { getDiagnostics } from "./LanguageFeatures/Diagnostics";
import { updateDiagnostics } from "./LanguageFeatures/Diagnostics";
import { provider1, provider2, provider3, getKeys } from "./LanguageFeatures/Completions";
import { getAllYamlPaths } from "./utilitiesLanguageFeatures/GetYamlKeys";
import { getKeys as getHoverKeys } from "./LanguageFeatures/Hovering";
import { Parser } from "yaml";

export let allYamlKeys: {
  path: string;
  index: number;
  lineOfPath: number;
  arrayIndex?: number;
}[] = [];

export function activate(context: ExtensionContext) {
  const showAutoCreate = commands.registerCommand("ldproxy-editor.showAutoCreate", () => {
    AutoCreatePanel.render(context.extensionUri);
  });

  let storeTree = window.registerTreeDataProvider(
    "ldproxy-editor.storeTree",
    new SourcesProvider()
  );

  let entityTree = window.registerTreeDataProvider(
    "ldproxy-editor.entityTree",
    new EntitiesProvider()
  );
  hover();

  function updateYamlKeysHover() {
    const document = vscode.window.activeTextEditor?.document;
    if (document) {
      const yamlObject: any[] = [];

      for (const token of new Parser().parse(document.getText())) {
        console.log("documento", document?.getText());
        console.log("token", token);
        yamlObject.push(token);
      }
      console.log("yamlObject", yamlObject[0].value.items);

      if (vscode.window.activeTextEditor) {
        allYamlKeys = [];
        allYamlKeys = getAllYamlPaths(document.getText(), yamlObject[0].value.items, "");
        console.log("aktuell", allYamlKeys);
        getHoverKeys(allYamlKeys);
        getKeys(allYamlKeys);
        //  const getDiagnostic = getDiagnostics();

        context.subscriptions.push(provider1, provider2, provider3);
      }
    }
  }

  updateYamlKeysHover();

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((event) => {
      const activeEditor = vscode.window.activeTextEditor;
      if (activeEditor && event.document === activeEditor.document) {
        updateYamlKeysHover();
      }
    })
  );

  const collection = vscode.languages.createDiagnosticCollection("test");
  if (vscode.window.activeTextEditor) {
    updateDiagnostics(allYamlKeys, vscode.window.activeTextEditor.document, collection);
  }
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor) {
        updateDiagnostics(allYamlKeys, editor.document, collection);
      }
    })
  );

  // Add command to the extension context
  context.subscriptions.push(showAutoCreate, storeTree, entityTree);
}
