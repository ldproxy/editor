import React, { useState } from "react";
import {
  VSCodeTextField,
  VSCodeRadioGroup,
  VSCodeRadio,
  VSCodeDropdown,
  VSCodeOption,
  VSCodeButton,
  VSCodeProgressRing,
} from "@vscode/webview-ui-toolkit/react";
import { useRecoilState } from "recoil";

import { atomSyncString } from "../utilities/recoilSyncWrapper";
import TypeCheckboxes, { typeObjectAtom } from "../components/TypeCheckboxes";
import FromExistingEntity from "./FromExistingEntity";

export const idAtom = atomSyncString("id", "");

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
};

function Common({ error, fromExistingSubmit }: CommonProps) {
  const [id, setId] = useRecoilState(idAtom);
  const [featureProviderType, setFeatureProviderType] = useRecoilState(featureProviderTypeAtom);
  const [createCfgOption, setCreateCfgOption] = useRecoilState(createCfgOptionAtom);

  const tabs = [
    { id: "generateFromDataSource", label: "From Data Source" },
    { id: "generateFromExistingEntity", label: "From Existing Entity" },
    { id: "copyOfExistingFile", label: "Copy Of Existing File" },
    { id: "fromScratch", label: "From Scratch" },
  ];

  const handleTabChange = (id: string) => {
    setCreateCfgOption(id);
  };

  return (
    <>
      <h3>Create Configuration</h3>
      <section className="component-example">
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
        <div className="tab-content">
          <section className="component-example">
            <div className="input-container">
              <VSCodeTextField
                style={{ marginTop: "15px" }}
                value={id}
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
          </section>
          {createCfgOption === "generateFromDataSource" && (
            <section className="component-example">
              <VSCodeRadioGroup
                style={{ marginBottom: "10px" }}
                name="DataType"
                value={featureProviderType}
                orientation="vertical">
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
          {createCfgOption === "generateFromExistingEntity" && (
            <FromExistingEntity fromExistingSubmit={fromExistingSubmit} />
          )}
          {createCfgOption === "copyOfExistingFile" && (
            <p>Content for Copy Of Existing File. Use future component in App.tsx</p>
          )}
          {createCfgOption === "fromScratch" && <p>Content for From Scratch</p>}
        </div>
      </section>
    </>
  );
}

export default Common;
