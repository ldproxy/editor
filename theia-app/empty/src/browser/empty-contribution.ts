import { injectable } from "@theia/core/shared/inversify";
/*
import {
  MenuContribution,
  MenuModelRegistry,
} from "@theia/core/lib/common/menu";
 */
import { WorkspaceCommands } from "@theia/workspace/lib/browser";
import {
  MenuContribution,
  MenuModelRegistry,
  CommandContribution,
} from "@theia/core/lib/common";
import { CommandRegistry } from "@theia/core";
import { CommonCommands } from "@theia/core/lib/browser";

// Damit Änderungen angewendet werden, erst yarn run prepare, dann build:browser bzw bundle
// und dann yarn run startPlugin

// Command IDs von VSC bzw Theia, die unten verwendet werden
// https://github.com/eclipse-theia/theia/blob/master/packages/terminal/src/browser/terminal-frontend-contribution.ts

@injectable()
export class HideAboutMenuContribution
  implements CommandContribution, MenuContribution
{
  registerCommands(commandRegistry: CommandRegistry): void {
    /* Alle registrierten Commands ausgeben:
    setTimeout(() => {
      for (const command of commandRegistry.commands.values()) {
        if (command && command.id) {
          console.log("Registered command:", command.id);
        }
      }
    }, 5000); 
    */

    // Commands (aus palette: fn + f1) löschen:
    commandRegistry.unregisterCommand(
      "workbench.action.openWorkspaceSettingsFile"
    );
    commandRegistry.unregisterCommand(
      "workbench.action.openFolderSettingsFile"
    );
    commandRegistry.unregisterCommand("file-search.openFile");
    commandRegistry.unregisterCommand("workbench.action.files.openFileFolder");
    commandRegistry.unregisterCommand("workbench.action.files.openFile");
    commandRegistry.unregisterCommand("workbench.action.files.openFolder");
    commandRegistry.unregisterCommand(
      "workbench.action.openWorkspaceConfigFile"
    );
    commandRegistry.unregisterCommand("file.newFile");
    commandRegistry.unregisterCommand("file.newFolder");
    commandRegistry.unregisterCommand("explorer.newFolder");
    commandRegistry.unregisterCommand("workbench.action.files.newUntitledFile");
    commandRegistry.unregisterCommand("workbench.action.files.pickNewFile");
    commandRegistry.unregisterCommand(CommonCommands.OPEN);
    commandRegistry.unregisterCommand(CommonCommands.NEW_FILE);
    commandRegistry.unregisterCommand(WorkspaceCommands.OPEN);
    commandRegistry.unregisterCommand(WorkspaceCommands.OPEN_FILE);
    commandRegistry.unregisterCommand(WorkspaceCommands.OPEN_FOLDER);
    commandRegistry.unregisterCommand(WorkspaceCommands.OPEN_RECENT_WORKSPACE);
    commandRegistry.unregisterCommand(WorkspaceCommands.OPEN_WORKSPACE);
    commandRegistry.unregisterCommand(WorkspaceCommands.OPEN_WORKSPACE_FILE);
    commandRegistry.unregisterCommand("core.open");
    commandRegistry.unregisterCommand("terminal:new");
    commandRegistry.unregisterCommand("terminal:new:profile");
    commandRegistry.unregisterCommand("terminal:profile:default");
    commandRegistry.unregisterCommand("terminal:new:active:workspace");
    commandRegistry.unregisterCommand("terminal:clear");
    commandRegistry.unregisterCommand("terminal:context");
    commandRegistry.unregisterCommand("terminal:split");
    commandRegistry.unregisterCommand("terminal:find");
    commandRegistry.unregisterCommand("terminal:find:cancel");
    commandRegistry.unregisterCommand(
      "workbench.action.terminal.toggleTerminal"
    );
    commandRegistry.unregisterCommand("workbench.action.showAllTerminals");
    commandRegistry.unregisterCommand("workbench.action.view.showAllTerminals");
  }

  // UI Menüpunkte zu entfernen
  registerMenus(menus: MenuModelRegistry): void {
    menus.unregisterMenuAction(WorkspaceCommands.OPEN_RECENT_WORKSPACE);
    menus.unregisterMenuAction(WorkspaceCommands.OPEN_WORKSPACE);
    menus.unregisterMenuAction(WorkspaceCommands.ADD_FOLDER);
    menus.unregisterMenuAction(WorkspaceCommands.NEW_FILE.id);
    menus.unregisterMenuAction(WorkspaceCommands.OPEN);
    menus.unregisterMenuAction(WorkspaceCommands.OPEN_FILE);

    //Terminal:
    menus.unregisterMenuAction("terminal:new");
    menus.unregisterMenuAction("terminal:toggle");
    menus.unregisterMenuAction("terminal:kill");
    menus.unregisterMenuAction("terminal:clear");
    menus.unregisterMenuAction("terminal:split");
    menus.unregisterMenuAction("terminal:copySelection");
    menus.unregisterMenuAction("terminal:paste");
    menus.unregisterMenuAction("terminal:newWithProfile");
    menus.unregisterMenuAction("terminal:newWithProfileInstance");

    //Hiermit werden die Ober-Menüpunkte komplett entfernt:
    menus.unregisterMenuAction("7_terminal");
  }
}
