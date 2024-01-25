import { ExtensionContext, TextDocument, window, workspace } from "vscode";

import { registerShowAutoCreate } from "./panels/AutoCreatePanel";
import { registerDiagnostics, updateDiagnostics } from "./language/Diagnostics";
import { registerCompletions, updateCompletions } from "./language/Completions";
import { registerValueCompletions, updateValueCompletions } from "./language/ValueCompletions";
import { registerHover, updateHover } from "./language/Hovering";
import { registerCodeActions } from "./language/CodeActions";
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

  register(
    context,
    registeTreeViews,
    registerShowAutoCreate,
    registerHover,
    registerCompletions,
    registerValueCompletions,
    registerDiagnostics,
    registerDocHandlers,
    registerCodeActions
  );

  onDocUpdate(window.activeTextEditor?.document);
}

export function deactivate() {}

const registerDocHandlers: Registration = () => {
  return [
    window.onDidChangeActiveTextEditor((editor) => {
      const document = window.activeTextEditor?.document;
      if (document && editor) {
        onDocUpdate(document);
      }
    }),
    workspace.onDidChangeTextDocument((event) => {
      const document = window.activeTextEditor?.document;
      if (document) {
        const activeEditor = window.activeTextEditor;
        if (activeEditor && event.document === activeEditor.document) {
          onDocUpdate(document);
        }
      }
    }),
  ];
};

const onDocUpdate = function (document?: TextDocument) {
  if (document) {
    const text = document.getText();
    const uri = document.uri.toString();
    const hash = hashText(text);

    if (hash && hash !== "") {
      const allYamlKeys = parseYaml(text);

      updateHover(document, uri, hash, allYamlKeys);
      updateCompletions(document, uri, hash, allYamlKeys);
      updateValueCompletions(document, uri, hash, allYamlKeys);
      updateDiagnostics(document, uri, hash, allYamlKeys);
    }
  }
};
