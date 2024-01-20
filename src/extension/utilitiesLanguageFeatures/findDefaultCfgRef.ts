import { LooseDefinition, DefinitionsMap } from "./schemas";
import { extractConditions } from "./defineDefs";
import { DEV } from "../utilities/constants";

export async function findMyRef(schema: LooseDefinition, property?: string, value?: string) {
  let myRef: [{ ref: string; finalPath: string }] = [{ ref: "", finalPath: "" }];
  const conditions = await extractConditions(schema);
  if (DEV) {
    console.log("findMyRefconditions", conditions);
    console.log("findMyRefschema", schema);
  }
  if (!schema) {
    return [];
  }

  if (property && value) {
    if (DEV) {
      console.log("findMyRefproperty", property);
    }
    // case: property is in conditions (value of property is relevant choice of ref)
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
          if (key === property) {
            if (DEV) {
              console.log("condition.condition[key].const", condition.condition[key].const);
            }
            if (condition.condition[key].const === value) {
              if (DEV) {
                console.log("condition.ref", condition.ref);
              }
              const conditionRef = condition.ref;
              myRef = [{ ref: conditionRef.replace("#/$defs/", ""), finalPath: property }];
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
  return myRef;
}