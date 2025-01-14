import {
  VSCodeTextField,
  VSCodeRadioGroup,
  VSCodeRadio,
  VSCodeButton,
  VSCodeDropdown,
  VSCodeOption,
} from "@vscode/webview-ui-toolkit/react";
import { useRecoilState, selector, useRecoilValue } from "recoil";

import {
  atomSyncBoolean,
  atomSyncObject,
  atomSyncString,
  atomSyncStringArray,
} from "../utilities/recoilSyncWrapper";
import { Response, Error, xtracfg } from "../utilities/xtracfgValues";
import { VSCodeProgressRing } from "@vscode/webview-ui-toolkit/react";
import { useEffect, useState } from "react";
import { vscode } from "../utilities/vscode";
import Final from "./Final";
import CollectionTables, { TableData } from "./CollectionTables";

export const apiNameAtom = atomSyncString("apiName", "", "StoreA");
export const valueFileNameAtom = atomSyncString("valueFileName", "default", "StoreA");
export const typeAtom = atomSyncString("type", "maplibre-styles", "StoreA");
export const workspaceAtom = atomSyncString("workspaceValues", "", "StoreA");
export const successAtom = atomSyncString("success", "", "StoreA");
export const errorAtom = atomSyncString("errorValues", "", "StoreA");
export const loadingAtom = atomSyncBoolean("loading", false, "StoreA");
export const details = atomSyncObject<TableData>("details", {}, "StoreA");
export const collections = atomSyncObject<Response>("collections", {}, "StoreA");
export const existingApisAtom = atomSyncStringArray("existingApis", [""], "StoreA");
export const currentViewAtom = atomSyncString("currentView", "main", "StoreA");

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
  const [existingApis, setExistingApis] = useRecoilState<string[]>(existingApisAtom);
  const [selectedApiInDropdown, setSelectedApiInDropdown] = useState(false);
  const [currentView, setCurrentView] = useRecoilState(currentViewAtom);
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
      //  const collectionColors = JSON.stringify(get(collections));

      return {
        apiId,
        name,
        type,
        source,
        command,
        //  collectionColors,
      };
    },
  });
  const valueData = useRecoilValue<valueData>(valueDataSelector);
  const [success, setSuccess] = useRecoilState(successAtom);
  const [error, setError] = useRecoilState(errorAtom);
  const [loading, setLoading] = useRecoilState(loadingAtom);
  const [resultDetails, setResultDetails] = useRecoilState<TableData>(details);
  const [collectionColors, setCollectionColors] = useRecoilState(collections);

  const handleBack = () => {
    setCurrentView("main");
  };

  useEffect(() => {
    vscode.listen(handleVscode);

    vscode.postMessage({
      command: "onLoad",
      text: "onLoad",
    });
    vscode.postMessage({
      command: "setExistingApis",
      text: "setExistingApis",
    });
  }, []);

  const onFileSelect = (apiName: string) => {
    setApiName(apiName);
  };

  window.addEventListener("message", (event) => {
    const message = event.data;

    switch (message.command) {
      case "setApis":
        const filteredApis = message.existingApis.filter((api: string) => /^[a-zA-Z0-9]/.test(api));
        const sortedApis = filteredApis.sort((a: string, b: string) => a.localeCompare(b));
        setExistingApis(sortedApis);
        if (!DEV) {
          console.log("existing Apis:", message.existingApis);
        }
        break;
    }
  });

  const handleVscode = (message: any) => {
    switch (message.command) {
      case "setWorkspace":
        const workspaceRoot = message.workspaceRoot;

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
    setCurrentView("collectionTables");
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

  if (
    currentView === "collectionTables" &&
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
        onBack={handleBack}
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
              <div className="dropdown">
                <VSCodeDropdown
                  id="my-dropdown"
                  disabled={existingApis.length === 0}
                  value={apiName}
                  onChange={(e) => {
                    onFileSelect((e.target as HTMLInputElement).value);
                    setSelectedApiInDropdown(true);
                  }}>
                  {!selectedApiInDropdown && <VSCodeOption value="">Choose Api...</VSCodeOption>}
                  {existingApis.length > 0 &&
                    existingApis.map((option) => (
                      <VSCodeOption key={option} value={option}>
                        {option}
                      </VSCodeOption>
                    ))}
                </VSCodeDropdown>
              </div>
            </section>
            <section className="component-example" style={{ marginBottom: "15px" }}>
              <VSCodeTextField
                value={valueFileName}
                onInput={(e) => {
                  const target = e.target as HTMLInputElement;
                  if (target) {
                    setValueFileName(target.value);
                  }
                }}
                onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                  e.target.select();
                }}>
                Value Filename
              </VSCodeTextField>
            </section>
          </div>
          <div className="postgresWfsSubmit" style={{ display: "flex", alignItems: "center" }}>
            <VSCodeButton
              className="submitButton"
              onClick={() => {
                submitData(valueData);
              }}
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
