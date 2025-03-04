import transport from "@xtracfg/transport-websocket";
import {
  activate as sharedActivate,
  deactivate as sharedDeactivate,
} from "../shared/extension/index";
import { ExtensionContext } from "vscode";

export function activate(context: ExtensionContext) {
  sharedActivate(context, transport, { location: getLocation() });
}

export function deactivate() {
  sharedDeactivate();
}

// for some reason, the location is not set in the web worker as it should be (see https://developer.mozilla.org/en-US/docs/Web/API/WorkerLocation)
// so we need to retrieve it manually so that the xtracfg websocket client can connect to the correct location
const getLocation = () => {
  const vscodeFileRoot = (self as any)._VSCODE_FILE_ROOT;

  if (vscodeFileRoot) {
    const url = new URL(vscodeFileRoot);
    const location = {
      protocol: url.protocol,
      host: url.host,
    };

    return location;
  }

  return self.location;
};
