import { processProperties, findObjectsWithRef } from "./buildDefMap";
import { getSchemaDefs, DefinitionsMap } from "./schemas";
import { DEV } from "../utilities/constants";

export async function getDefinitionsMap(
  specifiedDefs: { ref: string; finalPath: string }[]
): Promise<DefinitionsMap> {
  const schema = await getSchemaDefs();
  let schemaDefs: any;
  if (schema) {
    schemaDefs = schema.$defs;
  }

  if (!schemaDefs) {
    return {};
  }
  let definitionsMap: DefinitionsMap = {};

  let allRefs: string[] | undefined = [];
  specifiedDefs.forEach((def) => {
    definitionsMap = processProperties(def.ref, schemaDefs, definitionsMap);
  });
  if (DEV) {
    console.log("specifiedDefsDefMap", specifiedDefs);
  }
  if (definitionsMap && Object.keys(definitionsMap).length > 0) {
    allRefs = await findObjectsWithRef(definitionsMap);
    if (DEV) {
      console.log("allRefsDefMap", allRefs);
    }
  }

  if (allRefs && allRefs.length > 0) {
    allRefs.forEach((ref) => {
      if (DEV) {
        console.log("refDefMap", ref);
      }
      definitionsMap = {
        ...definitionsMap,
        ...processProperties(ref, schemaDefs, definitionsMap),
      };
    });
  }
  return definitionsMap;
}
