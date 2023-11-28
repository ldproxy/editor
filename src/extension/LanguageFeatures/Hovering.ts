import * as vscode from "vscode";
import { hoverData } from "./providers";
import { processProperties, findObjectsWithRef } from "./GetProviders";
import { defineDefs } from "./DefineDefs";

interface LooseDefinition {
  title?: string;
  description?: string;
  [key: string]: any;
}

interface DefinitionsMap {
  [key: string]: LooseDefinition;
}

export const hover = () => {
  vscode.languages.registerHoverProvider(
    { language: "yaml", pattern: "**/dvg.yml" },
    {
      provideHover(document, position) {
        const word: string = document.getText(document.getWordRangeAtPosition(position));
        const specifiedDefs: string[] = defineDefs(document);
        let definitionsMap: DefinitionsMap = {};
        let allRefs: string[] | undefined = [];

        if (specifiedDefs && specifiedDefs.length > 0) {
          specifiedDefs.map((def) => {
            definitionsMap = Object.assign(definitionsMap, processProperties(def, hoverData.$defs));
          });
        }
        if (definitionsMap && Object.keys(definitionsMap).length > 0) {
          allRefs = findObjectsWithRef(definitionsMap);
        }

        if (allRefs && allRefs.length > 0) {
          allRefs.map((ref) => {
            definitionsMap = Object.assign(definitionsMap, processProperties(ref, hoverData.$defs));
          });
        }

        if (definitionsMap.hasOwnProperty(word) && definitionsMap[word].description !== "") {
          console.log("definitionsMap", definitionsMap);
          const hoverText = `${definitionsMap[word].title}: ${definitionsMap[word].description}`;
          return new vscode.Hover(hoverText);
        }

        return null;
      },
    }
  );
};
