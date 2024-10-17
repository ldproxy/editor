import * as vscode from "vscode";
import { Registration } from "../utilities/registration";

// First tests for code actions
export const registerCodeActions: Registration = () => {
  return [
    /*vscode.languages.registerCodeActionsProvider("yaml", new Emojinfo(), {
      providedCodeActionKinds: Emojinfo.providedCodeActionKinds,
    }),
    vscode.commands.registerCommand("code-actions-sample.command", () =>
      vscode.env.openExternal(
        vscode.Uri.parse("https://unicode.org/emoji/charts-12.0/full-emoji-list.html")
      )
    ),*/
  ];
};

class Emojinfo implements vscode.CodeActionProvider {
  public static readonly providedCodeActionKinds = [vscode.CodeActionKind.QuickFix];

  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext,
    token: vscode.CancellationToken
  ): vscode.CodeAction[] {
    return context.diagnostics.map((diagnostic) => this.createCommandCodeAction(diagnostic));
  }

  private createCommandCodeAction(diagnostic: vscode.Diagnostic): vscode.CodeAction {
    const action = new vscode.CodeAction("Learn more...", vscode.CodeActionKind.QuickFix);
    action.command = {
      command: "code-actions-sample.command",
      title: "Learn more about emojis",
      tooltip: "This will open the unicode emoji page.",
    };
    action.diagnostics = [diagnostic];
    action.isPreferred = true;
    return action;
  }
}
