import { hoverData } from "./providers";
import { services } from "./services";
import { getCurrentFilePath, servicesOrProviders } from "./servicesOrProviders";

interface LooseDefinition {
  title?: string;
  description?: string;
  [key: string]: any;
}

interface DefinitionsMap {
  [key: string]: LooseDefinition;
}

export function processProperties(
  defs: string,
  definitions: Record<string, LooseDefinition>,
  definitionsMap: DefinitionsMap = {}
) {
  let lastPartValue = "";
  let lastPartValueAddRed = "";
  console.log("defs", defs);

  if (defs !== "") {
    const definition = definitions[defs];
    if (definition && definition.properties) {
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

          definitionsMap[uniqueKey] = {
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
            deprecated: propDefinition.deprecated,
          };

          lastPartValue = "";
          lastPartValueAddRed = "";
        }
      }
    }
  }
  return definitionsMap;
}

export function findObjectsWithRef(definitionsMap: DefinitionsMap): string[] {
  let currentFilePath = getCurrentFilePath();
  let serviceOrProvider: string | undefined;
  if (currentFilePath) {
    serviceOrProvider = servicesOrProviders(currentFilePath);
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
            if (serviceOrProvider && serviceOrProvider === "services") {
              nestedDefinitionsMap = processProperties(
                lastPartValue,
                services.$defs,
                definitionsMap
              );
            } else if (serviceOrProvider && serviceOrProvider === "providers") {
              nestedDefinitionsMap = processProperties(
                lastPartValue,
                hoverData.$defs,
                definitionsMap
              );
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
            if (serviceOrProvider && serviceOrProvider === "services") {
              nestedDefinitionsMap = processProperties(
                lastPartValue,
                services.$defs,
                definitionsMap
              );
            } else if (serviceOrProvider && serviceOrProvider === "providers") {
              nestedDefinitionsMap = processProperties(
                lastPartValue,
                hoverData.$defs,
                definitionsMap
              );
            }
            definitionsMap = { ...definitionsMap, ...nestedDefinitionsMap };
          }
        }
      }
    }
  }
  console.log("lastPartValueArray", lastPartValueArray);
  return lastPartValueArray;
}
