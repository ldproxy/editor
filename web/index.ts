import transport from "@xtracfg/transport-websocket";
import {
  activate as sharedActivate,
  deactivate as sharedDeactivate,
} from "../shared/extension/index";
import { ExtensionContext, workspace } from "vscode";

export function activate(context: ExtensionContext) {
  sharedActivate(context, transport, { url: getUrl() });
}

export function deactivate() {
  sharedDeactivate();
}

// for some reason, the location is not set in the web worker as it should be (see https://developer.mozilla.org/en-US/docs/Web/API/WorkerLocation)
// so we need to retrieve it manually so that the xtracfg websocket client can connect to the correct location
const getLocation = () => {
  // set from environment variable BASE_URL
  const baseUrl = workspace.getConfiguration("ldproxy-editor").get<string>("baseUrl");

  if (baseUrl) {
    const url = new URL(baseUrl);
    const location = {
      protocol: url.protocol,
      host: url.host,
      pathname: url.pathname,
    };

    return location;
  }

  // default from VSCode file root, ignore pathname (use BASE_URL if needed)
  const vscodeFileRoot = (self as any)._VSCODE_FILE_ROOT;

  if (vscodeFileRoot) {
    const url = new URL(vscodeFileRoot);
    const location = {
      protocol: url.protocol,
      host: url.host,
      pathname: "", // url.pathname,
    };

    return location;
  }

  // fallback to self location
  return self.location;
};

const getUrl = () => {
  if (process.env.NODE_ENV === "development") {
    return "ws://localhost:8081/sock";
  }

  const location = getLocation();
  const protocol = location.protocol === "https:" ? "wss" : "ws";
  const path = location.pathname.endsWith("/")
    ? location.pathname.substring(0, location.pathname.length - 1)
    : location.pathname;

  return `${protocol}://${location.host}${path}/proxy/8081/`;
};
