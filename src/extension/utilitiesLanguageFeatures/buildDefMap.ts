import { getSchemaDefs, DefinitionsMap } from "./schemas";
import { DEV } from "../utilities/constants";
import { getDefinitionsMap } from "./getDefinitionsMap";

export function processProperties(
  defs: string,
  schemaDefs: DefinitionsMap,
  definitionsMap: DefinitionsMap = {}
) {
  let lastPartValue = "";
  let lastPartValueAddRed = "";
  if (DEV) {
    console.log("defs", defs);
  }

  if (defs !== "") {
    const definition = schemaDefs[defs];
    if (definition && definition.properties && Object.keys(definition.properties).length > 0) {
      for (const propKey in definition.properties) {
        const propDefinition = definition.properties[propKey];
        if (propDefinition.title || propDefinition.description) {
          const reference = propDefinition.$ref;
          if (reference && reference.length > 0 && reference !== undefined) {
            const lastSlashIndex = reference.lastIndexOf("/");
            lastPartValue = reference.substring(lastSlashIndex + 1);
          }

          let referenceInConditionLastPart;
          if (
            propDefinition &&
            propDefinition.allOf &&
            propDefinition.allOf[0] &&
            propDefinition.allOf[0].then &&
            propDefinition.allOf[0].then.items &&
            propDefinition.allOf[0].then.items.$ref
          ) {
            const ref = propDefinition.allOf[0].then.items.$ref;
            if (ref && ref.length > 0 && ref !== undefined) {
              const lastSlashIndex = ref.lastIndexOf("/");
              referenceInConditionLastPart = ref.substring(lastSlashIndex + 1);
            }
          }

          const additionalReference =
            propDefinition.additionalProperties && propDefinition.additionalProperties.$ref;
          if (additionalReference && additionalReference.length > 0) {
            const lastSlashIndex = additionalReference.lastIndexOf("/");
            lastPartValueAddRed = additionalReference.substring(lastSlashIndex + 1);
          }

          let additionalReferenceInConditionLastPart;
          if (
            propDefinition.additionalProperties &&
            propDefinition.additionalProperties.allOf &&
            propDefinition.additionalProperties.allOf[0] &&
            propDefinition.additionalProperties.allOf[0].then &&
            propDefinition.additionalProperties.allOf[0].then.items &&
            propDefinition.additionalProperties.allOf[0].then.items.$ref
          ) {
            const ref = propDefinition.additionalProperties.allOf[0].then.items.$ref;
            if (ref && ref.length > 0 && ref !== undefined) {
              const lastSlashIndex = ref.lastIndexOf("/");
              additionalReferenceInConditionLastPart = ref.substring(lastSlashIndex + 1);
            }
          }

          let uniqueKey = propKey;
          let counter = 1;

          while (
            (definitionsMap[uniqueKey] && definitionsMap[uniqueKey].groupname !== defs) ||
            (definitionsMap[uniqueKey] && definitionsMap[uniqueKey].title !== propDefinition.title)
          ) {
            uniqueKey = propKey + counter;
            counter++;
          }

          (definitionsMap[uniqueKey] = {
            groupname: defs,
            title: propDefinition.title,
            description: propDefinition.description,
            ref:
              lastPartValue !== ""
                ? lastPartValue
                : referenceInConditionLastPart
                ? referenceInConditionLastPart
                : "",
            addRef:
              lastPartValueAddRed !== ""
                ? lastPartValueAddRed
                : additionalReferenceInConditionLastPart
                ? additionalReferenceInConditionLastPart
                : "",
            deprecated: propDefinition.deprecated ? true : false,
          }),
            (lastPartValue = "");
          lastPartValueAddRed = "";
        }
      }
    } else if (definition && definition.hasOwnProperty("anyOf")) {
      definition.anyOf.forEach((anyOfItem: any) => {
        for (const propKey in anyOfItem.properties) {
          if (DEV) {
            console.log("propDefinitionMy", propKey);
          }

          let deprecatedProperty = false;
          let uniqueKey = propKey;
          let counter = 1;

          while (
            (definitionsMap[uniqueKey] && definitionsMap[uniqueKey].groupname !== defs) ||
            (definitionsMap[uniqueKey] && definitionsMap[uniqueKey].title !== propKey)
          ) {
            deprecatedProperty = definitionsMap[uniqueKey].deprecated ? true : false;
            uniqueKey = propKey + counter;
            counter++;
          }
          if (DEV) {
            console.log("MyUniqueKey", uniqueKey);
          }
          definitionsMap[uniqueKey] = {
            groupname: defs,
            title: propKey,
            deprecated: deprecatedProperty,
          };
        }
      });
    }
  }
  return definitionsMap;
}

export async function findObjectsWithRef(definitionsMap: DefinitionsMap): Promise<string[]> {
  const schema = await getSchemaDefs();
  let schemaDefs: any;
  if (schema) {
    schemaDefs = schema.$defs;
  }
  let lastPartValueArray: string[] = [];
  let hasNewReferences = true;

  while (hasNewReferences) {
    hasNewReferences = false;

    for (const key in definitionsMap) {
      const obj = definitionsMap[key];

      if (typeof obj === "object" && obj["ref"] !== "") {
        const value = obj.ref;

        if (value) {
          const lastSlashIndex = value.lastIndexOf("/");
          const lastPartValue: string = value.substring(lastSlashIndex + 1);

          if (!lastPartValueArray.includes(lastPartValue)) {
            lastPartValueArray.push(lastPartValue);
            hasNewReferences = true;

            let nestedDefinitionsMap;
            if (schemaDefs) {
              nestedDefinitionsMap = processProperties(lastPartValue, schemaDefs, definitionsMap);
            }
            definitionsMap = { ...definitionsMap, ...nestedDefinitionsMap };
          }
        }
      }

      if (typeof obj === "object" && obj["addRef"] !== "") {
        const value = obj.addRef;

        if (value) {
          const lastSlashIndex = value.lastIndexOf("/");
          const lastPartValue: string = value.substring(lastSlashIndex + 1);

          if (!lastPartValueArray.includes(lastPartValue)) {
            lastPartValueArray.push(lastPartValue);
            hasNewReferences = true;

            let nestedDefinitionsMap;
            if (schemaDefs) {
              nestedDefinitionsMap = processProperties(lastPartValue, schemaDefs, definitionsMap);
            }
            definitionsMap = { ...definitionsMap, ...nestedDefinitionsMap };
          }
        }
      }
    }
  }
  if (DEV) {
    console.log("lastPartValueArray", lastPartValueArray);
  }
  return lastPartValueArray;
}

export async function getRequiredProperties(schema: DefinitionsMap): Promise<DefinitionsMap> {
  let requiredProperties: string[] = [];
  let definitionsMap: DefinitionsMap = {};
  if (schema) {
    const requiredPropertieObject = schema.properties;
    if (requiredPropertieObject) {
      requiredProperties = Object.keys(requiredPropertieObject);
      requiredProperties.forEach((requiredProperty: string) => {
        definitionsMap[requiredProperty] = {
          groupname: "requiredProperty",
          title: requiredProperty,
          deprecated: requiredPropertieObject[requiredProperty].deprecated,
        };
      });
    }

    if (schema.anyOf) {
      const anyOfArray = schema.anyOf;
      anyOfArray.forEach((obj: { required: []; properties: any }) => {
        if (obj.required) {
          obj.required.forEach((requiredProperty: string) => {
            definitionsMap[requiredProperty] = {
              groupname: "requiredProperty",
              title: requiredProperty,
              deprecated: obj.properties[requiredProperty].deprecated,
            };
          });
        }
      });
    }
  }
  if (DEV) {
    console.log("requiredPropsMap", definitionsMap);
  }
  return definitionsMap;
}
