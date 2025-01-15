import * as path from "path";
import * as vscode from "vscode";

let cancel = false;
export const setCancel = () => {
  cancel = true;
};

/**
 * @returns all APIs in a given services directory
 */
export async function listApisInDirectory() {
  const workspaceFolders = vscode.workspace.workspaceFolders;

  if (!workspaceFolders || workspaceFolders.length <= 0) {
    return ["No workspace folder..."];
  }

  try {
    const directoryUri = vscode.Uri.joinPath(workspaceFolders[0].uri, "entities/instances");
    const directoryPath = path.posix.normalize(directoryUri.path);

    const allFiles = await readAllFilesInDirectory(directoryUri);

    const serviceFiles: string[] = allFiles.filter((file: string) => {
      const relativePath = path.posix.relative(directoryPath, file);
      const pathParts = relativePath.split("/");

      const hasServicesBeforeLastPart = pathParts.slice(0, -1).includes("services");
      const doesNotContainDefaults = !relativePath.includes("defaults");

      return hasServicesBeforeLastPart && doesNotContainDefaults;
    });

    const ymlFiles = serviceFiles.filter((file: string) => file.endsWith(".yml"));

    return ymlFiles.map((file: string) => {
      const baseName = path.posix.basename(file);
      const nameWithoutExtension = path.parse(baseName).name;
      return nameWithoutExtension;
    });
  } catch (error) {
    return null;
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
