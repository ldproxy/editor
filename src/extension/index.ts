import { commands, window, ExtensionContext } from "vscode";
import { AutoCreatePanel } from "./panels/AutoCreatePanel";
import { SourcesProvider } from "./trees/SourcesProvider";
import { EntitiesProvider } from "./trees/EntitiesProvider";

export function activate(context: ExtensionContext) {
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

  // Add command to the extension context
  context.subscriptions.push(showAutoCreate /*, storeTree, entityTree*/);
}

/*
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
