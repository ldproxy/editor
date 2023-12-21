import * as vscode from "vscode";
import * as yaml from "js-yaml";
import { hoverData } from "./providers";
import { services } from "./services";
import { getCurrentFilePath, servicesOrProviders } from "./servicesOrProviders";

interface LooseDefinition {
  title?: string;
  description?: string;
  [key: string]: any;
}

interface Conditions {
  condition?: Record<string, any>;
  ref?: string;
}

export function extractConditions() {
  let currentFilePath = getCurrentFilePath();
  let serviceOrProvider: string | undefined;
  if (currentFilePath) {
    serviceOrProvider = servicesOrProviders(currentFilePath);
  }
  console.log("serviceOrProvider", serviceOrProvider);
  let json;
  if (serviceOrProvider && serviceOrProvider === "services") {
    json = services;
  } else if (serviceOrProvider && serviceOrProvider === "providers") {
    json = hoverData;
  }
  const conditions: Conditions[] = [];
  if (!json) {
    return [];
  }
  console.log("coonfig", json);
  // Überprüfen, ob es ein allOf-Array in der obersten Ebene gibt
  if (json.allOf) {
    for (const condition of json.allOf) {
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

  if (json.$defs) {
    const defs = json.$defs as Record<string, LooseDefinition>;

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
  console.log("conditions", conditions);
  return conditions;
}

export function defineDefs(document: vscode.TextDocument) {
  const config = yaml.load(document.getText()) as LooseDefinition;
  if (!config) {
    return [];
  }

  const conditions = extractConditions();

  let specifiedDefs: { ref: string; finalPath: string }[] = [];

  for (const { condition, ref } of conditions) {
    if (condition) {
      const resultObject = matchesCondition(config, condition);
      console.log("returnObjects", resultObject);
      resultObject.forEach((item: { allConditionsMet: boolean; finalPath: string }) => {
        console.log("item", item);
        const { allConditionsMet, finalPath } = item;
        if (ref && allConditionsMet && finalPath !== "") {
          console.log("allConditionsMet", finalPath, allConditionsMet, ref);
          specifiedDefs.push({ ref, finalPath });
        }
      });
    }
  }

  console.log("speecifiedDefs", specifiedDefs);
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
