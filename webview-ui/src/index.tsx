import React, { Suspense } from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { RecoilRoot, DefaultValue } from "recoil";
import { RecoilSync } from "recoil-sync";
import { vscode } from "./utilities/vscode";

const DEFAULT_VALUE = new DefaultValue();

ReactDOM.render(
  <React.StrictMode>
    <RecoilRoot>
      <RecoilSync
        storeKey="StoreA"
        read={(key) => {
          const state = vscode.getState();
          const value = state[key] || DEFAULT_VALUE;
          console.log("getting key", key, state, value);

          return value;
        }}
        write={({ diff }) => {
          const state = vscode.getState();
          const newState = { ...state, ...Object.fromEntries(diff) };
          console.log("writing diff", diff, state, newState);

          vscode.setState(newState);
        }}>
        <Suspense fallback="loading...">
          <App />
        </Suspense>
      </RecoilSync>
    </RecoilRoot>
  </React.StrictMode>,
  document.getElementById("root")
);
