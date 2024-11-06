import React, { Suspense } from "react";
import ReactDOM from "react-dom";
import AppEntities from "./entities/App";
import AppValues from "./values/App";
import { RecoilRoot, DefaultValue } from "recoil";
import { RecoilSync } from "recoil-sync";
import { vscode } from "./utilities/vscode";
import { DEBUG_RECOIL } from "./utilities/constants";

const DEFAULT_VALUE = new DefaultValue();

const rootDiv = document.getElementById("root");
const createValues = rootDiv?.getAttribute("data-create-values") === "true";

const App = createValues ? AppValues : AppEntities;

ReactDOM.render(
  <React.StrictMode>
    <RecoilRoot>
      <RecoilSync
        storeKey="StoreA"
        read={(key) => {
          const state = vscode.getState();
          const value = state[key] || DEFAULT_VALUE;

          if (DEBUG_RECOIL) {
            console.log("RECOIL getting key", key, state, value);
          }

          return value;
        }}
        write={({ diff }) => {
          const state = vscode.getState();
          const newState = { ...state, ...Object.fromEntries(diff) };

          if (DEBUG_RECOIL) {
            console.log("RECOIL writing diff", diff, state, newState);
          }

          vscode.setState(newState);
        }}>
        <Suspense fallback="loading...">
          <App />
        </Suspense>
      </RecoilSync>
    </RecoilRoot>
  </React.StrictMode>,
  rootDiv
);
