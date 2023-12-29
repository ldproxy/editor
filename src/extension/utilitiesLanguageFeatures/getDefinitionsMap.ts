import { processProperties, findObjectsWithRef } from "./buildDefMap";
import { getCurrentFilePath, servicesOrProviders } from "./servicesOrProviders";
import { services } from "../utilitiesLanguageFeatures/services";
import { hoverData } from "./providers";

interface DefinitionsMap {
  [key: string]: LooseDefinition;
}

interface LooseDefinition {
  title?: string;
  description?: string;
  [key: string]: any;
}

export function getDefinitionsMap(specifiedDefs: { ref: string; finalPath: string }[]) {
  let currentFilePath = getCurrentFilePath();
  let serviceOrProvider: string | undefined;
  if (currentFilePath) {
    serviceOrProvider = servicesOrProviders(currentFilePath);
  }
  let definitionsMap: DefinitionsMap = {};

  let allRefs: string[] | undefined = [];
  specifiedDefs.map((def) => {
    if (serviceOrProvider && serviceOrProvider === "services") {
      definitionsMap = processProperties(def.ref, services.$defs, definitionsMap);
    } else if (serviceOrProvider && serviceOrProvider === "providers") {
      definitionsMap = processProperties(def.ref, hoverData.$defs, definitionsMap);
    }
  });
  console.log("111", specifiedDefs);
  if (definitionsMap && Object.keys(definitionsMap).length > 0) {
    allRefs = findObjectsWithRef(definitionsMap);
    console.log("222", allRefs);
  }

  if (allRefs && allRefs.length > 0) {
    allRefs.map((ref) => {
      if (serviceOrProvider && serviceOrProvider === "services") {
        definitionsMap = {
          ...definitionsMap,
          ...processProperties(ref, services.$defs, definitionsMap),
        };
      } else if (serviceOrProvider && serviceOrProvider === "providers") {
        definitionsMap = {
          ...definitionsMap,
          ...processProperties(ref, hoverData.$defs, definitionsMap),
        };
      }
    });
  }
  return definitionsMap;
}
