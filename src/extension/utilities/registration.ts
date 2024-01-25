import { Disposable, ExtensionContext, TextDocument } from "vscode";
import { AllYamlKeys } from "./yaml";

export type Registration = (context: ExtensionContext) => Disposable[];

export type DocUpdate = (
  document: TextDocument,
  docUri: string,
  docHash: string,
  allYamlKeys: AllYamlKeys
) => Promise<void>;

export const register = (context: ExtensionContext, ...registrations: Registration[]) => {
  registrations.forEach((registration) =>
    registration(context).forEach((disposable) => context.subscriptions.push(disposable))
  );
};
