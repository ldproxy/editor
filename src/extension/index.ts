import { commands, window, ExtensionContext } from "vscode";
import { AutoCreatePanel } from "./panels/AutoCreatePanel";
import { SourcesProvider } from "./trees/SourcesProvider";
import { EntitiesProvider } from "./trees/EntitiesProvider";
import { hover } from "./LanguageFeatures/Hovering";
import * as vscode from "vscode";
import { initDiagnostics } from "./LanguageFeatures/Diagnostics";
import { updateDiagnostics } from "./LanguageFeatures/Diagnostics";
import {
  provider1,
  provider2,
  provider3,
  provider4,
  getKeys,
} from "./LanguageFeatures/Completions";
import { getAllYamlPaths } from "./utilitiesLanguageFeatures/getYamlKeys";
import { getKeys as getHoverKeys } from "./LanguageFeatures/Hovering";
import { getKeys as getValueKeys } from "./LanguageFeatures/ValueCompletions";
import { Parser } from "yaml";
import { getSchemaMapCompletions } from "./LanguageFeatures/Completions";
import { getSchemaMapHovering } from "./LanguageFeatures/Hovering";
import { getSchemaMapCompletions as getValueCompletions } from "./LanguageFeatures/ValueCompletions";
import { extractConditions } from "./utilitiesLanguageFeatures/defineDefs";
import { provider4 as provider5 } from "./LanguageFeatures/ValueCompletions";
import { DefinitionsMap, initSchemas } from "./utilitiesLanguageFeatures/schemas";
import { DEV } from "./utilities/constants";
import { md5 } from "js-md5";

// import { Emojinfo } from "./LanguageFeatures/CodeActions";
import { getDefinitionsMap } from "./utilitiesLanguageFeatures/getDefinitionsMap";
import { services } from "./utilitiesLanguageFeatures/services";

export let allYamlKeys: {
  path: string;
  index: number;
  lineOfPath: number;
  startOfArray?: number;
  arrayIndex?: number;
}[] = [];

function hash(document?: vscode.TextDocument): string {
  if (document) {
    const text = document.getText();
    if (text !== "") {
      const hashString = md5(text);
      if (DEV) {
        console.log("Hash:", hashString, text);
      }

      return hashString;
    }
  }
  return "";
}

function updateYamlKeysHover(
  document?: vscode.TextDocument,
  hashString?: string,
  collection?: any,
  context?: any
) {
  if (document) {
    const yamlObject: any[] = [];

    for (const token of new Parser().parse(document.getText())) {
      if (DEV) {
        console.log("documento", document?.getText());
        console.log("token", token);
      }
      yamlObject.push(token);
    }

    if (vscode.window.activeTextEditor && hashString && hashString !== "") {
      if (DEV) {
        console.log("yamlObject", yamlObject[0].value.items);
      }

      allYamlKeys = [];
      allYamlKeys = getAllYamlPaths(document.getText(), yamlObject[0].value.items, "");
      if (DEV) {
        console.log("yamlKeysIndex", allYamlKeys);
      }
      getSchemaMapCompletions(document.uri.toString(), hashString);
      getValueCompletions(document.uri.toString(), hashString);
      getSchemaMapHovering(document.uri.toString(), hashString);
      getHoverKeys(allYamlKeys);
      getValueKeys(allYamlKeys);
      getKeys(allYamlKeys);
      updateDiagnostics(allYamlKeys, vscode.window.activeTextEditor.document, collection);
      extractConditions();

      context.subscriptions.push(provider1, provider2, provider3, provider4, provider5);
    }
  }
}

let initialized = false;
const collection = vscode.languages.createDiagnosticCollection("test");

export function activate(context: ExtensionContext) {
  async function findMyRef(property: string, value?: string) {
    let myRef: [{ ref: string; finalPath: string }] = [{ ref: "", finalPath: "" }];
    const conditions = [
      { condition: { buildingBlock: { const: "COLLECTIONS" } }, ref: "CollectionsConfiguration" },
      { condition: { featureProvider: { const: "FEATURE" } }, ref: "FeatureColelction" },
    ];
    const schema = services;
    console.log("findMyRefconditions", conditions);
    console.log("findMyRefschema", schema);
    if (!schema) {
      return [];
    }

    if (property && value) {
      console.log("findMyRefproperty", property);
      // case: property is in conditions (value of property is relevant choice of ref)
      conditions.forEach((condition: { [key: string]: any }) => {
        console.log("condition2", condition);
        const conditionKeys = Object.keys(condition.condition);
        console.log("conditionKeys2", conditionKeys);
        if (conditionKeys.length === 1) {
          conditionKeys.forEach((key: string) => {
            console.log("blakey", key);
            if (key === property) {
              console.log("tüdelü", condition.condition[key].const);
              if (condition.condition[key].const === value) {
                console.log("condition", condition.ref);
                const conditionRef = condition.ref;
                myRef = [{ ref: conditionRef.replace("#/$defs/", ""), finalPath: property }];
              }
            }
          });
        }
      });
    } else {
      //case: just search property at top-level of schema and use the ref (property was not found in conditions)
      // find only top-level defs:

      let topLevelDefs = [];

      if (schema && schema.allOf) {
        for (const condition of schema.allOf) {
          if (condition) {
            const ref: string = condition.then?.$ref;
            if (ref) {
              topLevelDefs.push(ref.replace("#/$defs/", ""));
            }
          }
        }
      }
      console.log("topLevelDefs", topLevelDefs);
      if (topLevelDefs.length !== 0 && schema && schema.$defs) {
        topLevelDefs.forEach((def: string) => {
          const schemaDefs: DefinitionsMap = schema.$defs;
          const definition = schemaDefs[def];
          if (
            definition &&
            definition.properties &&
            Object.keys(definition.properties).length > 0
          ) {
            for (const propKey in definition.properties) {
              const propDefinition = definition.properties[propKey];
              if (
                propDefinition.title &&
                propDefinition.title === property &&
                propDefinition.$ref
              ) {
                const ref = propDefinition.$ref;
                myRef = [{ ref: ref.replace("#/$defs/", ""), finalPath: property }];
              }
            }
          }
        });
      }
    }
    return myRef;
  }
  const document = vscode.window.activeTextEditor?.document;

  getMap();

  async function getMap() {
    const myRef = await findMyRef("buildingBlock", "COLLECTIONS");
    console.log("myyRef", myRef);
    const docHash = hash(document);
    const docUri = document?.uri.toString();
    const definitionsMap = await getDefinitionsMap(myRef, docUri, docHash);
    console.log("DefaultsdefinitionsMap", definitionsMap);
  }

  if (DEV) {
    console.log("ACTIVATE", context.extension.id, context.extension.isActive);
  }
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

  if (!initialized) {
    hover();
    initSchemas();
    initDiagnostics();

    updateYamlKeysHover(document, hashString, collection, context);

    initialized = true;
  }

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
