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
import { xtracfg } from "../utilities/xtracfgValues";
import type { Response, Error } from "../utilities/xtracfgValues";
import { VSCodeProgressRing } from "@vscode/webview-ui-toolkit/react";
import { useEffect, useState } from "react";
import { vscode } from "../utilities/vscode";
import Final from "./Final";
import CollectionTables, { TableData } from "./CollectionTables";
import { typeObjectAtom } from "../components/TypeCheckboxes";

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

export const successCreateCfgAtom = atomSyncString("successCreateCfg", "", "StoreB");
export const apiNameCreateCfgAtom = atomSyncString("apiNameCreateCfg", "", "StoreB");
export const valueFileNameCreateCfgAtom = atomSyncString(
  "valueFileNameCreateCfg",
  "default",
  "StoreB"
);
export const typeCreateCfgAtom = atomSyncString("typeCreateCfg", "maplibre-styles", "StoreB");
export const workspaceCreateCfgAtom = atomSyncString("workspaceCreateCfg", "", "StoreB");

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

function App({
  id,
  selectedCfg,
  entitiesWorkspace,
}: {
  id?: string;
  selectedCfg?: string;
  entitiesWorkspace?: string;
}) {
  const [apiName, setApiName] = useRecoilState(apiNameAtom);
  const [valueFileName, setValueFileName] = useRecoilState(valueFileNameAtom);
  const [type, setType] = useRecoilState(typeAtom);
  const [workspace, setWorkspace] = useRecoilState(workspaceAtom);
  const typeObject = useRecoilValue(typeObjectAtom);
  const [existingApis, setExistingApis] = useRecoilState<string[]>(existingApisAtom);
  const [selectedApiInDropdown, setSelectedApiInDropdown] = useState(false);
  const [currentView, setCurrentView] = useRecoilState(currentViewAtom);
  const DEV = false;
  const valueDataSelector = selector({
    key: "uniqueValueDataSelector_v1",
    get: ({ get }) => {
      const apiId = selectedCfg ? selectedCfg : id && id !== "" ? id : get(apiNameAtom);
      const name = id && id !== "" ? id : get(valueFileNameAtom);
      const type = get(typeAtom);
      // const source = "/Users/pascal/Documents/ldproxy_mount";
      const source = entitiesWorkspace && entitiesWorkspace !== "" ? entitiesWorkspace : workspace;
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
  const [successCreateCfg, setSuccessCreateCfg] = useRecoilState(successCreateCfgAtom);
  const [apiNameCreateCfg, setApiNameCreateCfg] = useRecoilState(apiNameCreateCfgAtom);
  const [valueFileNameCreateCfg, setValueFileNameCreateCfg] = useRecoilState(
    valueFileNameCreateCfgAtom
  );
  const [typeCreateCfg, setTypeCreateCfg] = useRecoilState(typeCreateCfgAtom);
  const [workspaceCreateCfg, setWorkspaceCreateCfg] = useRecoilState(workspaceCreateCfgAtom);

  const createStylewithService = id && id !== "" && typeObject.service === true;
  const createStyleWithoutService = id && id !== "" && selectedCfg;

  useEffect(() => {
    if (success || successCreateCfg) return;
    if (createStylewithService && (workspace || entitiesWorkspace)) {
      setApiNameCreateCfg(id);
      setValueFileNameCreateCfg(id);
      setWorkspaceCreateCfg(
        entitiesWorkspace && entitiesWorkspace !== "" ? entitiesWorkspace : workspace
      );
      submitData(valueData);
    } else if (createStyleWithoutService && (workspace || entitiesWorkspace)) {
      setApiNameCreateCfg(selectedCfg);
      setValueFileNameCreateCfg(id);
      setWorkspaceCreateCfg(
        entitiesWorkspace && entitiesWorkspace !== "" ? entitiesWorkspace : workspace
      );
      submitData(valueData);
    }
  }, [id, workspace, entitiesWorkspace]);

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
  }, [id]);

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
        if (DEV) {
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
          setSuccessCreateCfg(message.response.results[0].message);
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
      apiId: apiName || apiNameCreateCfg,
      name: valueFileName || valueFileNameCreateCfg,
      type: type || typeCreateCfg,
      source: workspace || workspaceCreateCfg,
      command: "autoValue",
      collectionColors: JSON.stringify(collectionColors),
      subcommand: "generate",
    };
    xtracfg.send(basicData);
  };

  const createStyleAndSelectCollections =
    id && id !== "" && Object.keys(collectionColors).length === 0;

  if (success || successCreateCfg) {
    return (
      <Final
        nameOfCreatedFile={valueFileName || valueFileNameCreateCfg}
        workspace={workspace || workspaceCreateCfg}
        apiId={apiName || apiNameCreateCfg}
        type={type || typeCreateCfg}
      />
    );
  } else if (
    createStyleAndSelectCollections ||
    (currentView === "collectionTables" &&
      resultDetails &&
      Object.keys(resultDetails).length > 0 &&
      Object.keys(collectionColors).length === 0)
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
