import { processProperties, findObjectsWithRef } from "../utilitiesLanguageFeatures/GetProviders";
// import { services } from "../utilitiesLanguageFeatures/services";
import { hoverData } from "./providers";

interface DefinitionsMap {
  [key: string]: LooseDefinition;
}

interface LooseDefinition {
  title?: string;
  description?: string;
  [key: string]: any;
}

export function getDefintionsMap(specifiedDefs: { ref: string; finalPath: string }[]) {
  let definitionsMap: DefinitionsMap = {};

  let allRefs: string[] | undefined = [];
  specifiedDefs.map((def) => {
    definitionsMap = processProperties(def.ref, hoverData.$defs, definitionsMap);
  });
  console.log("111", specifiedDefs);
  if (definitionsMap && Object.keys(definitionsMap).length > 0) {
    allRefs = findObjectsWithRef(definitionsMap);
    console.log("222", allRefs);
  }

  if (allRefs && allRefs.length > 0) {
    allRefs.map((ref) => {
      definitionsMap = {
        ...definitionsMap,
        ...processProperties(ref, hoverData.$defs, definitionsMap),
      };
    });
  }
  return definitionsMap;
}
