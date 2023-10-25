import * as path from "path";
import * as vscode from "vscode";

/**
 * @returns all .gpkg files in a given directory and its subdirectories
 */
export async function listGpkgFilesInDirectory() {
  const workspaceFolders = vscode.workspace.workspaceFolders;

  if (!workspaceFolders || workspaceFolders.length <= 0) {
    return [];
  }

  try {
    const directoryUri = vscode.Uri.joinPath(workspaceFolders[0].uri, "resources/features");
    const directoryPath = path.posix.normalize(directoryUri.path);

    const allFiles = await readAllFilesInDirectory(directoryUri);

    const gpkgFiles: string[] = allFiles.filter((file: string) => path.extname(file) === ".gpkg");

    return gpkgFiles.map((file: string) => path.posix.relative(directoryPath, file));
  } catch (error) {
    return `Fehler beim Lesen des Verzeichnisses: ${error}`;
  }
}

async function readAllFilesInDirectory(directoryUri: any) {
  const files = await vscode.workspace.fs.readDirectory(directoryUri);
  let allFiles: string[] = [];

  for (const file of files) {
    const fileUri = vscode.Uri.joinPath(directoryUri, file[0]);

    if (file[1] === vscode.FileType.File) {
      allFiles.push(fileUri.path);
    } else if (file[1] === vscode.FileType.Directory) {
      const subDirectoryFiles = await readAllFilesInDirectory(fileUri);
      allFiles = allFiles.concat(subDirectoryFiles);
    }
  }

  return allFiles;
}
