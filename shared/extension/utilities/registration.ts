import { Disposable, ExtensionContext, TextDocument } from "vscode";
import { AllYamlKeys } from "./yaml";

export type Registration = (context: ExtensionContext, transport: any) => Disposable[];

export type DocUpdate = (
  event: DocEvent,
  document: TextDocument,
  docUri: string,
  docHash: string,
  allYamlKeys: AllYamlKeys,
  transport: any
) => Promise<void>;

/* eslint-disable @typescript-eslint/naming-convention*/
export enum DocEvent {
  OPEN,
  CHANGE,
  SAVE,
}
/* eslint-enable @typescript-eslint/naming-convention*/

export const register = (
  context: ExtensionContext,
  transport: any,
  ...registrations: Registration[]
) => {
  registrations.forEach((registration) =>
    registration(context, transport).forEach((disposable) => context.subscriptions.push(disposable))
  );
};
