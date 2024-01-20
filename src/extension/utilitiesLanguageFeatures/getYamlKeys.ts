import { start } from "repl";
import { DEV, DEVYAMLKEYS } from "../utilities/constants";

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
    if (DEVYAMLKEYS) {
      console.log("yamlObject", yamlObject);
    }
    //Fall: Array
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
        object.value.items[0].value &&
        object.value.items[0].value.items &&
        object.value.items[0].value.items[0] &&
        object.value.items[0].value.items[0].value &&
        object.value.items[0].value.items[0].value.source
      ) {
        const path: string = currentPath
          ? `${currentPath}.${object.key.source.replace(/\./g, "/")}`
          : object.key.source.replace(/\./g, "/");
        const line: number = getLineNumber(document, object.key.offset);
        const column: number = object.key.indent;
        if (line !== undefined && column !== undefined) {
          const existing = yamlKeys.find((item) => item.path === path && item.lineOfPath === line);
          if (!existing) {
            console.log("99", path, line);
            yamlKeys.push({ path, index: column, lineOfPath: line });
          }
        }
        // Hier geht man in den tastächlichen Array rein:
        object.value.items.forEach((array: any) => {
          if (!yamlKeys.some((yk) => yk.path === path)) {
            arrayIndex = -1;
          }
          arrayIndex++;
          if (DEVYAMLKEYS) {
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
                if (DEVYAMLKEYS) {
                  console.log("object2", object2);
                }
                const path2: string = `${path}.${object2.key.source.replace(/\./g, "/")}`;
                const line: number = getLineNumber(document, object2.key.offset);
                console.log("88", path2, line);
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
                // Wenn der Array nochmal einen Array enthält:
                if (
                  object2.value &&
                  object2.value.items &&
                  object2.value.items[0].start.length > 0
                ) {
                  if (DEVYAMLKEYS) {
                    console.log("77object2", [object2], path);
                  }
                  getAllYamlPaths(document, [object2], path, yamlKeys, -1);
                  // Wenn der Array noch ein Objekt enthält:
                } else if (object2.value && object2.value.items) {
                  console.log("66object2", [object2], path, arrayIndex, startOfArray);
                  getAllYamlPaths(document, [object2], path, yamlKeys, arrayIndex, startOfArray);
                }
              }
            });
          }
        });
        // Fall Objekt
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
        console.log("getKeysObject", path, line, arrayIndex, startOfArray);
        if (line !== undefined && column !== undefined) {
          const existing = yamlKeys.find((item) => item.path === path && item.lineOfPath === line);
          if (!existing) {
            if (arrayIndex >= 0 && startOfArray) {
              console.log("Ist Teil eines Arrays", path, line, "arrayIndex", arrayIndex);
              yamlKeys.push({ path, index: column, lineOfPath: line, startOfArray, arrayIndex });
            } /* else if (arrayIndex && arrayIndex >= 0) {
              yamlKeys.push({ path, index: column, lineOfPath: line, arrayIndex });
            }*/ else {
              console.log("Ist kein Teil eines Arrays", path, line);
              yamlKeys.push({ path, index: column, lineOfPath: line });
            }
          }
        }
        if (DEVYAMLKEYS) {
          console.log("ursprung", object);
        }
        object.value.items.forEach((item: any) => {
          if (DEVYAMLKEYS) {
            console.log("itemGetKeys", item, arrayIndex);
          }
          if (
            item.value &&
            item.value.items &&
            item.value.items[0] &&
            item.value.items[0].start &&
            item.value.items[0].start[0]
          ) {
            if (arrayIndex >= 0 && startOfArray) {
              if (DEVYAMLKEYS) {
                console.log("arrayitem", [item], path);
              }
              getAllYamlPaths(document, [item], path, yamlKeys, arrayIndex, startOfArray);
            } else {
              if (DEVYAMLKEYS) {
                console.log("arrayitem2", [item], path);
              }
              getAllYamlPaths(document, [item], path, yamlKeys);
            }
          } else if (item && item.key && item.key.source) {
            const keyWithoutDot = item.key.source.replace(/\./g, "/");
            const path2 = `${path}.${keyWithoutDot}`;
            const line: number = getLineNumber(document, item.key.offset);
            const column: number = item.key.indent;
            if (line !== undefined && column !== undefined) {
              const existing = yamlKeys.find(
                (item) => item.path === path2 && item.lineOfPath === line
              );
              if (!existing) {
                if (arrayIndex >= 0 && startOfArray) {
                  console.log("2222", path2, line, "arrayIndex", arrayIndex);
                  yamlKeys.push({
                    path: path2,
                    index: column,
                    lineOfPath: line,
                    startOfArray,
                    arrayIndex,
                  });
                } /* else if (arrayIndex && arrayIndex >= 0) {
                  yamlKeys.push({ path: path2, index: column, lineOfPath: line, arrayIndex });
                } */ else {
                  console.log("1111", path2, line);
                  yamlKeys.push({ path: path2, index: column, lineOfPath: line });
                }
              }
            }

            if (item.value && item.value.items) {
              if (DEVYAMLKEYS) {
                console.log("item.value.items", item.value.items, path2);
              }
              if (arrayIndex >= 0 && startOfArray) {
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
        // Fall einzelner Key
      } else if (object && object.key && object.key.source) {
        if (DEVYAMLKEYS) {
          console.log("objectGetKeys", object);
        }
        const path: string = currentPath
          ? `${currentPath}.${object.key.source.replace(/\./g, "/")}`
          : object.key.source.replace(/\./g, "/");
        if (DEVYAMLKEYS) {
          console.log("object.key", object.key);
        }
        const line: number = getLineNumber(document, object.key.offset);
        const column: number = object.key.indent;
        if (line !== undefined && column !== undefined) {
          const existing = yamlKeys.find((item) => item.path === path && item.lineOfPath === line);
          if (!existing) {
            if (arrayIndex >= 0 && startOfArray) {
              console.log(
                "Einzelner Key als Teil eines Arrays",
                path,
                line,
                "arrayIndex",
                arrayIndex
              );
              yamlKeys.push({ path, index: column, lineOfPath: line, startOfArray, arrayIndex });
            } /*else if (arrayIndex && arrayIndex >= 0) {
              yamlKeys.push({ path, index: column, lineOfPath: line, arrayIndex });
            } */ else {
              console.log("Einzelner Key als kein Teil eines Arrays", path, line);
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
