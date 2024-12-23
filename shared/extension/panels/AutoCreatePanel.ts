import {
  Disposable,
  Webview,
  WebviewPanel,
  window,
  Uri,
  ViewColumn,
  commands,
  ExtensionContext,
} from "vscode";
import { getUri } from "../utilities/webview";
import { getNonce } from "../utilities/webview";
import { listGpkgFilesInDirectory, uploadedGpkg, setCancel } from "../utilities/gpkg";
import * as vscode from "vscode";
import { connect, TransportCreator, Xtracfg } from "@xtracfg/core";
import { getWorkspacePath, getWorkspaceUri } from "../utilities/paths";
import { Registration } from "../utilities/registration";
import { DEV } from "../utilities/constants";
import { type Transport } from "..";

const workspaceFolders = vscode.workspace.workspaceFolders;
if (!workspaceFolders) {
  throw new Error("No workspace folder...");
}
const watcherOnDidDelete = vscode.workspace.createFileSystemWatcher(
  new vscode.RelativePattern(workspaceFolders[0], "resources/features/**")
);

const watcherOnDidCreate = vscode.workspace.createFileSystemWatcher(
  new vscode.RelativePattern(workspaceFolders[0], "resources/features/**")
);

const workspaceUri = getWorkspaceUri();
let xtracfg: Xtracfg;

export const registerShowAutoCreate: Registration = (
  context: ExtensionContext,
  { transport, additionalTransportOptions }: Transport
): Disposable[] => {
  xtracfg = connect(transport, { specific: additionalTransportOptions, debug: DEV });

  return [
    commands.registerCommand("ldproxy-editor.showAutoCreate", () => {
      AutoCreatePanel.render(context.extensionUri);
    }),
  ];
};

/**
 * This class manages the state and behavior of HelloWorld webview panels.
 *
 * It contains all the data and methods for:
 *
 * - Creating and rendering HelloWorld webview panels
 * - Properly cleaning up and disposing of webview resources when the panel is closed
 * - Setting the HTML (and by proxy CSS/JavaScript) content of the webview panel
 * - Setting message listeners so data can be passed between the webview and extension
 */
export class AutoCreatePanel {
  public static currentPanel: AutoCreatePanel | undefined;
  private readonly _panel: WebviewPanel;
  private readonly _extensionUri: Uri;
  private _disposables: Disposable[] = [];

  /**
   * The HelloWorldPanel class private constructor (called only from the render method).
   *
   * @param panel A reference to the webview panel
   * @param extensionUri The URI of the directory containing the extension
   */
  private constructor(panel: WebviewPanel, extensionUri: Uri) {
    this._panel = panel;
    this._extensionUri = extensionUri;

    // Set an event listener to listen for when the panel is disposed (i.e. when the user closes
    // the panel or when the panel is closed programmatically)
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // Set the HTML content for the webview panel
    this._panel.webview.html = this._getWebviewContent(this._panel.webview, extensionUri);

    // Set an event listener to listen for messages passed from the webview context
    this._setWebviewMessageListener(this._panel.webview);

    watcherOnDidCreate.onDidCreate(async (e) => {
      this._panel.webview.postMessage({
        command: "setGeopackages",
        existingGeopackages: await listGpkgFilesInDirectory(),
      });
    });
    this._disposables.push(watcherOnDidCreate);

    watcherOnDidDelete.onDidDelete(async (e) => {
      this._panel.webview.postMessage({
        command: "setGeopackages",
        existingGeopackages: await listGpkgFilesInDirectory(),
      });
      this._panel.webview.postMessage({
        command: "selectedGeoPackageDeleted",
        deletedGpkg: e.fsPath,
      });
    });
    this._disposables.push(watcherOnDidDelete);

    xtracfg.listen(
      async (response) => {
        await this._panel.webview.postMessage({
          command: "xtracfg",
          response,
        });
      },
      async (error) => {
        await this._panel.webview.postMessage({
          command: "xtracfg",
          error,
        });
      }
    );
  }

  /**
   * Renders the current webview panel if it exists otherwise a new webview panel
   * will be created and displayed.
   *
   * @param extensionUri The URI of the directory containing the extension.
   */
  public static render(extensionUri: Uri) {
    if (AutoCreatePanel.currentPanel) {
      // If the webview panel already exists reveal it
      AutoCreatePanel.currentPanel._panel.reveal(ViewColumn.One);
    } else {
      // If a webview panel does not already exist create and show a new one
      const panel = window.createWebviewPanel(
        // Panel view type
        "ldproxy-editor.showAutoCreate",
        // Panel title
        "Create Configuration",
        // The editor column the panel should be displayed in
        ViewColumn.One,
        // Extra panel configurations
        {
          // Enable JavaScript in the webview
          enableScripts: true,
          // Restrict the webview to only load resources from the `out` and `webview-ui/build` directories
          localResourceRoots: [
            Uri.joinPath(extensionUri, "out"),
            Uri.joinPath(extensionUri, "./webview-ui/build"),
          ],
        }
      );
      AutoCreatePanel.currentPanel = new AutoCreatePanel(panel, extensionUri);
    }
  }

  /**
   * Cleans up and disposes of webview resources when the webview panel is closed.
   */
  public dispose() {
    AutoCreatePanel.currentPanel = undefined;

    xtracfg.disconnect();

    // Dispose of the current webview panel
    this._panel.dispose();

    // Dispose of all disposables (i.e. commands) for the current webview panel
    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }

  public reload() {
    this._panel.webview.html = this._getWebviewContent(this._panel.webview, this._extensionUri);
  }

  /**
   * Defines and returns the HTML that should be rendered within the webview panel.
   *
   * @remarks This is also the place where references to the React webview build files
   * are created and inserted into the webview HTML.
   *
   * @param webview A reference to the extension webview
   * @param extensionUri The URI of the directory containing the extension
   * @returns A template string literal containing the HTML that should be
   * rendered within the webview panel
   */
  private _getWebviewContent(webview: Webview, extensionUri: Uri) {
    // The CSS file from the React build output
    const stylesUri = getUri(webview, extensionUri, [
      ".",
      "webview-ui",
      "build",
      "assets",
      "index.css",
    ]);
    // The JS file from the React build output
    const scriptUri = getUri(webview, extensionUri, [
      ".",
      "webview-ui",
      "build",
      "assets",
      "index.js",
    ]);

    const nonce = getNonce();

    // Tip: Install the es6-string-html VS Code extension to enable code highlighting below
    return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}'; connect-src 'self' ws:;">
          <link rel="stylesheet" type="text/css" href="${stylesUri}">
          <title>Hello World</title>    
        </head>
        <body>
          <div id="root" data-create-values="false"></div>
          <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
        </body>
      </html>
    `;
  }

  /**
   * Sets up an event listener to listen for messages passed from the webview context and
   * executes code based on the message that is recieved.
   *
   * @param webview A reference to the extension webview
   * @param context A reference to the extension context
   */

  private _setWebviewMessageListener(webview: Webview) {
    webview.onDidReceiveMessage(
      async (message: any) => {
        const command = message.command;
        const text = message.text;

        switch (command) {
          case "hello":
            // Code that should run in response to the hello message command
            window.showInformationMessage(text);
            break;
          case "error":
            window.showErrorMessage(text);
            break;
          case "onLoad":
            this._panel.webview.postMessage({
              command: "setWorkspace",
              workspaceRoot: getWorkspacePath(),
            });
            break;
          case "setExistingGpkg":
            this._panel.webview.postMessage({
              command: "setGeopackages",
              existingGeopackages: await listGpkgFilesInDirectory(),
            });
            break;
          case "closeWebview":
            this.dispose();
            break;
          case "reloadWebview":
            this.reload();
            break;
          case "success":
            if (workspaceUri) {
              const fileUri = workspaceUri.with({ path: text });
              await vscode.commands.executeCommand("vscode.open", fileUri, { preview: false });
            }
            break;
          case "uploadGpkg":
            this._panel.webview.postMessage({
              command: "uploadedGpkg",
              uploadedGpkg: await uploadedGpkg(text[0], text[1]),
            });
            break;
          case "cancelSavingGpkg":
            setCancel();
            break;
          case "xtracfg":
            if (message.request) {
              xtracfg.send(JSON.parse(message.request));
            }
            break;
          case "geoPackageWasUploaded":
            window.showInformationMessage(text);
            break;
          // Add more switch case statements here as more webview message commands
          // are created within the webview context (i.e. inside media/main.js)
        }
      },
      undefined,
      this._disposables
    );
  }
}
