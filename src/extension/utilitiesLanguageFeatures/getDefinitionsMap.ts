import { processProperties, findObjectsWithRef } from "../utilitiesLanguageFeatures/GetProviders";
import { getSchemaDefs, DefinitionsMap } from "./schema";

export function getDefintionsMap(
  specifiedDefs: { ref: string; finalPath: string }[]
): DefinitionsMap {
  const schemaDefs = getSchemaDefs();

  if (!schemaDefs) {
    return {};
  }

  let definitionsMap: DefinitionsMap = {};

  let allRefs: string[] | undefined = [];
  specifiedDefs.forEach((def) => {
    definitionsMap = processProperties(def.ref, schemaDefs, definitionsMap);
  });
  console.log("111", specifiedDefs);
  if (definitionsMap && Object.keys(definitionsMap).length > 0) {
    allRefs = findObjectsWithRef(definitionsMap);
  }

  if (allRefs && allRefs.length > 0) {
    allRefs.forEach((ref) => {
      console.log("222", ref);
      definitionsMap = {
        ...definitionsMap,
        ...processProperties(ref, schemaDefs, definitionsMap),
      };
    });
  }
  return definitionsMap;
}
