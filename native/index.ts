import transport from "@xtracfg/transport-websocket";
import {
  activate as sharedActivate,
  deactivate as sharedDeactivate,
} from "../shared/extension/index";
import { ExtensionContext } from "vscode";

export function activate(context: ExtensionContext) {
  sharedActivate(context, transport);
}

export function deactivate() {
  sharedDeactivate();
}
