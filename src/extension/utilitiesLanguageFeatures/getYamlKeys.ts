import { DEV } from "../utilities/constants";

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
  arrayIndex: number = -1,
  startOfArray?: number
) {
  if (yamlObject && typeof yamlObject === "object") {
    if (DEV) {
      console.log("yamlObject", yamlObject);
    }
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
          ? `${currentPath}.${object.key.source.replace(/\./g, "/")}`
          : object.key.source.replace(/\./g, "/");
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
          if (DEV) {
            console.log("arrayGetKeys", array);
          }
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
                if (DEV) {
                  console.log("object2", object2);
                }
                const path2: string = `${path}.${object2.key.source.replace(/\./g, "/")}`;
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
                if (
                  object2.value &&
                  object2.value.items &&
                  object2.value.items[0].start.length > 0
                ) {
                  if (DEV) {
                    console.log("object2", [object2], path);
                  }
                  getAllYamlPaths(document, [object2], path, yamlKeys, -1);
                } else if (object2.value && object2.value.items) {
                  getAllYamlPaths(document, [object2], path, yamlKeys, arrayIndex, startOfArray);
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
        const path = currentPath
          ? `${currentPath}.${object.key.source.replace(/\./g, "/")}`
          : object.key.source.replace(/\./g, "/");
        const line: number = getLineNumber(document, object.key.offset);
        const column: number = object.key.indent;
        if (line !== undefined && column !== undefined) {
          const existing = yamlKeys.find((item) => item.path === path);
          if (!existing) {
            if (arrayIndex && arrayIndex >= 0 && startOfArray) {
              yamlKeys.push({ path, index: column, lineOfPath: line, startOfArray, arrayIndex });
            } else if (arrayIndex && arrayIndex >= 0) {
              yamlKeys.push({ path, index: column, lineOfPath: line, arrayIndex });
            } else {
              yamlKeys.push({ path, index: column, lineOfPath: line });
            }
          }
        }
        if (DEV) {
          console.log("ursprung", object);
        }
        object.value.items.forEach((item: any) => {
          if (DEV) {
            console.log("itemGetKeys", item);
          }
          if (
            item.value &&
            item.value.items &&
            item.value.items[0] &&
            item.value.items[0].start &&
            item.value.items[0].start[0]
          ) {
            if (DEV) {
              console.log("arrayitem", [item], path);
            }
            if (arrayIndex && arrayIndex >= 0 && startOfArray) {
              getAllYamlPaths(document, [item], path, yamlKeys, arrayIndex, startOfArray);
            } else {
              getAllYamlPaths(document, [item], path, yamlKeys);
            }
          } else if (item && item.key && item.key.source) {
            const keyWithoutDot = item.key.source.replace(/\./g, "/");
            const path2 = `${path}.${keyWithoutDot}`;
            const line: number = getLineNumber(document, item.key.offset);
            const column: number = item.key.indent;
            if (line !== undefined && column !== undefined) {
              const existing = yamlKeys.find((item) => item.path === path2);
              if (!existing) {
                if (arrayIndex && arrayIndex >= 0 && startOfArray) {
                  yamlKeys.push({
                    path: path2,
                    index: column,
                    lineOfPath: line,
                    startOfArray,
                    arrayIndex,
                  });
                } else if (arrayIndex && arrayIndex >= 0) {
                  yamlKeys.push({ path: path2, index: column, lineOfPath: line, arrayIndex });
                } else {
                  yamlKeys.push({ path: path2, index: column, lineOfPath: line });
                }
              }
            }

            if (item.value && item.value.items) {
              if (DEV) {
                console.log("item.value.items", item.value.items, path2);
              }
              if (arrayIndex && arrayIndex >= 0 && startOfArray) {
                getAllYamlPaths(
                  document,
                  item.value.items,
                  path2,
                  yamlKeys,
                  arrayIndex,
                  startOfArray
                );
              } else {
                getAllYamlPaths(document, item.value.items, path2, yamlKeys);
              }
            }
          }
        });
      } else if (object && object.key && object.key.source) {
        if (DEV) {
          console.log("objectGetKeys", object);
        }
        const path: string = currentPath
          ? `${currentPath}.${object.key.source.replace(/\./g, "/")}`
          : object.key.source.replace(/\./g, "/");
        if (DEV) {
          console.log("object.key", object.key);
        }
        const line: number = getLineNumber(document, object.key.offset);
        const column: number = object.key.indent;
        if (line !== undefined && column !== undefined) {
          const existing = yamlKeys.find((item) => item.path === path);
          if (!existing) {
            if (arrayIndex && arrayIndex >= 0 && startOfArray) {
              yamlKeys.push({ path, index: column, lineOfPath: line, startOfArray, arrayIndex });
            } else if (arrayIndex && arrayIndex >= 0) {
              yamlKeys.push({ path, index: column, lineOfPath: line, arrayIndex });
            } else {
              yamlKeys.push({ path, index: column, lineOfPath: line });
            }
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
