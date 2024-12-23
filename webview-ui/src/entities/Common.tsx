import {
  VSCodeTextField,
  VSCodeRadioGroup,
  VSCodeRadio,
  VSCodePanels,
  VSCodePanelTab,
  VSCodePanelView,
} from "@vscode/webview-ui-toolkit/react";
import { useRecoilState } from "recoil";

import { atomSyncString } from "../utilities/recoilSyncWrapper";
import { useEffect } from "react";

export const idAtom = atomSyncString("id", "");

export const featureProviderTypeAtom = atomSyncString("featureProviderType", "PGIS", "StoreB");

export const tabSelectionAtom = atomSyncString("tabSelection", "generateFromDataSource");

type CommonProps = {
  disabled: boolean;
  error: {
    id?: string;
  };
};

function Common({ disabled, error }: CommonProps) {
  const [id, setId] = useRecoilState(idAtom);
  const [featureProviderType, setFeatureProviderType] = useRecoilState(featureProviderTypeAtom);
  const [tabSelection, setTabSelection] = useRecoilState(tabSelectionAtom);

  const tabs = [
    { id: "generateFromDataSource", label: "From Data Source" },
    { id: "generateFromExistingEntity", label: "From Existing Entity" },
    { id: "copyOfExistingFile", label: "Copy Of Existing File" },
    { id: "fromScratch", label: "From Scratch" },
  ];

  const handleTabChange = (id: string) => {
    setTabSelection(id);
  };

  return (
    <>
      <h3>Create Configuration</h3>
      <section className="component-example">
        <div className="tabs-container">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`tab ${tabSelection === tab.id ? "active" : ""}`}
              onClick={() => handleTabChange(tab.id)}>
              {tab.label}
            </div>
          ))}
        </div>
        <div className="tab-content">
          {tabSelection === "generateFromDataSource" && (
            <section className="component-example">
              <div className="input-container">
                <VSCodeTextField
                  style={{ marginTop: "15px", marginBottom: "15px" }}
                  value={id}
                  disabled={disabled}
                  onInput={(e) => {
                    const target = e.target as HTMLInputElement;
                    if (target) {
                      setId(target.value);
                    }
                  }}>
                  Id
                </VSCodeTextField>
                {error.id && <span className="error-message">{error.id}</span>}
              </div>
              <VSCodeRadioGroup
                style={{ marginBottom: "10px" }}
                name="DataType"
                value={featureProviderType}
                orientation="vertical"
                disabled={disabled}>
                <label slot="label">Data Source Type</label>
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
          {tabSelection === "generateFromExistingEntity" && (
            <p>Content for Generate From Existing Entity</p>
          )}
          {tabSelection === "copyOfExistingFile" && <p>Content for Copy Of Existing File</p>}
          {tabSelection === "fromScratch" && <p>Content for From Scratch</p>}
        </div>
      </section>
    </>
  );
}

export default Common;
