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
import { Registration, register, DocEvent } from "./utilities/registration";
import { registeTreeViews } from "./trees";
import { TransportCreator } from "@xtracfg/core";

let initialized = false;

export function activate(context: ExtensionContext, transport: TransportCreator) {
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

  initSchemas(transport);

  register(
    context,
    transport,
    registeTreeViews,
    registerShowAutoCreate,
    registerHover,
    registerCompletions,
    registerValueCompletions,
    registerDiagnostics,
    registerDocHandlers,
    registerCodeActions
  );

  onDocUpdate(DocEvent.OPEN, window.activeTextEditor?.document);
}

export function deactivate() {}

const registerDocHandlers: Registration = (context, transport) => {
  return [
    window.onDidChangeActiveTextEditor((editor) => {
      const document = window.activeTextEditor?.document;
      if (document && editor) {
        onDocUpdate(DocEvent.OPEN, document);
      }
    }),
    workspace.onDidChangeTextDocument((event) => {
      const document = window.activeTextEditor?.document;
      if (document) {
        const activeEditor = window.activeTextEditor;
        if (activeEditor && event.document === activeEditor.document) {
          onDocUpdate(DocEvent.CHANGE, document);
        }
      }
    }),
    workspace.onDidSaveTextDocument((document) => {
      if (document) {
        onDocUpdate(DocEvent.SAVE, document);
      }
    }),
  ];
};

export const onDocUpdate = function (event: DocEvent, document?: TextDocument) {
  if (document) {
    const text = document.getText();
    const uri = document.uri.toString();
    const hash = hashText(text);

    if (hash && hash !== "") {
      const allYamlKeys = parseYaml(text);

      updateHover(event, document, uri, hash, allYamlKeys);
      updateCompletions(event, document, uri, hash, allYamlKeys);
      updateValueCompletions(event, document, uri, hash, allYamlKeys);
      updateDiagnostics(event, document, uri, hash, allYamlKeys);
    }
  }
};
