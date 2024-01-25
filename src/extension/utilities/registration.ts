import { Disposable, ExtensionContext } from "vscode";

export type Registration = (context: ExtensionContext) => Disposable[];

export const register = (context: ExtensionContext, ...registrations: Registration[]) => {
  registrations.forEach((registration) =>
    registration(context).forEach((disposable) => context.subscriptions.push(disposable))
  );
};
