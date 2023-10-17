import * as path from "path";
import * as vscode from "vscode";

export async function listGpkgFilesInDirectory() {
  try {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    let directory;
    let directoryPath = "C:\\Users\\p.zahnen\\Documents\\GitHub\\editor\\data\\resources\\features";
    if (workspaceFolders && workspaceFolders.length > 0) {
      directory = workspaceFolders[0].uri.fsPath;
      directoryPath = path.join(directory, "\resources\features");
    }
    const files = await vscode.workspace.fs.readDirectory(vscode.Uri.file(directoryPath));

    const gpkgFiles = files
      .filter((file) => file[1] === vscode.FileType.File && path.extname(file[0]) === ".gpkg")
      .map((file) => file[0]);

    return gpkgFiles;
  } catch (error) {
    return `Fehler beim Lesen des Verzeichnisses: ${error}`;
  }
}
