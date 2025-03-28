import { DEV } from "./constants";
import { vscode } from "./vscode";

export type SchemaTables = {
  [schema: string]: string[];
};

export type BasicData = {
  command?: string;
  subcommand?: string;
  source?: string;
  id?: string;
  types?: SchemaTables;
  featureProviderType?: string;
  verbose?: boolean;
  debug?: boolean;
};

export type Response = {
  error?: string;
  details?: {
    types?: SchemaTables;
    new_files?: string[];
    currentTable?: string;
    currentCount?: number;
    targetCount?: number;
    progress?: SchemaTables;
  };
  results?: Array<{ status: string; message: string }>;
};

export type Error = {
  notification?: string;
  fields?: {
    [key: string]: string;
  };
};

export const xtracfg = {
  send: sendCmd,
};

function sendCmd(data: BasicData) {
  const cmd = JSON.stringify(data);

  if (DEV) {
    console.log("sending to xtracfg", cmd);
  }

  vscode.postMessage({
    command: "xtracfg",
    request: cmd,
  });
}
