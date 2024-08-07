import {
  VSCodeTextField,
  VSCodeRadioGroup,
  VSCodeRadio,
  VSCodeButton,
} from "@vscode/webview-ui-toolkit/react";
import { useRecoilState, selector, useRecoilValue } from "recoil";

import { atomSyncBoolean, atomSyncString } from "../utilities/recoilSyncWrapper";
import { Response, Error, xtracfg } from "../utilities/xtracfgValues";
import { VSCodeProgressRing } from "@vscode/webview-ui-toolkit/react";
import { useEffect } from "react";
import { vscode } from "../utilities/vscode";
import Final from "./Final";

export const apiNameAtom = atomSyncString("apiName", "");
export const valueFileNameAtom = atomSyncString("valueFileName", "");
export const typeAtom = atomSyncString("type", "maplibre-styles");
export const workspaceAtom = atomSyncString("workspace", "");
export const successAtom = atomSyncString("success", "");
export const errorAtom = atomSyncString("error", "");
export const loadingAtom = atomSyncBoolean("loading", false);

export type valueData = {
  apiId: string;
  name: string;
  type: string;
  source: string;
  command: string;
};

export type BasicData = valueData & {
  subcommand: string;
};

function App() {
  const [apiName, setApiName] = useRecoilState(apiNameAtom);
  const [valueFileName, setValueFileName] = useRecoilState(valueFileNameAtom);
  const [type, setType] = useRecoilState(typeAtom);
  const [workspace, setWorkspace] = useRecoilState(workspaceAtom);
  const valueDataSelector = selector({
    key: "uniqueValueDataSelector_v1",
    get: ({ get }) => {
      const apiId = get(apiNameAtom);
      const name = get(valueFileNameAtom);
      const type = get(typeAtom);
      // const source = "/Users/pascal/Documents/ldproxy_mount";
      const source = workspace;
      const command = "autoValue";
      return {
        apiId,
        name,
        type,
        source,
        command,
      };
    },
  });
  const valueData = useRecoilValue<valueData>(valueDataSelector);
  const [success, setSuccess] = useRecoilState(successAtom);
  const [error, setError] = useRecoilState(errorAtom);
  const [loading, setLoading] = useRecoilState(loadingAtom);

  useEffect(() => {
    vscode.listen(handleVscode);

    vscode.postMessage({
      command: "onLoad",
      text: "onLoad",
    });
  }, []);

  const handleVscode = (message: any) => {
    switch (message.command) {
      case "setWorkspace":
        const workspaceRoot = message.workspaceRoot;

        console.log("workspace root:", workspaceRoot);

        setWorkspace(workspaceRoot);
        break;
      case "xtracfg":
        if (
          message &&
          message.response &&
          message.response.results[0] &&
          message.response.results[0].status === "SUCCESS"
        ) {
          setSuccess(message.response.results[0].message);
        } else if (message && message.error && message.error.notification)
          setError(message.error.notification);
        break;
      default:
        console.log("Message received from vscode", message);
    }
    setLoading(false);
  };

  const submitData = (data: valueData) => {
    setLoading(true);
    const basicData: BasicData = {
      ...data,
      subcommand: "generate",
    };

    xtracfg.send(basicData);
  };

  if (success) {
    return (
      <Final nameOfCreatedFile={valueFileName} workspace={workspace} apiId={apiName} type={type} />
    );
  } else {
    return (
      <>
        <main>
          <h3>Create new values</h3>
          <div className="input-container">
            <section className="component-example" style={{ marginBottom: "15px" }}>
              <VSCodeRadioGroup name="ValueType" value={type} orientation="vertical">
                <label slot="label">Value Type</label>
                <VSCodeRadio
                  id="MapLibreStyles"
                  value="maplibre-styles"
                  onChange={() => setType("maplibre-styles")}>
                  maplibre-style
                </VSCodeRadio>
              </VSCodeRadioGroup>
            </section>
            <section className="component-example" style={{ marginBottom: "10px" }}>
              <VSCodeTextField
                value={apiName}
                onInput={(e) => {
                  const target = e.target as HTMLInputElement;
                  if (target) {
                    setApiName(target.value);
                  }
                }}>
                Api Name
              </VSCodeTextField>
            </section>
            <section className="component-example" style={{ marginBottom: "15px" }}>
              <VSCodeTextField
                value={valueFileName}
                onInput={(e) => {
                  const target = e.target as HTMLInputElement;
                  if (target) {
                    setValueFileName(target.value);
                  }
                }}>
                Value Filename
              </VSCodeTextField>
            </section>
          </div>
          <div className="postgresWfsSubmit" style={{ display: "flex", alignItems: "center" }}>
            <VSCodeButton
              className="submitButton"
              onClick={() => submitData(valueData)}
              disabled={!apiName || !valueFileName}
              style={{ marginBottom: "15px", marginRight: "20px" }}>
              Next
            </VSCodeButton>
            {loading && (
              <VSCodeProgressRing
                style={{ marginBottom: "12px", width: "1.3em", height: "1.3em" }}
              />
            )}
          </div>
          {error && <div style={{ color: "red" }}>{error}</div>}
        </main>
      </>
    );
  }
}

export default App;
