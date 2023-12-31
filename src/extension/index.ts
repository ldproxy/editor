import { commands, window, ExtensionContext } from "vscode";
import { AutoCreatePanel } from "./panels/AutoCreatePanel";
import { SourcesProvider } from "./trees/SourcesProvider";
import { EntitiesProvider } from "./trees/EntitiesProvider";
import { hover } from "./LanguageFeatures/Hovering";
import * as vscode from "vscode";
import { initDiagnostics } from "./LanguageFeatures/Diagnostics";
import { updateDiagnostics } from "./LanguageFeatures/Diagnostics";
import { provider1, provider2, provider3, getKeys } from "./LanguageFeatures/Completions";
import { getAllYamlPaths } from "./utilitiesLanguageFeatures/getYamlKeys";
import { getKeys as getHoverKeys } from "./LanguageFeatures/Hovering";
import { getKeys as getValueKeys } from "./LanguageFeatures/ValueCompletions";
import { Parser } from "yaml";
import { getSchemaMapCompletions } from "./LanguageFeatures/Completions";
import { getSchemaMapHovering } from "./LanguageFeatures/Hovering";
import { getSchemaMapCompletions as getValueCompletions } from "./LanguageFeatures/ValueCompletions";
import { extractConditions } from "./utilitiesLanguageFeatures/defineDefs";
import { provider4 } from "./LanguageFeatures/ValueCompletions";
import { initSchemas } from "./utilitiesLanguageFeatures/schemas";
// import { Emojinfo } from "./LanguageFeatures/CodeActions";

export let allYamlKeys: {
  path: string;
  index: number;
  lineOfPath: number;
  startOfArray?: number;
  arrayIndex?: number;
}[] = [];

export function activate(context: ExtensionContext) {
  console.log("ACTIVATE", context.extension.id, context.extension.isActive);
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

  initSchemas();
  initDiagnostics();
  hover();
  const collection = vscode.languages.createDiagnosticCollection("test");

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
        getValueKeys(allYamlKeys);
        getKeys(allYamlKeys);
        updateDiagnostics(allYamlKeys, vscode.window.activeTextEditor.document, collection);
        extractConditions();

        context.subscriptions.push(provider1, provider2, provider3, provider4);
      }
    }
  }

  updateYamlKeysHover();
  getSchemaMapCompletions();
  getValueCompletions();
  getSchemaMapHovering();

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((event) => {
      const activeEditor = vscode.window.activeTextEditor;
      if (activeEditor && event.document === activeEditor.document) {
        updateYamlKeysHover();
      }
    })
  );

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor) {
        updateYamlKeysHover();
        getSchemaMapCompletions();
        getValueCompletions();
        getSchemaMapHovering();
      }
    })
  );

  // Add command to the extension context
  context.subscriptions.push(showAutoCreate, storeTree, entityTree);

  /*
  First tests for code actions:

  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider("yaml", new Emojinfo(), {
      providedCodeActionKinds: Emojinfo.providedCodeActionKinds,
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("code-actions-sample.command", () =>
      vscode.env.openExternal(
        vscode.Uri.parse("https://unicode.org/emoji/charts-12.0/full-emoji-list.html")
      )
    )
  );
  */
}
