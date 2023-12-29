import { processProperties, findObjectsWithRef } from "./buildDefMap";
import { getSchemaDefs, DefinitionsMap } from "./schemas";

export async function getDefinitionsMap(
  specifiedDefs: { ref: string; finalPath: string }[]
): Promise<DefinitionsMap> {
  const schemaDefs = await getSchemaDefs();

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
    allRefs = await findObjectsWithRef(definitionsMap);
    console.log("222", allRefs);
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
