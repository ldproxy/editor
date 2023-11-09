import * as vscode from "vscode";

export async function uploadedGpkg(gpkgToUpload: any, filename: string) {
  const binaryString = atob(gpkgToUpload);

  const uint8Array = new Uint8Array(binaryString.length);

  for (let i = 0; i < binaryString.length; i++) {
    uint8Array[i] = binaryString.charCodeAt(i);
  }

  const workspaceFolders = vscode.workspace.workspaceFolders;

  if (workspaceFolders && workspaceFolders[0]) {
    const directoryUri = vscode.Uri.joinPath(workspaceFolders[0].uri, "resources/features");

    const filePath = vscode.Uri.joinPath(directoryUri, filename);

    try {
      await vscode.workspace.fs.writeFile(filePath, uint8Array);
      return `Datei erfolgreich geschrieben: ${filePath.fsPath}`;
    } catch (error) {
      return `Fehler beim Schreiben der Datei. ${error}`;
    }
  }
}
