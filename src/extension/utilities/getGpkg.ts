import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";

export function listGpkgFilesInDirectory() {
  try {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    let directory;
    let directoryPath =
      "C:\\Users\\p.zahnen\\Documents\\GitHub\\editor\\data\\resources\\features" || "";
    if (workspaceFolders && workspaceFolders.length > 0) {
      directory = workspaceFolders[0].uri.fsPath;
      directoryPath = path.join(directory, "resources/features");
    }
    const files = fs.readdirSync(directoryPath);

    const gpkgFiles = files.filter((file: any) => path.extname(file) === ".gpkg");

    return gpkgFiles;
  } catch (error) {
    console.error(`Fehler beim Lesen des Verzeichnisses: ${error}`);
    return [];
  }
}
