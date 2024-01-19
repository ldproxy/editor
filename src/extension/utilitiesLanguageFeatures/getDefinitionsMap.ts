import { processProperties, findObjectsWithRef, getRequiredProperties } from "./buildDefMap";
import { getSchemaDefs, DefinitionsMap } from "./schemas";
import { DEV } from "../utilities/constants";

let allMaps: {
  [docUri: string]: { hash: string; definitionsMap: DefinitionsMap };
} = {};

export async function getDefinitionsMap(
  specifiedDefs: { ref: string; finalPath: string }[],
  docUri?: string,
  docHash?: string
): Promise<DefinitionsMap> {
  if (docUri && docHash && allMaps[docUri] && allMaps[docUri].hash === docHash) {
    if (DEV) {
      console.log("allMapsDefMap", allMaps);
    }
    return allMaps[docUri].definitionsMap;
  }

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
  if (specifiedDefs && specifiedDefs.length > 0) {
    specifiedDefs.forEach((def) => {
      definitionsMap = processProperties(def.ref, schemaDefs, definitionsMap);
    });
    if (DEV) {
      console.log("specifiedDefsDefMap", specifiedDefs);
    }
  }

  if (schema) {
    const requiredProperties = await getRequiredProperties(schema);
    definitionsMap = {
      ...definitionsMap,
      ...requiredProperties,
    };
  }

  if (definitionsMap && Object.keys(definitionsMap).length > 0) {
    allRefs = await findObjectsWithRef(definitionsMap, schemaDefs);
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

  if (docUri && docHash) {
    allMaps[docUri] = { hash: docHash, definitionsMap: definitionsMap };
  }
  return definitionsMap;
}
