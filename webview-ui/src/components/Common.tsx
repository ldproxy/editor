import {
  VSCodeTextField,
  VSCodeRadioGroup,
  VSCodeRadio,
  VSCodeDivider,
} from "@vscode/webview-ui-toolkit/react";
import { useRecoilState } from "recoil";

import { atomSyncString } from "../utilities/recoilSyncWrapper";
import TypeCheckboxes, { typeObjectAtom } from "./TypeCheckboxes";
import FromExistingEntity from "../entities/FromExistingEntity";
import CopyFromExistingEntity from "../entities/CopyOfExisting";
import FromScratch from "../entities/FromScratch";

export const idAtom = atomSyncString("id", "", "StoreB");

export const featureProviderTypeAtom = atomSyncString("featureProviderType", "PGIS", "StoreB");

export const createCfgOptionAtom = atomSyncString(
  "createCfgOption",
  "generateFromDataSource",
  "StoreB"
);

type CommonProps = {
  error: {
    id?: string;
  };
  fromExistingSubmit: (submitData: object) => void;
  copySubmit: (submitData: object) => void;
  fromScratchSubmit: (submitData: object) => void;
};

function Common({ error, fromExistingSubmit, copySubmit, fromScratchSubmit }: CommonProps) {
  const [id, setId] = useRecoilState(idAtom);
  const [featureProviderType, setFeatureProviderType] = useRecoilState(featureProviderTypeAtom);
  const [createCfgOption, setCreateCfgOption] = useRecoilState(createCfgOptionAtom);

  const tabs = [
    {
      id: "generateFromDataSource",
      label: "From Data Source",
      description:
        "Generate configuration files for an existing data source. The selected target configuration files are derived from the schema of the data source.",
    },
    {
      id: "generateFromExistingEntity",
      label: "From Existing Entity",
      description:
        "Generate additional configuration files for an existing entity configuration. The selected target configuration files are derived from the the source configuration file.",
    },
    {
      id: "copyOfExistingFile",
      label: "Copy Of Existing Entity",
      description: "Create a copy of an existing entity configuration file.",
    },
    {
      id: "fromScratch",
      label: "From Scratch",
      description:
        "Create configuration files from scratch. Provides a starting point for new configurations.",
    },
  ];

  const handleTabChange = (id: string) => {
    setCreateCfgOption(id);
  };

  return (
    <>
      <h3>Create Configuration Files</h3>
      <section className="component-example" style={{ width: "100%" }}>
        <div className="tabs-container">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`tab ${createCfgOption === tab.id ? "active" : ""}`}
              onClick={() => handleTabChange(tab.id)}>
              {tab.label}
            </div>
          ))}
        </div>
        <div className="tab-content" style={{ width: "100%" }}>
          <section className="component-example">
            <p>{tabs.find((tab) => tab.id === createCfgOption)?.description}</p>
          </section>
          <section className="component-example">
            <label style={{ display: "block" }} className="vscode-text">
              <strong>Id</strong>
            </label>
            <VSCodeDivider style={{ marginBottom: "10px", width: "100%" }} />
            <div className="input-container">
              <VSCodeTextField
                value={id}
                disabled={createCfgOption === "generateFromExistingEntity"}
                onInput={(e) => {
                  const target = e.target as HTMLInputElement;
                  if (target) {
                    setId(target.value);
                  }
                }}></VSCodeTextField>
              {error.id && <span className="error-message">{error.id}</span>}
            </div>
          </section>
          {createCfgOption === "generateFromDataSource" && (
            <section className="component-example">
              <label style={{ display: "block" }} className="vscode-text">
                <strong>Data Source</strong>
              </label>
              <VSCodeDivider style={{ marginBottom: "10px", width: "100%" }} />
              <VSCodeRadioGroup name="DataType" value={featureProviderType} orientation="vertical">
                <VSCodeRadio
                  id="PostgreSQL"
                  value="PGIS"
                  onChange={() => setFeatureProviderType("PGIS")}>
                  PostgreSQL
                </VSCodeRadio>
                <VSCodeRadio
                  id="GeoPackage"
                  value="GPKG"
                  onChange={() => setFeatureProviderType("GPKG")}>
                  GeoPackage
                </VSCodeRadio>
                <VSCodeRadio id="WFS" value="WFS" onChange={() => setFeatureProviderType("WFS")}>
                  WFS
                </VSCodeRadio>
              </VSCodeRadioGroup>
            </section>
          )}
          {createCfgOption === "generateFromExistingEntity" && (
            <FromExistingEntity fromExistingSubmit={fromExistingSubmit} />
          )}
          {createCfgOption === "copyOfExistingFile" && (
            <CopyFromExistingEntity copySubmit={copySubmit} />
          )}
          {createCfgOption === "fromScratch" && (
            <FromScratch fromScratchSubmit={fromScratchSubmit} />
          )}
        </div>
      </section>
    </>
  );
}

export default Common;
