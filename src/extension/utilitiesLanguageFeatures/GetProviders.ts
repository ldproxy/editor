// import { hoverData } from "./providers";
import { services } from "./services";

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

          const additionalReference =
            propDefinition.additionalProperties && propDefinition.additionalProperties.$ref;
          if (additionalReference && additionalReference.length > 0) {
            const lastSlashIndex = additionalReference.lastIndexOf("/");
            lastPartValueAddRed = additionalReference.substring(lastSlashIndex + 1);
          }

          let uniqueKey = propKey;
          let counter = 1;

          while (definitionsMap[uniqueKey]) {
            uniqueKey = propKey + counter;
            counter++;
          }

          definitionsMap[uniqueKey] = {
            groupname: defs,
            title: propDefinition.title,
            description: propDefinition.description,
            ref: lastPartValue,
            addRef: lastPartValueAddRed,
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

            const nestedDefinitionsMap = processProperties(
              lastPartValue,
              services.$defs,
              definitionsMap
            );
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

            const nestedDefinitionsMap = processProperties(
              lastPartValue,
              services.$defs,
              definitionsMap
            );
            definitionsMap = { ...definitionsMap, ...nestedDefinitionsMap };
          }
        }
      }
    }
  }
  console.log("lastPartValueArray", lastPartValueArray);
  return lastPartValueArray;
}
