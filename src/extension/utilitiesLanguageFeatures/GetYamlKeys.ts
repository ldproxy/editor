import { findPathInDocument } from "./findPathInDoc";
import * as vscode from "vscode";

export function getAllYamlPaths(
  document: vscode.TextDocument,
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
    const keys: string[] = Object.keys(yamlObject);

    for (const key of keys) {
      const value = yamlObject[key];
      console.log("hhh", key, value);

      if (Array.isArray(value)) {
        const arrayPath = currentPath ? `${currentPath}.${key}` : key;
        const arrayResults = findPathInDocument(document, arrayPath);
        if (
          arrayResults &&
          arrayResults.column !== undefined &&
          arrayResults.lineOfPath !== undefined
        ) {
          const { column, lineOfPath } = arrayResults;
          //  yamlKeysHover = [{ path: arrayPath, index: column, lineOfPath: lineOfPath }];
          const existing = yamlKeys.find((item) => item.path === arrayPath);
          if (!existing) {
            yamlKeys.push({ path: arrayPath, index: column, lineOfPath: lineOfPath });
          }
        }

        if (value.length > 1) {
          for (let i = 0, length = value.length; i < length; i++) {
            const object = value[i];
            const keysOfObject = Object.keys(object);
            for (const keyOfObject of keysOfObject) {
              const path = currentPath
                ? `${currentPath}.${key}.${keyOfObject}`
                : `${key}.${keyOfObject}`;
              console.log("pathi", path);
              const results = findPathInDocument(document, path, object[keyOfObject]);
              console.log("results", results);
              if (results && results.column !== undefined && results.lineOfPath !== undefined) {
                const { column, lineOfPath } = results;

                // yamlKeysHover = [{ path, index: column, lineOfPath, arrayIndex: i }];
                const existing = yamlKeys.find(
                  (item) => item.path === path && item.arrayIndex === i
                );
                if (!existing) {
                  yamlKeys.push({ path, index: column, lineOfPath, arrayIndex: i });
                }
              }
            }
          }
        }
      } else if (typeof value !== "object" || value === null) {
        const path = currentPath ? `${currentPath}.${key}` : key;
        const results = findPathInDocument(document, path, value);
        if (results && results.column !== undefined && results.lineOfPath !== undefined) {
          const { column, lineOfPath } = results;

          const existing = yamlKeys.find((item) => item.path === path);
          if (!existing) {
            yamlKeys.push({ path, index: column, lineOfPath });
          }
        }
      } else if (value && typeof value === "object") {
        const path = currentPath ? `${currentPath}.${key}` : key;
        const results = findPathInDocument(document, path);
        if (results && results.column !== undefined && results.lineOfPath !== undefined) {
          const { column, lineOfPath } = results;

          // yamlKeysHover = [...yamlKeysHover, { path, index: column, lineOfPath }];
          const existing = yamlKeys.find((item) => item.path === path);
          if (!existing) {
            yamlKeys.push({ path, index: column, lineOfPath });
          }
        }
        getAllYamlPaths(document, value, path, yamlKeys);
      }
    }
  }
  yamlKeys.sort((a, b) => a.lineOfPath - b.lineOfPath);

  return yamlKeys;
}
