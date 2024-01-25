import { window } from "vscode";
import { Registration } from "../utilities/registration";
import { SourcesProvider } from "./SourcesProvider";
import { EntitiesProvider } from "./EntitiesProvider";

export const registeTreeViews: Registration = () => {
  return [
    //window.registerTreeDataProvider("ldproxy-editor.storeTree", new SourcesProvider()),
    //window.registerTreeDataProvider("ldproxy-editor.entityTree", new EntitiesProvider()),
  ];
};

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
