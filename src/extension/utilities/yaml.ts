import * as vscode from "vscode";
import { md5 } from "js-md5";
import { DEV, DEVYAMLKEYS } from "./constants";
import { Parser } from "yaml";

interface YamlKey {
  path: string;
  index: number;
  lineOfPath: number;
  startOfArray?: number;
  arrayIndex?: number;
}

export interface AllYamlKeys extends Array<YamlKey> {}

export function parseYaml(document: string) {
  let allYamlKeys: AllYamlKeys = [];
  const yamlObject: any[] = [];

  for (const token of new Parser().parse(document)) {
    if (DEVYAMLKEYS) {
      console.log("token", token);
    }
    yamlObject.push(token);
  }

  allYamlKeys = [];
  allYamlKeys = getAllYamlPaths(document, yamlObject[0].value.items, "");
  if (DEV) {
    console.log("yamlKeysIndex", allYamlKeys);
  }
  return allYamlKeys;
}

function getAllYamlPaths(
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
      console.log("yamlObjectgYK", yamlObject);
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
        object.value.items[0].value.items[0]
      ) {
        // Hier wird der erste Teil des Pfades (z.B. api) gebaut:

        const originalNewPath: string = object.key.source.replace(/\./g, "/");
        let newPath: string = originalNewPath;
        let path: string = originalNewPath;
        let line: number = getLineNumber(document, object.key.offset);
        const column: number = object.key.indent;
        if (line !== undefined && column !== undefined) {
          // If there are illegitimate keys above our key (key without colon), then these aren't taken into account:
          let lineIncrease = 0;
          if (originalNewPath.includes("\n")) {
            const lines = originalNewPath.split("\n");
            lineIncrease = lines.length - 1;
            newPath = lines.pop()!.trim();
          }
          line += lineIncrease;

          path = currentPath ? `${currentPath}.${newPath}` : newPath;

          const existing = yamlKeys.find((item) => item.path === path && item.lineOfPath === line);
          if (!existing) {
            if (DEVYAMLKEYS) {
              console.log("99", path, line);
            }
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

                const originalNewPath: string = object2.key.source.replace(/\./g, "/");
                let newPath: string = originalNewPath;
                let line: number = getLineNumber(document, object2.key.offset);

                const column: number = object2.key.indent;
                if (line !== undefined && column !== undefined) {
                  let lineIncrease = 0;
                  if (originalNewPath.includes("\n")) {
                    const lines = originalNewPath.split("\n");
                    lineIncrease = lines.length - 1;
                    newPath = lines.pop()!.trim();
                  }
                  line += lineIncrease;
                  const path2: string = `${path}.${newPath}`;
                  if (DEVYAMLKEYS) {
                    console.log("88", path2, line);
                  }

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
                // Wenn der Array noch ein Array oder Objekt enthält (nicht key/value, das wäre nur object2.value):
                if (
                  object2.value &&
                  object2.value.items &&
                  object2.value.items[0] &&
                  startOfArray &&
                  arrayIndex >= 0
                ) {
                  if (DEVYAMLKEYS) {
                    console.log("77object2", [object2], path);
                  }
                  getAllYamlPaths(document, [object2], path, yamlKeys, arrayIndex, startOfArray);
                }
              }
            });
          }
        });
        // Fall Objekt (Genau wie Fall Array aufgebaut)
      } else if (
        object &&
        object.key &&
        typeof object.key === "object" &&
        "source" in object.key &&
        object.value &&
        !object.value.source &&
        object.value.items[0]
      ) {
        let originalNewPath = object.key.source.replace(/\./g, "/");
        let newPath = originalNewPath;
        let path: string = originalNewPath;
        let line: number = getLineNumber(document, object.key.offset);
        const column: number = object.key.indent;

        if (line !== undefined && column !== undefined) {
          // If there are illegitimate keys above our key (key without colon), then these aren't taken into account:
          let lineIncrease = 0;
          if (originalNewPath.includes("\n")) {
            const lines = originalNewPath.split("\n");
            lineIncrease = lines.length - 1;
            newPath = lines.pop().trim();
          }
          line += lineIncrease;
          path = currentPath ? `${currentPath}.${newPath}` : newPath;

          const existing = yamlKeys.find((item) => item.path === path && item.lineOfPath === line);
          if (!existing) {
            if (arrayIndex >= 0 && startOfArray) {
              if (DEVYAMLKEYS) {
                console.log("Ist Teil eines Arrays", path, line, "arrayIndex", arrayIndex);
              }
              yamlKeys.push({ path, index: column, lineOfPath: line, startOfArray, arrayIndex });
            } else {
              if (DEVYAMLKEYS) {
                console.log("Ist kein Teil eines Arrays", path, line);
              }
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
          if (item && item.key && item.key.source) {
            const keyWithoutDot = item.key.source.replace(/\./g, "/");
            let newPath: string = keyWithoutDot;
            let path2: string = keyWithoutDot;
            let line: number = getLineNumber(document, item.key.offset);
            const column: number = item.key.indent;
            if (line !== undefined && column !== undefined) {
              let lineIncrease = 0;
              if (keyWithoutDot.includes("\n")) {
                const lines = keyWithoutDot.split("\n");
                lineIncrease = lines.length - 1;
                newPath = lines.pop()!.trim();
              }
              line += lineIncrease;
              path2 = `${path}.${newPath}`;

              const existing = yamlKeys.find(
                (item) => item.path === path2 && item.lineOfPath === line
              );
              if (!existing) {
                if (arrayIndex >= 0 && startOfArray) {
                  if (DEVYAMLKEYS) {
                    console.log("2222", path2, line, "arrayIndex", arrayIndex);
                  }
                  yamlKeys.push({
                    path: path2,
                    index: column,
                    lineOfPath: line,
                    startOfArray,
                    arrayIndex,
                  });
                } else {
                  if (DEVYAMLKEYS) {
                    console.log("1111", path2, line);
                  }
                  yamlKeys.push({ path: path2, index: column, lineOfPath: line });
                }
              }
            }

            // Wenn das Objekt noch ein Objekt oder Array enthält:
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
        // Fall einzelner Key (Funktion wird hier nicht nochmal aufgerufen, der Key wird einfach eingetragen)
      } else if (object && object.key && object.key.source) {
        if (DEVYAMLKEYS) {
          console.log("objectGetKeys", object);
        }

        const originalNewPath = object.key.source.replace(/\./g, "/");
        let newPath: string = originalNewPath;

        let line: number = getLineNumber(document, object.key.offset);
        const column: number = object.key.indent;
        if (line !== undefined && column !== undefined) {
          let lineIncrease = 0;
          if (originalNewPath.includes("\n")) {
            const lines = originalNewPath.split("\n");
            lineIncrease = lines.length - 1;
            newPath = lines.pop()!.trim();
          }
          line += lineIncrease;
          const path: string = currentPath ? `${currentPath}.${newPath}` : newPath;
          if (DEVYAMLKEYS) {
            console.log("object.key", object.key, currentPath, newPath);
          }

          const existing = yamlKeys.find((item) => item.path === path && item.lineOfPath === line);
          if (!existing) {
            if (arrayIndex >= 0 && startOfArray) {
              if (DEVYAMLKEYS) {
                console.log("Kommt das vor?", path, line, "arrayIndex", arrayIndex);
              }
              yamlKeys.push({ path, index: column, lineOfPath: line, startOfArray, arrayIndex });
            } else {
              if (DEVYAMLKEYS) {
                console.log("Einzelner Key als kein Teil eines Arrays", path, line);
              }
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
export function getLinesForArrayIndex(
  allYamlKeys: {
    path: string;
    index: number;
    lineOfPath: number | null;
    startOfArray?: number;
    arrayIndex?: number;
  }[],
  index: number,
  path: string
): number | undefined {
  let line: number = 0;
  const pathToUse = path.replace(/\[\d+\]/g, "");

  for (const obj of allYamlKeys) {
    if (obj.startOfArray && obj.arrayIndex === index && obj.path === pathToUse) {
      line = obj.startOfArray;
    }
  }
  if (DEV) {
    console.log("lineYamlArrays", line);
    console.log("pathiToUse", pathToUse);
  }

  if (line > 0) {
    return line;
  }
}
export function getMaxLine(
  allYamlKeys: {
    path: string;
    index: number;
    lineOfPath: number | undefined;
    startOfArray?: number;
    arrayIndex?: number;
  }[],
  minLine: number,
  document: vscode.TextDocument
): number | undefined {
  let myItem:
    | {
        path: string;
        index: number;
        lineOfPath: number | undefined;
        startOfArray?: number;
        arrayIndex?: number;
      }
    | undefined = undefined;
  while (!myItem) {
    myItem = allYamlKeys.find((item) => item.lineOfPath === minLine);
    minLine++;
  }
  let startIndex = 0;
  if (myItem) {
    startIndex = allYamlKeys.findIndex((item) => item === myItem);
  }

  if (startIndex > 0) {
    for (let i = startIndex; i < allYamlKeys.length; i++) {
      const currentItem = allYamlKeys[i];
      if (DEV) {
        console.log("currentItem", currentItem);
        console.log("startIndex", startIndex, myItem);
      }

      let lineOfHyphenBeforeCurrentItem = -1;
      if (currentItem && currentItem.lineOfPath) {
        for (let lineIndex = minLine; lineIndex < currentItem.lineOfPath; lineIndex++) {
          const line = document.lineAt(lineIndex).text;
          const hyphenIndex = line.indexOf("-");
          if (DEV) {
            console.log("IndexYaml1", lineIndex, hyphenIndex);
          }
          if (hyphenIndex !== -1 && hyphenIndex <= myItem.index - 2) {
            if (DEV) {
              console.log("IndexYaml", lineIndex, hyphenIndex);
            }
            lineOfHyphenBeforeCurrentItem = lineIndex;
          }
        }
      }

      if (lineOfHyphenBeforeCurrentItem !== -1) {
        return lineOfHyphenBeforeCurrentItem;
      } else if (
        (myItem && currentItem.startOfArray !== myItem.startOfArray) ||
        (myItem && !currentItem.hasOwnProperty("arrayIndex")) ||
        (myItem && i === allYamlKeys.length - 1)
      ) {
        if (DEV) {
          console.log("iiii", i);
        }
        if (i === allYamlKeys.length - 1 && currentItem && currentItem.lineOfPath) {
          if (DEV) {
            console.log("landet hier", currentItem.lineOfPath);
          }
          return currentItem.lineOfPath + 2;
        } else if (currentItem.startOfArray) {
          return currentItem.startOfArray;
        } else if (currentItem.lineOfPath) {
          return currentItem.lineOfPath;
        }
      }
    }
  }
}
export function extractIndexFromPath(path: string): number | null {
  const regex = /\[(\d+)\]/;

  const match = path.match(regex);
  if (DEV) {
    console.log("match", match);
  }
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }

  return null;
}

export function hashDoc(document?: vscode.TextDocument): string {
  if (document) {
    return hashText(document.getText());
  }

  return "";
}

export function hashText(text?: string): string {
  if (text && text !== "") {
    const hashString = md5(text);
    if (DEV) {
      console.log("Hash:", hashString);
    }

    return hashString;
  }

  return "";
}

export function getIndentation(yamlString: string) {
  const lines = yamlString.split("\n");
  for (let line of lines) {
    const match = line.match(/^(\s+)\S/);
    if (match) {
      return match[1].length;
    }
  }
  return 2; // Default to 2 if no indentation is found yet
}

export function indentationOfYamlObjectAboveCursor(
  allYamlKeys: {
    path: string;
    index: number;
    lineOfPath: number | undefined;
    startOfArray?: number;
    arrayIndex?: number;
  }[],
  line: number,
  pathAtCursor: string | undefined
) {
  let myItem:
    | {
        path: string;
        index: number;
        lineOfPath: number | undefined;
        startOfArray?: number;
        arrayIndex?: number;
      }
    | undefined = undefined;
  console.log("line", line);
  while (!myItem && line > 0) {
    myItem = allYamlKeys.find((item) => item.lineOfPath === line - 1 && item.path === pathAtCursor);
    line--;
  }
  let indentationOfPropertyAbove = 0;
  if (myItem) {
    indentationOfPropertyAbove = myItem.index;
  }

  return indentationOfPropertyAbove;
}
