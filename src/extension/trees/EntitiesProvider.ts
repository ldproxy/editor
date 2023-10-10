import * as vscode from "vscode";

export class EntitiesProvider implements vscode.TreeDataProvider<Entity> {
  constructor() {}

  getTreeItem(element: Entity): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: Entity): Promise<Entity[]> {
    if (element) {
      return [new Entity("vineyards", "HEALTHY", vscode.TreeItemCollapsibleState.None)];
    } else {
      return [
        new Entity("providers", "", vscode.TreeItemCollapsibleState.Expanded),
        new Entity("services", "", vscode.TreeItemCollapsibleState.Expanded),
      ];
    }
  }
}

class Entity extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly description: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(label, collapsibleState);
    this.tooltip = `${label}-${description}`;
  }
}
