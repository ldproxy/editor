export function getAllYamlPaths(
  document: string,
  yamlObject: any,
  currentPath: string,
  yamlKeys: {
    path: string;
    index: number;
    lineOfPath: number;
    startOfArray?: number;
    arrayIndex?: number;
  }[] = []
) {
  if (yamlObject && typeof yamlObject === "object") {
    yamlObject.forEach((object: any) => {
      if (
        object &&
        object.key &&
        object.key.source &&
        object.value &&
        object.value.items &&
        object.value.items[0] &&
        object.value.items[0].start[0] &&
        object.value.items[0].start[0].source &&
        object.value.items[0].start[0].source === "-"
      ) {
        const path: string = currentPath
          ? `${currentPath}.${object.key.source}`
          : object.key.source;
        const line: number = getLineNumber(document, object.key.offset);
        const column: number = object.key.indent;
        if (line !== undefined && column !== undefined) {
          const existing = yamlKeys.find((item) => item.path === path);
          if (!existing) {
            yamlKeys.push({ path, index: column, lineOfPath: line });
          }
        }
        let arrayIndex = -1;

        console.log("llk", object.value);
        object.value.items.forEach((array: any) => {
          arrayIndex++;
          console.log("arraaay", array);
          const arrayStartOffset = array.start[0].offset;
          let startOfArray: number;
          if (arrayStartOffset) {
            startOfArray = getLineNumber(document, arrayStartOffset);
          }
          if (array && array.value && array.value.items) {
            array.value.items.forEach((object2: any) => {
              if (object2 && object2.key && object2.key.source) {
                const path: string = object.key.source
                  ? `${object.key.source}.${object2.key.source}`
                  : object2.key.source;
                const line: number = getLineNumber(document, object2.key.offset);
                const column: number = object2.key.indent;
                if (line !== undefined && column !== undefined) {
                  const existing = yamlKeys.find(
                    (item) => item.path === path && item.lineOfPath === line
                  );
                  if (!existing) {
                    yamlKeys.push({
                      path,
                      index: column,
                      lineOfPath: line,
                      startOfArray,
                      arrayIndex,
                    });
                  }
                }
              }
            });
          }
        });
      } else if (
        object &&
        object.key &&
        object.key.source &&
        object.value &&
        typeof object.value === "object" &&
        "source" in object.value &&
        !object.value.items
      ) {
        const path: string = currentPath
          ? `${currentPath}.${object.key.source}`
          : object.key.source;
        console.log("importa", object.key);
        const line: number = getLineNumber(document, object.key.offset);
        const column: number = object.key.indent;
        if (line !== undefined && column !== undefined) {
          const existing = yamlKeys.find((item) => item.path === path);
          if (!existing) {
            yamlKeys.push({ path, index: column, lineOfPath: line });
          }
        }
      } else if (
        object &&
        object.key &&
        typeof object.key === "object" &&
        "source" in object.key &&
        object.value &&
        !object.value.source &&
        object.value.items[0]
      ) {
        const path = currentPath ? `${currentPath}.${object.key.source}` : object.key.source;
        const line: number = getLineNumber(document, object.key.offset);
        const column: number = object.key.indent;
        if (line !== undefined && column !== undefined) {
          const existing = yamlKeys.find((item) => item.path === path);
          if (!existing) {
            yamlKeys.push({ path, index: column, lineOfPath: line });
          }
        }

        object.value.items.forEach((item: any) => {
          if (item && item.key && item.key.source) {
            const path = object.key.source
              ? `${object.key.source}.${item.key.source}`
              : item.key.source;
            const line: number = getLineNumber(document, item.key.offset);
            const column: number = item.key.indent;
            if (line !== undefined && column !== undefined) {
              const existing = yamlKeys.find((item) => item.path === path);
              if (!existing) {
                yamlKeys.push({ path, index: column, lineOfPath: line });
              }
            }
          }
        });
      }
    });
  }
  yamlKeys.sort((a, b) => a.lineOfPath - b.lineOfPath);

  return yamlKeys;
}

function getLineNumber(documentText: any, offset: number) {
  const lines = documentText.split("\n");
  let currentOffset = 0;

  for (let i = 0; i < lines.length; i++) {
    currentOffset += lines[i].length + 1; // +1 for the newline character
    if (currentOffset > offset) {
      return i + 1; // Adding 1 to convert from zero-based to one-based line number
    }
  }

  // If the offset is beyond the end of the document
  return lines.length + 1;
}
