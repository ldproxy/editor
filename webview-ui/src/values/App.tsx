import {
  VSCodeTextField,
  VSCodeRadioGroup,
  VSCodeRadio,
  VSCodeButton,
} from "@vscode/webview-ui-toolkit/react";
import { useRecoilState, selector, useRecoilValue } from "recoil";

import { atomSyncString } from "../utilities/recoilSyncWrapper";
import { Response, Error, xtracfg } from "../utilities/xtracfgValues";
import { useEffect } from "react";
import { vscode } from "../utilities/vscode";
import Final from "./Final";

export const apiNameAtom = atomSyncString("apiName", "");
export const valueFileNameAtom = atomSyncString("valueFileName", "");
export const typeAtom = atomSyncString("type", "maplibre-styles");
export const workspaceAtom = atomSyncString("workspace", "");
export const successAtom = atomSyncString("success", "");
export const errorAtom = atomSyncString("error", "");

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
        if (message.response) {
          setSuccess(message.response.results[0].message);
          console.log("Message received from vscode", message.response.results[0].message);
        } else {
          setError(message.error);
          console.log("Message received from vscode", message.error);
        }
        break;
      default:
        console.log("Message received from vscode", message);
    }
  };

  const submitData = (data: valueData) => {
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
                onChange={(e) => {
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
                onChange={(e) => {
                  const target = e.target as HTMLInputElement;
                  if (target) {
                    setValueFileName(target.value);
                  }
                }}>
                Value Filename
              </VSCodeTextField>
            </section>
          </div>
          <div className="postgresWfsSubmit">
            <VSCodeButton className="submitButton" onClick={() => submitData(valueData)}>
              Next
            </VSCodeButton>
            {error && <div style={{ color: "red" }}>{error}</div>}
          </div>
        </main>
      </>
    );
  }
}

export default App;
