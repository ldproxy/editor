import * as vscode from "vscode";
import { DEV } from "../utilities/constants";
import { md5 } from "js-md5";

export function hash(document?: vscode.TextDocument): string {
  if (document) {
    const text = document.getText();
    if (text !== "") {
      const hashString = md5(text);
      if (DEV) {
        console.log("Hash:", hashString, text);
      }

      return hashString;
    }
  }
  return "";
}
