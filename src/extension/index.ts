import {
  commands,
  ExtensionContext,
  TextDocument,
  window,
  languages,
  workspace,
  Uri,
  env,
} from "vscode";

import { registerShowAutoCreate } from "./panels/AutoCreatePanel";
import { initDiagnostics, updateDiagnostics } from "./LanguageFeatures/Diagnostics";
import {
  registerCompletions,
  setKeys,
  getSchemaMapCompletions,
} from "./LanguageFeatures/Completions";
import {
  getKeys as getValueKeys,
  getSchemaMapCompletions as getValueCompletions,
  registerValueCompletions,
} from "./LanguageFeatures/ValueCompletions";
import {
  getKeys as getHoverKeys,
  getSchemaMapHovering,
  registerHover,
} from "./LanguageFeatures/Hovering";
import { registerCodeActions } from "./LanguageFeatures/CodeActions";
import { DEV } from "./utilities/constants";
import { initSchemas } from "./utilities/schemas";
import { parseYaml, hashText } from "./utilities/yaml";
import { Registration, register } from "./utilities/registration";
import { registeTreeViews } from "./trees";

let initialized = false;

export function activate(context: ExtensionContext) {
  if (initialized) {
    return;
  }

  if (DEV) {
    console.log(
      "ACTIVATE",
      context.extension.id,
      context.extension.isActive,
      context.extensionMode
    );
  }

  initialized = true;

  initSchemas();
  initDiagnostics();

  register(
    context,
    registeTreeViews,
    registerShowAutoCreate,
    registerHover,
    registerCompletions,
    registerValueCompletions,
    registerDocHandlers,
    registerCodeActions
  );

  onDocument(window.activeTextEditor?.document);
}

export function deactivate() {}

const registerDocHandlers: Registration = () => {
  return [
    window.onDidChangeActiveTextEditor((editor) => {
      const document = window.activeTextEditor?.document;
      if (document && editor) {
        onDocument(document);
      }
    }),
    workspace.onDidChangeTextDocument((event) => {
      const document = window.activeTextEditor?.document;
      if (document) {
        const activeEditor = window.activeTextEditor;
        if (activeEditor && event.document === activeEditor.document) {
          onDocument(document);
        }
      }
    }),
  ];
};

const collection = languages.createDiagnosticCollection("test");

function onDocument(document?: TextDocument) {
  if (document) {
    const text = document.getText();
    const uri = document.uri.toString();
    const hash = hashText(text);

    if (hash && hash !== "") {
      const allYamlKeys = parseYaml(text);
      getSchemaMapCompletions(uri, hash);
      getValueCompletions(uri, hash);
      getSchemaMapHovering(uri, hash);
      getHoverKeys(allYamlKeys);
      getValueKeys(allYamlKeys);
      setKeys(allYamlKeys);
      updateDiagnostics(allYamlKeys, document, collection);
    }
  }
}
