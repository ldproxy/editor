import { DEV } from "./constants";

export function buildEnumArray(
  definitions: any
): { key: string; enum: string; groupname: string | "" }[] {
  let localEnumArray: { key: string; enum: string; groupname: string | "" }[] = [];
  if (DEV) {
    console.log("enumDefinitions", definitions);
  }

  if (definitions.hasOwnProperty("properties")) {
    for (const key in definitions.properties) {
      const definition = definitions.properties[key];
      if (definition && definition.hasOwnProperty("enum")) {
        definition.enum.forEach((enumValue: string) => {
          const existing = localEnumArray.find(
            (existingEnum) =>
              existingEnum.key === key &&
              existingEnum.enum === enumValue &&
              existingEnum.groupname === ""
          );
          if (existing === undefined) {
            localEnumArray.push({ key: key, enum: enumValue, groupname: "" });
          }
        });
      }
    }
  }
  if (definitions.hasOwnProperty("anyOf") && definitions.anyOf[0]) {
    if (DEV) {
      console.log("definitions.anyOf[0]", definitions.anyOf[0]);
    }
    definitions.anyOf.forEach((item: any) => {
      if (item.hasOwnProperty("properties")) {
        if (DEV) {
          console.log("propItem", item.properties);
        }
        for (const propKey in item.properties) {
          const propDefinition = item.properties[propKey];
          if (DEV) {
            console.log("propDefinitiongetEnum", propDefinition);
          }
          if (propDefinition && propDefinition.hasOwnProperty("enum")) {
            if (DEV) {
              console.log("propDefinition.enum", propDefinition.enum);
            }
            propDefinition.enum.forEach((enumValue: string) => {
              const existing = localEnumArray.find(
                (existingEnum) =>
                  existingEnum.key === propKey &&
                  existingEnum.enum === enumValue &&
                  existingEnum.groupname === ""
              );
              if (existing === undefined) {
                localEnumArray.push({ key: propKey, enum: enumValue, groupname: "" });
              }
            });
          }
        }
      }
    });
  }

  for (const key in definitions.$defs) {
    const definition = definitions.$defs[key];

    if (definition && definition.anyOf && definition.anyOf[0] && definition.anyOf[0].properties) {
      definition.anyOf.forEach((item: any) => {
        for (const propKey in item.properties) {
          const propDefinition = item.properties[propKey];
          if (propDefinition && propDefinition.hasOwnProperty("enum")) {
            propDefinition.enum.forEach((enumValue: string) => {
              const existing = localEnumArray.find(
                (existingEnum) =>
                  existingEnum.key === propKey &&
                  existingEnum.enum === enumValue &&
                  existingEnum.groupname === key
              );
              if (existing === undefined) {
                localEnumArray.push({ key: propKey, enum: enumValue, groupname: key });
              }
            });
          }
        }
      });
    } else if (definition && definition.properties) {
      for (const propKey in definition.properties) {
        const propDefinition = definition.properties[propKey];
        if (propDefinition && propDefinition.hasOwnProperty("enum")) {
          propDefinition.enum.forEach((enumValue: string) => {
            const existing = localEnumArray.find(
              (existingEnum) =>
                existingEnum.key === propKey &&
                existingEnum.enum === enumValue &&
                existingEnum.groupname === key
            );
            if (existing === undefined) {
              localEnumArray.push({ key: propKey, enum: enumValue, groupname: key });
            }
          });
        } else if (
          propDefinition &&
          propDefinition.hasOwnProperty("oneOf") &&
          propDefinition.hasOwnProperty("title")
        ) {
          propDefinition.oneOf.forEach((obj: any) => {
            if (obj && obj.hasOwnProperty("type") && obj.type === "boolean") {
              const existingWithTrue = localEnumArray.find(
                (existingEnum) =>
                  existingEnum.key === propDefinition.title &&
                  existingEnum.enum === "true" &&
                  existingEnum.groupname === key
              );

              const existingWithFalse = localEnumArray.find(
                (existingEnum) =>
                  existingEnum.key === propDefinition.title &&
                  existingEnum.enum === "false" &&
                  existingEnum.groupname === key
              );

              if (existingWithTrue === undefined && existingWithFalse === undefined) {
                localEnumArray.push({ key: propDefinition.title, enum: "true", groupname: key });
                localEnumArray.push({ key: propDefinition.title, enum: "false", groupname: key });
              } else if (existingWithTrue === undefined) {
                localEnumArray.push({ key: propDefinition.title, enum: "true", groupname: key });
              } else if (existingWithFalse === undefined) {
                localEnumArray.push({ key: propDefinition.title, enum: "false", groupname: key });
              }
            }
          });
        }
      }
    }
  }
  if (DEV) {
    console.log("localEnumArray", JSON.stringify(localEnumArray));
  }
  return localEnumArray;
}
