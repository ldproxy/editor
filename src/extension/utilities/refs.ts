import { DefinitionsMap } from "./defs";
import { LooseDefinition } from "./defs";
import { DEV } from "./constants";
import * as yaml from "js-yaml";

interface Conditions {
  condition?: Record<string, any>;
  ref?: string;
}

export const TOP_LEVEL_REF = "_TOP_LEVEL_";

function extractConditions(schema: LooseDefinition) {
  if (!schema) {
    return [];
  }
  const conditions: Conditions[] = [];

  // Überprüfen, ob es ein allOf-Array in der obersten Ebene gibt
  if (schema.allOf) {
    for (const condition of schema.allOf) {
      if (condition.if && condition.if.properties) {
        const ref = condition.then?.$ref;
        if (ref) {
          conditions.push({
            condition: condition.if.properties,
            ref: ref.replace("#/$defs/", ""),
          });
        }
      }
    }
  }

  if (schema.$defs) {
    const defs = schema.$defs as DefinitionsMap;

    for (const key in defs) {
      if (defs.hasOwnProperty(key)) {
        const def = defs[key];

        if (def && def.allOf) {
          for (const condition of def.allOf) {
            if (condition.if && condition.if.properties) {
              const ref = condition.then?.$ref;
              if (ref) {
                conditions.push({
                  condition: condition.if.properties,
                  ref: ref.replace("#/$defs/", ""),
                });
              }
            }
          }
        }
      }
    }
  }
  if (DEV) {
    console.log("conditions", conditions);
  }
  return conditions;
}

let allSpecifiedDefs: {
  [docUri: string]: { hash: string; specifiedDefs: { ref: string; finalPath: string }[] };
} = {};

export function extractDocRefs(
  documentGetText: string,
  schema: LooseDefinition,
  docUri?: string,
  docHash?: string
) {
  if (docUri && docHash && allSpecifiedDefs[docUri] && allSpecifiedDefs[docUri].hash === docHash) {
    return allSpecifiedDefs[docUri].specifiedDefs;
  }

  const config = yaml.load(documentGetText);
  if (!config) {
    return [];
  }

  const conditions = extractConditions(schema);

  let specifiedDefs: { ref: string; finalPath: string }[] = [];

  for (const { condition, ref } of conditions) {
    if (condition) {
      const resultObject = matchesCondition(config, condition);
      if (DEV) {
        console.log("returnObjects", resultObject);
      }
      resultObject.forEach((item: { allConditionsMet: boolean; finalPath: string }) => {
        if (DEV) {
          console.log("item", item);
        }
        const { allConditionsMet, finalPath } = item;
        if (ref && allConditionsMet && finalPath !== "") {
          if (DEV) {
            console.log("allConditionsMet", finalPath, allConditionsMet, ref);
          }
          specifiedDefs.push({ ref, finalPath });
        }
      });
    }
  }
  //if (specifiedDefs.length === 0) {
  specifiedDefs.push({ ref: TOP_LEVEL_REF, finalPath: "" });
  //}
  if (DEV) {
    console.log("speecifiedDefs", specifiedDefs);
  }

  if (docUri && docHash) {
    allSpecifiedDefs[docUri] = { hash: docHash, specifiedDefs };
  }

  return specifiedDefs;
}

export function matchesCondition(
  config: LooseDefinition,
  condition: Record<string, { const: string }>
): { allConditionsMet: boolean; finalPath: string }[] {
  let returnObjects: { allConditionsMet: boolean; finalPath: string }[] = [];
  let allConditionsMet: boolean = true;

  for (const key in condition) {
    const conditionEntry = condition[key];
    const conditionValue = conditionEntry?.const;
    const lowerCasedConditionValue = conditionValue?.toLowerCase();

    if (lowerCasedConditionValue !== undefined) {
      const matchingPaths: string[] = [];

      function getConfigValues(obj: any, targetKey: string, path: string): void {
        if (typeof obj === "object") {
          if (Array.isArray(obj)) {
            for (let i = 0; i < obj.length; i++) {
              const newPath = path ? `${path}.${targetKey}[${i}]` : `${targetKey}[${i}]`;
              getConfigValues(obj[i], targetKey, newPath);
            }
          } else {
            for (const currentKey in obj) {
              const newPath = path ? `${path}.${currentKey}` : `${currentKey}`;
              if (currentKey === targetKey) {
                if (obj[currentKey].toLowerCase() === lowerCasedConditionValue) {
                  matchingPaths.push(newPath);
                }
              }
              getConfigValues(obj[currentKey], targetKey, newPath);
            }
          }
        }
      }

      getConfigValues(config, key, "");

      if (matchingPaths.length === 0) {
        allConditionsMet = false;
        break;
      }

      matchingPaths.forEach((path) => {
        returnObjects.push({ allConditionsMet: true, finalPath: path });
      });
    }
  }

  if (!allConditionsMet) {
    returnObjects = [{ allConditionsMet: false, finalPath: "" }];
  }

  return returnObjects;
}

// used for default configs so far
export function extractSingleRefs(
  schema: LooseDefinition,
  property?: string,
  discriminatorKey?: string,
  discriminatorValue?: string
) {
  let myRef: [{ ref: string; finalPath: string }] = [{ ref: "", finalPath: "" }];
  const conditions = extractConditions(schema);
  if (DEV) {
    console.log("findMyRefconditions", conditions);
    console.log("findMyRefschema", schema);
    console.log("myProperty", property);
  }
  if (!schema) {
    return [];
  }

  if (discriminatorKey && discriminatorValue) {
    if (DEV) {
      console.log("findMyRefproperty", discriminatorKey, discriminatorValue);
    }
    // case: discriminatorKey is in conditions (value of discriminatorKey is relevant choice of ref)
    conditions.forEach((condition: { [key: string]: any }) => {
      if (DEV) {
        console.log("condition2", condition);
      }
      const conditionKeys = Object.keys(condition.condition);
      if (DEV) {
        console.log("conditionKeys2", conditionKeys);
      }
      if (conditionKeys.length === 1) {
        conditionKeys.forEach((key: string) => {
          if (DEV) {
            console.log("blakey", key);
          }
          if (key === discriminatorKey) {
            if (DEV) {
              console.log("condition.condition[key].const", condition.condition[key].const);
            }
            if (condition.condition[key].const === discriminatorValue) {
              if (DEV) {
                console.log("condition.ref", condition.ref);
              }
              const conditionRef = condition.ref;
              myRef = [{ ref: conditionRef.replace("#/$defs/", ""), finalPath: discriminatorKey }];
            }
          }
        });
      }
    });
  } else if (property) {
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
    if (DEV) {
      console.log("topLevelDefs", topLevelDefs);
    }
    if (topLevelDefs.length !== 0 && schema && schema.$defs) {
      topLevelDefs.forEach((def: string) => {
        const schemaDefs: DefinitionsMap = schema.$defs;
        const definition = schemaDefs[def];
        if (definition && definition.properties && Object.keys(definition.properties).length > 0) {
          for (const propKey in definition.properties) {
            const propDefinition = definition.properties[propKey];
            if (propDefinition.title && propDefinition.title === property && propDefinition.$ref) {
              const ref = propDefinition.$ref;
              myRef = [{ ref: ref.replace("#/$defs/", ""), finalPath: property }];
            }
          }
        }
      });
    }
  }
  if (DEV) {
    console.log("myRefDefault", myRef);
  }
  return myRef;
}
export function removeDuplicates(
  specifiedDefs: { ref: string; finalPath: string }[]
): { ref: string; finalPath: string }[] {
  let uniquePaths: { ref: string; finalPath: string }[] = [];

  specifiedDefs.forEach((def) => {
    const { ref, finalPath } = def;
    const refExists = uniquePaths.find((obj) => obj.ref === ref);
    if (refExists) {
      if (finalPath.includes(".")) {
        uniquePaths.push({ ref, finalPath });
      }
    } else {
      uniquePaths.push({ ref, finalPath });
    }
  });

  return uniquePaths;
}
