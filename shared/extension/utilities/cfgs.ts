import * as path from "path";
import * as vscode from "vscode";
import { readAllFilesInDirectory } from "./gpkg";

export async function listCfgFilesInDirectory() {
  const workspaceFolders = vscode.workspace.workspaceFolders;

  if (!workspaceFolders || workspaceFolders.length <= 0) {
    return ["No workspace folder..."];
  }

  try {
    const providerDirectoryUri = vscode.Uri.joinPath(
      workspaceFolders[0].uri,
      "entities/instances/providers"
    );
    const serviceDirectoryUri = vscode.Uri.joinPath(
      workspaceFolders[0].uri,
      "entities/instances/services"
    );

    const providerDirectoryPath = path.posix.normalize(providerDirectoryUri.path);
    const serviceDirectoryPath = path.posix.normalize(serviceDirectoryUri.path);

    const providerFiles = await readAllFilesInDirectory(providerDirectoryUri);
    const serviceFiles = await readAllFilesInDirectory(serviceDirectoryUri);

    const providerCfgFiles: string[] = providerFiles.filter(
      (file: string) => path.extname(file) === ".yml"
    );
    const serviceCfgFiles: string[] = serviceFiles.filter(
      (file: string) => path.extname(file) === ".yml"
    );

    const providerResults = providerCfgFiles.map(
      (file: string) => `${path.posix.relative(providerDirectoryPath, file)} (provider)`
    );
    const serviceResults = serviceCfgFiles.map(
      (file: string) => `${path.posix.relative(serviceDirectoryPath, file)} (service)`
    );

    return [...providerResults, ...serviceResults];
  } catch (error) {
    return ["No Configurations..."];
  }
}
