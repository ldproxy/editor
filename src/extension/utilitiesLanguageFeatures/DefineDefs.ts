import * as vscode from "vscode";
import * as yaml from "js-yaml";
// import { hoverData } from "./providers";
import { services } from "./services";

interface LooseDefinition {
  title?: string;
  description?: string;
  [key: string]: any;
}

interface Conditions {
  condition?: Record<string, any>;
  ref?: string;
}

function extractConditions() {
  const json = services;
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
  console.log("conditions", conditions);

  let specifiedDefs: string[] = [];

  for (const { condition, ref } of conditions) {
    if (condition && ref && matchesCondition(config, condition)) {
      specifiedDefs.push(ref);
    }
  }

  console.log("speecifiedDefs", specifiedDefs);
  return specifiedDefs;
}

function matchesCondition(
  config: LooseDefinition,
  condition: Record<string, { const: string }>
): boolean {
  let allConditionsMet = true;
  console.log("aaaconfig", config);
  for (const key in condition) {
    const conditionEntry = condition[key];
    const conditionValue = conditionEntry?.const;
    const lowerCasedConditionValue = conditionValue?.toLowerCase();

    if (lowerCasedConditionValue !== undefined) {
      function getConfigValues(obj: any, targetKey: string): any[] {
        const values: any[] = [];

        if (typeof obj === "object") {
          if (Array.isArray(obj)) {
            for (let i = 0; i < obj.length; i++) {
              values.push(...getConfigValues(obj[i], targetKey));
            }
          } else {
            for (const currentKey in obj) {
              if (currentKey === targetKey) {
                values.push(obj[currentKey]);
              } else {
                values.push(...getConfigValues(obj[currentKey], targetKey));
              }
            }
          }
        }

        return values;
      }

      const configValues = getConfigValues(config, key);
      const lowerCasedConfigValues = configValues.map((value: any) => value?.toLowerCase());

      if (!lowerCasedConfigValues.includes(lowerCasedConditionValue)) {
        allConditionsMet = false;
      }
    }
  }

  return allConditionsMet;
}
