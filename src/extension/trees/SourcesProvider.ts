import * as vscode from "vscode";

export class SourcesProvider implements vscode.TreeDataProvider<Source> {
  constructor() {}

  getTreeItem(element: Source): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: Source): Promise<Source[]> {
    return [new Source("FS(.)", "ALL", vscode.TreeItemCollapsibleState.None)];
  }
}

class Source extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly description: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(label, collapsibleState);
    this.tooltip = `${label}-${description}`;
  }
}
