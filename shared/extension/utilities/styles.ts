import * as path from "path";
import * as vscode from "vscode";
import { readAllFilesInDirectory } from "./gpkg";

export async function listStylesInDirectory() {
  const workspaceFolders = vscode.workspace.workspaceFolders;

  if (!workspaceFolders || workspaceFolders.length <= 0) {
    return { error: "No workspace folder..." };
  }

  try {
    const stylesDirectoryUri = vscode.Uri.joinPath(
      workspaceFolders[0].uri,
      "values/maplibre-styles"
    );

    const subDirectories = await vscode.workspace.fs.readDirectory(stylesDirectoryUri);
    const subDirectoryNames = subDirectories
      .filter(([name, type]) => type === vscode.FileType.Directory)
      .map(([name]) => name);

    const allFilesInSubDirectories: { [key: string]: string[] } = {};

    for (const subDir of subDirectoryNames) {
      const subDirUri = vscode.Uri.joinPath(stylesDirectoryUri, subDir);
      const subDirFiles = await readAllFilesInDirectory(subDirUri);
      const subDirCfgFiles: string[] = subDirFiles.filter(
        (file: string) => path.extname(file) === ".json"
      );
      allFilesInSubDirectories[subDir] = subDirCfgFiles;
    }

    return allFilesInSubDirectories;
  } catch (error) {
    return { error: "No Styles..." };
  }
}
