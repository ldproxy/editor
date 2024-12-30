import React, { useState, useEffect } from "react";
import {
  VSCodeDropdown,
  VSCodeOption,
  VSCodeButton,
  VSCodeCheckbox,
} from "@vscode/webview-ui-toolkit/react";
import { useRecoilState, useRecoilValue, selector } from "recoil";
import { typeObjectAtom } from "../components/TypeCheckboxes";
import { existingConfigurationsAtom } from "./App";
import { idAtom } from "./Common";
import { atomSyncString, atomSyncStringArray } from "../utilities/recoilSyncWrapper";

export const selectedConfigAtom = atomSyncString("selectedConfigAtom", "", "StoreB");

export const selectedSubConfigsAtom = atomSyncStringArray("selectedSubConfigsAtom", [], "StoreB");

type CopyExistingEntityProps = {
  copySubmit: (submitData: Object) => void;
};

function CopyFromExistingEntity({ copySubmit }: CopyExistingEntityProps) {
  const [selectedConfig, setSelectedConfig] = useRecoilState(selectedConfigAtom);
  const [selectedSubConfigs, setSelectedSubConfigs] = useRecoilState(selectedSubConfigsAtom);

  const existingConfigurations = useRecoilValue(existingConfigurationsAtom);
  const fromCopySelector = selector({
    key: "copyExistingCfgSelector",
    get: ({ get }) => {
      const id = get(idAtom);
      const selectedConfigSelector = get(selectedConfigAtom);
      const selectedSubConfigsSelector = get(selectedSubConfigsAtom);
      return {
        id,
        selectedConfigSelector,
        selectedSubConfigsSelector,
      };
    },
  });
  const copyData = useRecoilValue(fromCopySelector);

  const handleDropdownChange = (e: any) => {
    setSelectedConfig(e.target.value);
  };

  const handleSubConfigChange = (e: any) => {
    const value = e.target.value;
    setSelectedSubConfigs((prev: any) =>
      e.target.checked ? [...prev, value] : prev.filter((subConfig: string) => subConfig !== value)
    );
  };

  const getMainNameCfg = (config: string) => {
    return config
      .replace(/\s*\((provider|service)\)\s*/, "")
      .replace(/-tiles\.yml$/, "")
      .replace(/\.yml$/, "")
      .replace(/-tiles$/, "")
      .trim();
  };

  const mainNameSelectedCfg = getMainNameCfg(selectedConfig);
  const subConfigs: string[] = existingConfigurations.filter(
    (config: string) => getMainNameCfg(config) === mainNameSelectedCfg && config !== selectedConfig
  );

  useEffect(() => {
    if (existingConfigurations.length > 0 && !selectedConfig) {
      setSelectedConfig(existingConfigurations[0]);
    }
  }, [existingConfigurations]);

  return (
    <>
      <section className="component-example">
        <label style={{ marginBottom: "3px", display: "block", color: "#666666" }}>
          Configuration
        </label>
        <VSCodeDropdown
          style={{ height: "26px" }}
          value={selectedConfig}
          onChange={handleDropdownChange}>
          {existingConfigurations.map((config: string, index: number) => (
            <VSCodeOption key={index} value={config} title={config}>
              {config}
            </VSCodeOption>
          ))}
        </VSCodeDropdown>
      </section>
      {selectedConfig && selectedConfig.length > 0 && (
        <section className="component-example">
          <label style={{ marginBottom: "3px", display: "block", color: "#666666" }}>
            Related Configurations
          </label>
          {subConfigs.map((config: string, index: number) => (
            <VSCodeCheckbox
              key={index}
              value={config}
              checked={selectedSubConfigs.includes(config)}
              onChange={handleSubConfigChange}>
              {config}
            </VSCodeCheckbox>
          ))}
        </section>
      )}
      <div className="submitAndReset">
        <VSCodeButton className="submitButton" onClick={() => copySubmit(copyData)}>
          Next
        </VSCodeButton>
      </div>
    </>
  );
}

export default CopyFromExistingEntity;
