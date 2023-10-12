import * as vscode from "vscode";

export class SourcesProvider implements vscode.TreeDataProvider<Source> {
  constructor() {}

  getTreeItem(element: Source): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: Source): Promise<Source[]> {
    if (element) {
      return [new Source("entities", "11", vscode.TreeItemCollapsibleState.None, "folder")];
    } else {
      return [
        new Source("FS(.)", "ALL", vscode.TreeItemCollapsibleState.Expanded, "source")
      ];
    }
  }
}

class Source extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly description: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly contextValue: string,
  ) {
    super(label, collapsibleState);
    this.tooltip = `${label}-${description}`;
  }
}
