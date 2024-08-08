import {
  VSCodeTextField,
  VSCodeRadioGroup,
  VSCodeRadio,
  VSCodeButton,
} from "@vscode/webview-ui-toolkit/react";
import { useRecoilState, selector, useRecoilValue } from "recoil";

import { atomSyncBoolean, atomSyncObject, atomSyncString } from "../utilities/recoilSyncWrapper";
import { Response, Error, xtracfg } from "../utilities/xtracfgValues";
import { VSCodeProgressRing } from "@vscode/webview-ui-toolkit/react";
import { useEffect } from "react";
import { vscode } from "../utilities/vscode";
import Final from "./Final";
import CollectionTables, { TableData } from "./CollectionTables";

export const apiNameAtom = atomSyncString("apiName", "");
export const valueFileNameAtom = atomSyncString("valueFileName", "");
export const typeAtom = atomSyncString("type", "maplibre-styles");
export const workspaceAtom = atomSyncString("workspace", "");
export const successAtom = atomSyncString("success", "");
export const errorAtom = atomSyncString("error", "");
export const loadingAtom = atomSyncBoolean("loading", false);
export const details = atomSyncObject<TableData>("details", {});
export const collections = atomSyncObject<Response>("collections", {});

export type valueData = {
  apiId: string;
  name: string;
  type: string;
  source: string;
  command: string;
  collectionColors?: string;
};

export type BasicData = valueData & {
  subcommand: string;
};

function App() {
  const [apiName, setApiName] = useRecoilState(apiNameAtom);
  const [valueFileName, setValueFileName] = useRecoilState(valueFileNameAtom);
  const [type, setType] = useRecoilState(typeAtom);
  const [workspace, setWorkspace] = useRecoilState(workspaceAtom);
  const DEV = false;
  const valueDataSelector = selector({
    key: "uniqueValueDataSelector_v1",
    get: ({ get }) => {
      const apiId = get(apiNameAtom);
      const name = get(valueFileNameAtom);
      const type = get(typeAtom);
      // const source = "/Users/pascal/Documents/ldproxy_mount";
      const source = workspace;
      const command = "autoValue";
      if (DEV) {
        const collectionColors = "TEST";
      }
      const collectionColors = JSON.stringify(get(collections));

      return {
        apiId,
        name,
        type,
        source,
        command,
        collectionColors,
      };
    },
  });
  const valueData = useRecoilValue<valueData>(valueDataSelector);
  const [success, setSuccess] = useRecoilState(successAtom);
  const [error, setError] = useRecoilState(errorAtom);
  const [loading, setLoading] = useRecoilState(loadingAtom);
  const [resultDetails, setResultDetails] = useRecoilState<TableData>(details);
  const [collectionColors, setCollectionColors] = useRecoilState(collections);

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
          message.response.details &&
          typeof message.response.details === "object" &&
          Object.keys(message.response.details).length > 0 &&
          message.response.details["Collection Colors"]
        ) {
          const collections = message.response.details["Collection Colors"];
          setResultDetails(collections);
          console.log("details", collections);
        } else if (
          message &&
          message.response &&
          message.response.results[0] &&
          message.response.results[0].status === "SUCCESS" &&
          message.response.results[0].message
        ) {
          setSuccess(message.response.results[0].message);
        } else if (message && message.error && message.error.notification) {
          setError(message.error.notification);
        } else if (message && message.error) {
          if (typeof message.error === "string") {
            setError(message.error);
          } else if (message.error.error) {
            setError(message.error.error);
          }
        }
        break;
      default:
        console.log("Message received from vscode", message);
    }
    setLoading(false);
  };

  // step 1: analyze
  const submitData = (data: valueData) => {
    setLoading(true);
    const basicData: BasicData = {
      ...data,
      subcommand: "analyze",
    };

    xtracfg.send(basicData);
  };

  // step 2: generate
  const generate = (collectionColors: object) => {
    setLoading(true);
    const basicData: BasicData = {
      apiId: apiName,
      name: valueFileName,
      type,
      source: workspace,
      command: "autoValue",
      collectionColors: JSON.stringify(collectionColors),
      subcommand: "generate",
    };

    xtracfg.send(basicData);
  };

  useEffect(() => {
    console.log("dudu", collectionColors, success, Object.keys(collectionColors).length === 0);
    console.log("bla", resultDetails);
  }, [collectionColors, success, resultDetails]);

  if (
    resultDetails &&
    Object.keys(resultDetails).length > 0 &&
    Object.keys(collectionColors).length === 0
  ) {
    return (
      <CollectionTables
        generate={generate}
        details={resultDetails}
        success={success}
        error={error}
        setCollectionColors={setCollectionColors}
      />
    );
  } else if (success && collectionColors && Object.keys(collectionColors).length !== 0) {
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
