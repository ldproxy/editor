import { services } from "./services";

let enumArray: { key: string; enum: string }[] = [];
export function getEnums(allRefs: string[], specifiedDefs: { ref: string; finalPath: string }[]) {
  allRefs.forEach((ref) => {
    enumArray = buildEnumArray(ref, services.$defs, enumArray);
  });
  specifiedDefs.forEach((def) => {
    enumArray = buildEnumArray(def.ref, services.$defs, enumArray);
  });
  console.log("enumArray: ", enumArray);
  return enumArray;
}

function buildEnumArray(
  ref: string,
  definitions: any,
  existingEnumArray: { key: string; enum: string }[]
): { key: string; enum: string }[] {
  console.log("refEnum", ref);
  let localEnumArray: { key: string; enum: string }[] = existingEnumArray;
  if (ref !== "") {
    const definition = definitions[ref];
    if (definition && definition.anyOf && definition.anyOf[0] && definition.anyOf[0].properties) {
      console.log("definition.properties", definition.anyOf[0].properties);
      for (const propKey in definition.anyOf[0].properties) {
        const propDefinition = definition.anyOf[0].properties[propKey];
        console.log("propDefinition", propDefinition);
        if (propDefinition && propDefinition.hasOwnProperty("enum")) {
          console.log("propDefinition.enum", propDefinition.enum);
          propDefinition.enum.forEach((enumValue: string) => {
            const existing = localEnumArray.find(
              (existingEnum) => existingEnum.key === propKey && existingEnum.enum === enumValue
            );
            if (existing === undefined) {
              localEnumArray.push({ key: propKey, enum: enumValue });
            }
          });
        }
      }
    }
  }
  return localEnumArray;
}
