import * as vscode from "vscode";
import * as yaml from "js-yaml";
import { getSchema, DefinitionsMap, LooseDefinition } from "./schemas";
import { DEV } from "../utilities/constants";

interface Conditions {
  condition?: Record<string, any>;
  ref?: string;
}

export const TOP_LEVEL_REF = "_TOP_LEVEL_";

export async function extractConditions(defaultCfgSchema?: LooseDefinition) {
  let schema: LooseDefinition | undefined = defaultCfgSchema;
  if (!schema) {
    schema = await getSchema();
  }
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

export async function defineDefs(document: vscode.TextDocument, docUri?: string, docHash?: string) {
  if (docUri && docHash && allSpecifiedDefs[docUri] && allSpecifiedDefs[docUri].hash === docHash) {
    return allSpecifiedDefs[docUri].specifiedDefs;
  }

  const config = yaml.load(document.getText()) as LooseDefinition;
  if (!config) {
    return [];
  }

  const conditions = await extractConditions();

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

function matchesCondition(
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
