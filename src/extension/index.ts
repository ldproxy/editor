import { commands, ExtensionContext } from "vscode";
import { AutoCreatePanel } from "./panels/AutoCreatePanel";
import * as vscode from "vscode";
import { initDiagnostics } from "./LanguageFeatures/Diagnostics";
import { updateDiagnostics } from "./LanguageFeatures/Diagnostics";
import { registerCompletions, setKeys } from "./LanguageFeatures/Completions";
import { parseYaml } from "./utilities/yaml";
import {
  getKeys as getHoverKeys,
  getSchemaMapHovering,
  registerHover,
} from "./LanguageFeatures/Hovering";
import { getKeys as getValueKeys } from "./LanguageFeatures/ValueCompletions";
import { getSchemaMapCompletions } from "./LanguageFeatures/Completions";
import { getSchemaMapCompletions as getValueCompletions } from "./LanguageFeatures/ValueCompletions";
import { registerValueCompletions } from "./LanguageFeatures/ValueCompletions";
import { initSchemas } from "./utilities/schemas";
import { DEV } from "./utilities/constants";
import { md5 } from "js-md5";
import { hash } from "./utilities/yaml";
// import { Emojinfo } from "./LanguageFeatures/CodeActions";

export let allYamlKeys: {
  path: string;
  index: number;
  lineOfPath: number;
  startOfArray?: number;
  arrayIndex?: number;
}[] = [];

function updateYamlKeysHover(
  document?: vscode.TextDocument,
  hashString?: string,
  collection?: any,
  context?: any
) {
  if (document) {
    if (vscode.window.activeTextEditor && hashString && hashString !== "") {
      allYamlKeys = parseYaml(document.getText());
      getSchemaMapCompletions(document.uri.toString(), hashString);
      getValueCompletions(document.uri.toString(), hashString);
      getSchemaMapHovering(document.uri.toString(), hashString);
      getHoverKeys(allYamlKeys);
      getValueKeys(allYamlKeys);
      setKeys(allYamlKeys);
      updateDiagnostics(allYamlKeys, vscode.window.activeTextEditor.document, collection);

      registerCompletions().forEach((provider) => context.subscriptions.push(provider));
      registerValueCompletions().forEach((provider) => context.subscriptions.push(provider));
    }
  }
}

let initialized = false;
let i = 0;
const collection = vscode.languages.createDiagnosticCollection("test");

export function activate(context: ExtensionContext) {
  if (initialized) {
    return;
  } else {
    initialized = true;
  }

  const document = vscode.window.activeTextEditor?.document;

  //if (DEV) {
  console.log("ACTIVATE", context.extension.id, context.extension.isActive, i++);
  //}
  const showAutoCreate = commands.registerCommand("ldproxy-editor.showAutoCreate", () => {
    AutoCreatePanel.render(context.extensionUri);
  });

  /*let storeTree = window.registerTreeDataProvider(
    "ldproxy-editor.storeTree",
    new SourcesProvider()
  );

  let entityTree = window.registerTreeDataProvider(
    "ldproxy-editor.entityTree",
    new EntitiesProvider()
  );*/

  let hashString = hash(document);

  registerHover().forEach((provider) => context.subscriptions.push(provider));
  initSchemas();
  initDiagnostics();

  updateYamlKeysHover(document, hashString, collection, context);

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((event) => {
      const document = vscode.window.activeTextEditor?.document;
      if (document) {
        const text = document.getText();
        const newHash = md5(text);
        if (newHash !== hashString) {
          hashString = newHash;
          if (DEV) {
            console.log("HashChangedDoc:", hashString);
          }
          const activeEditor = vscode.window.activeTextEditor;
          if (activeEditor && event.document === activeEditor.document) {
            updateYamlKeysHover(document, hashString, collection, context);
          }
        }
      }
    })
  );

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      const document = vscode.window.activeTextEditor?.document;
      if (document) {
        const text = document.getText();
        const newHash = md5(text);
        if (newHash !== hashString && editor) {
          hashString = newHash;
          if (DEV) {
            console.log("HashChangedEditor:", hashString);
          }
          updateYamlKeysHover(document, hashString, collection, context);
        }
      }
    })
  );

  // Add command to the extension context
  context.subscriptions.push(showAutoCreate /*, storeTree, entityTree*/);

  /*
  First tests for code actions:f

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

/* contribution points for tree views
    "views": {
      "explorer": [
        {
          "id": "ldproxy-editor.storeTree",
          "name": "Sources"
        },
        {
          "id": "ldproxy-editor.entityTree",
          "name": "Entities"
        }
      ]
    },
    "menus": {
      "view/title": [
        {
          "when": "view == ldproxy-editor.storeTree",
          "command": "ldproxy-editor.showAutoCreate",
          "group": "navigation"
        }
      ],
      "view/item/context": [
        {
          "when": "view == ldproxy-editor.storeTree && viewItem == folder",
          "command": "ldproxy-editor.showAutoCreate",
          "group": "inline"
        }
      ]
    }
 */
