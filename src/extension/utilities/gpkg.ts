import * as path from "path";
import * as vscode from "vscode";

let cancel = false;
export const setCancel = () => {
  cancel = true;
};

/**
 * @returns all .gpkg files in a given directory and its subdirectories
 */
export async function listGpkgFilesInDirectory() {
  const workspaceFolders = vscode.workspace.workspaceFolders;

  if (!workspaceFolders || workspaceFolders.length <= 0) {
    return ["No workspace folder..."];
  }

  try {
    const directoryUri = vscode.Uri.joinPath(workspaceFolders[0].uri, "resources/features");
    const directoryPath = path.posix.normalize(directoryUri.path);

    const allFiles = await readAllFilesInDirectory(directoryUri);

    const gpkgFiles: string[] = allFiles.filter((file: string) => path.extname(file) === ".gpkg");

    return gpkgFiles.map((file: string) => path.posix.relative(directoryPath, file));
  } catch (error) {
    return ["No Geopackages..."];
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

export async function uploadedGpkg(gpkgToUpload: any, filename: string, action?: string) {
  cancel = false;

  const cancelPromise = new Promise((resolve, reject) => {
    const intervalId = setInterval(() => {
      if (cancel) {
        clearInterval(intervalId);
        reject(new Error("Operation was cancelled"));
      }
    }, 2000);
  });

  const uploadPromise = (async () => {
    const binaryString = atob(gpkgToUpload);

    const uint8Array = new Uint8Array(binaryString.length);

    for (let i = 0; i < binaryString.length; i++) {
      uint8Array[i] = binaryString.charCodeAt(i);
    }

    const workspaceFolders = vscode.workspace.workspaceFolders;

    if (workspaceFolders && workspaceFolders[0]) {
      const directoryUri = vscode.Uri.joinPath(workspaceFolders[0].uri, "resources/features");

      const filePath = vscode.Uri.joinPath(directoryUri, filename);

      if (action === "appendTrue" && filePath) {
        try {
          await vscode.workspace.fs.stat(filePath);

          // Read the existing file
          const existingData = await vscode.workspace.fs.readFile(filePath);

          // Concatenate the new data to the existing data
          const combinedData = new Uint8Array(existingData.length + uint8Array.length);
          combinedData.set(existingData);
          combinedData.set(uint8Array, existingData.length);

          // Write the combined data back to the file
          await vscode.workspace.fs.writeFile(filePath, combinedData);
          return `Datei erfolgreich erweitert: ${filePath.fsPath}`;
        } catch (error) {
          return `Error appending to Geopackage. ${error}${filePath.fsPath}`;
        }
      } else if (action !== "appendTrue") {
        try {
          await vscode.workspace.fs.createDirectory(directoryUri);
          try {
            await vscode.workspace.fs.stat(filePath);
            return `Geopackage already exists.`;
          } catch {
            if (cancel) {
              return;
            }
            await vscode.workspace.fs.writeFile(filePath, uint8Array);
            return `Datei erfolgreich geschrieben: ${filePath.fsPath}`;
          }
        } catch (error) {
          return `Error uploading Geopackage. ${error}`;
        }
      }
    }
  })();

  try {
    const result = await Promise.race([uploadPromise, cancelPromise]);
    if (cancel) {
      const directoryUri = vscode.Uri.joinPath(
        vscode.workspace.workspaceFolders
          ? vscode.workspace.workspaceFolders[0].uri
          : vscode.Uri.file(""),
        "resources/features"
      );
      const filePath = vscode.Uri.joinPath(directoryUri, filename);
      if (filePath) {
        try {
          await vscode.workspace.fs.stat(filePath);
          await vscode.workspace.fs.delete(filePath);
          //  await vscode.workspace.fs.delete(directoryUri, { recursive: true });
        } catch (error) {
          console.log(`File not created yet: ${filePath}`);
        }
      }
    }
    console.log("resultBackend", result);
    return result;
  } finally {
    cancel = false;
  }
}
