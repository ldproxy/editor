import { commands, window, ExtensionContext } from "vscode";
import { AutoCreatePanel } from "./panels/AutoCreatePanel";
import { SourcesProvider } from "./trees/SourcesProvider";
import { EntitiesProvider } from "./trees/EntitiesProvider";
import { hover } from "./LanguageFeatures/Hovering";
import * as vscode from "vscode";
import { updateDiagnostics } from "./LanguageFeatures/Diagnostics";

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

  const hoverFunction = hover();

  const collection = vscode.languages.createDiagnosticCollection("test");
  if (vscode.window.activeTextEditor) {
    updateDiagnostics(vscode.window.activeTextEditor.document, collection);
  }
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor) {
        updateDiagnostics(editor.document, collection);
      }
    })
  );

  // Add command to the extension context
  context.subscriptions.push(showAutoCreate, storeTree, entityTree);
}
