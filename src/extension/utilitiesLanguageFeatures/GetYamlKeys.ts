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
  }[] = [],
  arrayIndex: number = -1
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
        object.value.items[0].start[0].source
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
        object.value.items.forEach((array: any) => {
          arrayIndex++;
          console.log("arraaay", array);
          let arrayStartOffset;

          for (const item of array.start) {
            if (item.source === "-") {
              arrayStartOffset = item.offset;
              break;
            }
          }
          let startOfArray: number;
          if (arrayStartOffset) {
            startOfArray = getLineNumber(document, arrayStartOffset);
          }
          if (array && array.value && array.value.items) {
            array.value.items.forEach((object2: any) => {
              if (object2 && object2.key && object2.key.source) {
                console.log("object2", object2);
                const path2: string = `${path}.${object2.key.source}`;
                const line: number = getLineNumber(document, object2.key.offset);
                const column: number = object2.key.indent;
                if (line !== undefined && column !== undefined) {
                  const existing = yamlKeys.find(
                    (item) => item.path === path2 && item.lineOfPath === line
                  );
                  if (!existing) {
                    yamlKeys.push({
                      path: path2,
                      index: column,
                      lineOfPath: line,
                      startOfArray,
                      arrayIndex,
                    });
                  }
                }
                if (object2.value && object2.value.items) {
                  console.log("object2", [object2], path);
                  getAllYamlPaths(document, [object2], path, yamlKeys, -1);
                }
              }
            });
          }
        });
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
            const path2 = `${path}.${item.key.source}`;
            const line: number = getLineNumber(document, item.key.offset);
            const column: number = item.key.indent;
            if (line !== undefined && column !== undefined) {
              const existing = yamlKeys.find((item) => item.path === path2);
              if (!existing) {
                yamlKeys.push({ path: path2, index: column, lineOfPath: line });
              }
            }
            if (item.value && item.value.items) {
              console.log("item", item.value.items, path2);
              getAllYamlPaths(document, item.value.items, path2, yamlKeys);
            }
          }
        });
      } else if (object && object.key && object.key.source) {
        console.log("sooo", object);
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
    currentOffset += lines[i].length + 1;
    if (currentOffset > offset) {
      return i + 1;
    }
  }

  // If the offset is beyond the end of the document
  return lines.length + 1;
}
