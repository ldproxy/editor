import { DEV } from "./constants";

export interface LooseDefinition {
  title?: string;
  description?: string;
  [key: string]: any;
}

export interface DefinitionsMap {
  [key: string]: LooseDefinition;
}

let allMaps: {
  [docUri: string]: { hash: string; definitionsMap: DefinitionsMap };
} = {};

export function getDefinitionsMap(
  schema: DefinitionsMap,
  specifiedDefs: { ref: string; finalPath: string }[],
  docUri?: string,
  docHash?: string
): DefinitionsMap {
  if (docUri && docHash && allMaps[docUri] && allMaps[docUri].hash === docHash) {
    if (DEV) {
      console.log("allMapsDefMap", allMaps);
    }
    return allMaps[docUri].definitionsMap;
  }

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
      console.log("specifiedDefsDefMap", definitionsMap);
    }
  }

  if (schema) {
    const requiredProperties = getRequiredProperties(schema);
    if (DEV) {
      console.log("rereq", requiredProperties);
    }

    definitionsMap = {
      ...definitionsMap,
      ...requiredProperties,
    };
  }

  if (definitionsMap && Object.keys(definitionsMap).length > 0) {
    allRefs = findObjectsWithRef(definitionsMap, schemaDefs);
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

//TODO: export only needed for tests
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

//TODO: export only needed for tests
export function findObjectsWithRef(definitionsMap: DefinitionsMap, schemaDefs: any): string[] {
  let lastPartValueArray: string[] = [];
  let hasNewReferences = true;

  while (hasNewReferences) {
    hasNewReferences = false;

    for (const key in definitionsMap) {
      const obj = definitionsMap[key];

      if (typeof obj === "object" && obj["ref"] !== "") {
        const value = obj.ref;
        if (DEV) {
          console.log("valueBuildDef", value);
        }
        if (value) {
          const lastSlashIndex = value.lastIndexOf("/");
          const lastPartValue: string = value.substring(lastSlashIndex + 1);

          if (!lastPartValueArray.includes(lastPartValue)) {
            lastPartValueArray.push(lastPartValue);
            hasNewReferences = true;

            let nestedDefinitionsMap;
            if (schemaDefs) {
              if (DEV) {
                console.log("lastPartValue", lastPartValue);
              }
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

//TODO: export only needed for tests
export function getRequiredProperties(schema: DefinitionsMap): DefinitionsMap {
  let requiredProperties: string[] = [];
  let definitionsMap: DefinitionsMap = {};
  if (schema) {
    if (DEV) {
      console.log("gRPSchema", schema);
    }
    const requiredPropertieObject = schema.properties;
    if (requiredPropertieObject) {
      requiredProperties = Object.keys(requiredPropertieObject);
      requiredProperties.forEach((requiredProperty: string) => {
        const prop = requiredPropertieObject[requiredProperty];
        let lastSlashIndex;
        if (prop.$ref) {
          lastSlashIndex = prop.$ref.lastIndexOf("/");
        }
        let lastPartValueAddRed = "";
        let additionalReference = "";
        if (prop.additionalProperties && prop.additionalProperties.$ref) {
          additionalReference = prop.additionalProperties.$ref;
        }
        if (DEV) {
          console.log("gRPadditionalReference", additionalReference);
        }
        if (additionalReference && additionalReference.length > 0) {
          const lastSlashIndex = additionalReference.lastIndexOf("/");
          lastPartValueAddRed = additionalReference.substring(lastSlashIndex + 1);
        }
        let uniqueKey = requiredProperty;
        let counter = 1;

        while (
          (definitionsMap[uniqueKey] && definitionsMap[uniqueKey].groupname !== schema.groupName) ||
          (definitionsMap[uniqueKey] && definitionsMap[uniqueKey].title !== requiredProperty)
        ) {
          if (DEV) {
            console.log("???");
          }
          uniqueKey = requiredProperty + counter;
          counter++;
        }

        definitionsMap[uniqueKey] = {
          title: requiredProperty,
          description: prop.enum ? prop.enum.join(", ") : prop.description,
          groupname: schema.groupName || "requiredProperty",
          noCondition: true,
          deprecated: prop.deprecated ? true : false,
          ref: prop.$ref ? prop.$ref.substring(lastSlashIndex + 1) : "",
          addRef: lastPartValueAddRed !== "" ? lastPartValueAddRed : "",
        };
      });
    }

    if (schema.anyOf) {
      const anyOfArray = schema.anyOf;
      anyOfArray.forEach((obj: { properties: any }) => {
        if (obj.properties) {
          Object.keys(obj.properties).forEach((requiredProperty: string) => {
            const prop = obj.properties[requiredProperty];
            let lastSlashIndex;
            if (prop.$ref) {
              lastSlashIndex = prop.$ref.lastIndexOf("/");
            }
            let lastPartValueAddRed = "";
            let additionalReference = "";
            if (prop.additionalProperties && prop.additionalProperties.$ref) {
              additionalReference = prop.additionalProperties.$ref;
            }
            if (additionalReference && additionalReference.length > 0) {
              const lastSlashIndex = additionalReference.lastIndexOf("/");
              lastPartValueAddRed = additionalReference.substring(lastSlashIndex + 1);
            }
            let uniqueKey = requiredProperty;
            let counter = 1;

            while (
              (definitionsMap[uniqueKey] &&
                definitionsMap[uniqueKey].groupname !== schema.groupName) ||
              (definitionsMap[uniqueKey] && definitionsMap[uniqueKey].title !== requiredProperty)
            ) {
              uniqueKey = requiredProperty + counter;
              counter++;
            }

            definitionsMap[uniqueKey] = {
              title: requiredProperty,
              description: prop.enum ? prop.enum.join(", ") : prop.description,
              groupname: schema.groupName || "requiredProperty",
              noCondition: true,
              deprecated: prop.deprecated ? true : false,
              ref: prop.$ref ? prop.$ref.substring(lastSlashIndex + 1) : "",
              addRef: lastPartValueAddRed !== "" ? lastPartValueAddRed : "",
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
