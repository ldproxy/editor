export function buildEnumArray(definitions: any): { key: string; enum: string }[] {
  let localEnumArray: { key: string; enum: string }[] = [];
  console.log("enumDefinitions", definitions);
  for (const key in definitions) {
    const definition = definitions[key];

    if (definition && definition.anyOf && definition.anyOf[0] && definition.anyOf[0].properties) {
      definition.anyOf.forEach((item: any) => {
        for (const propKey in item.properties) {
          const propDefinition = item.properties[propKey];
          if (propDefinition && propDefinition.hasOwnProperty("enum")) {
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
      });
    } else if (definition && definition.properties) {
      for (const propKey in definition.properties) {
        const propDefinition = definition.properties[propKey];
        if (propDefinition && propDefinition.hasOwnProperty("enum")) {
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
