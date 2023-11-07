import React, { Suspense } from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { RecoilRoot } from "recoil";
import { RecoilSyncApp } from "./RecoilSync";

ReactDOM.render(
  <React.StrictMode>
    <RecoilRoot>
      <RecoilSyncApp>
        <Suspense fallback="loading...">
          <App />
        </Suspense>
      </RecoilSyncApp>
    </RecoilRoot>
  </React.StrictMode>,
  document.getElementById("root")
);
