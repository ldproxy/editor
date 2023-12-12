import { findPathInDocument } from "./findPathInDoc";
import * as vscode from "vscode";

export function getAllYamlPaths(
  document: string,
  yamlObject: any,
  currentPath: string,
  yamlKeys: {
    path: string;
    index: number;
    lineOfPath: number;
    arrayIndex?: number;
  }[] = []
) {
  if (yamlObject && typeof yamlObject === "object") {
    yamlObject.forEach((object: any) => {
      console.log("objjjj22", object);
      if (
        object &&
        object.key &&
        object.key.value &&
        object.value &&
        object.value.items[0] &&
        object.value.items[0].start[0] &&
        object.value.items[0].start[0].source &&
        object.value.items[0].start[0].source === "-"
      ) {
        console.log("huhuuu");
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
          array.values.items.forEach((object2: any) => {
            const path: string = object.key.source
              ? `${object.key.source}.${object2.key.source}`
              : object2.key.source;
            const line: number = getLineNumber(document, object2.key.offset);
            const column: number = object2.key.indent;
            if (line !== undefined && column !== undefined) {
              const existing = yamlKeys.find((item) => item.path === path);
              if (!existing) {
                yamlKeys.push({ path, index: column, lineOfPath: line });
              }
            }
          });
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
        console.log("object.value.source", object.value.source);
        console.log("docuu", document);
        const path: string = currentPath
          ? `${currentPath}.${object.key.source}`
          : object.key.source;
        console.log("pathzz", object.key.source);
        const line: number = getLineNumber(document, object.key.offset);
        const column: number = object.key.indent;
        console.log("ccll", column, line);
        if (line !== undefined && column !== undefined) {
          const existing = yamlKeys.find((item) => item.path === path);
          console.log("eee", existing);
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
        console.log("wroong");
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
