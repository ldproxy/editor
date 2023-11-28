import * as vscode from "vscode";
import * as yaml from "js-yaml";
import { hoverData } from "./providers";

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
  const json = hoverData;
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

  for (const key in condition) {
    const conditionEntry = condition[key];
    const conditionValue = conditionEntry?.const;
    const lowerCasedConditionValue = conditionValue?.toLowerCase();

    if (lowerCasedConditionValue !== undefined) {
      const configValue = config[key];
      const lowerCasedConfigValue = configValue?.toLowerCase();

      if (lowerCasedConfigValue !== lowerCasedConditionValue) {
        allConditionsMet = false;
      }
    }
  }

  return allConditionsMet;
}
