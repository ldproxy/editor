import { DEV } from "./constants";
import { vscode } from "./vscode";

type BasicData = {
  apiId: string;
  name: string;
  type: string;
  source: string;
  command: string;
  subcommand: string;
};

export type Response = {
  error?: string;
  details?: {
    key: string;
    collectionColors: object;
  };
  results?: Array<{ status: string; message: string }>;
};

export type Error = {
  notification?: string;
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
