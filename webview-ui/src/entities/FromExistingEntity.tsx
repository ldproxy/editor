import React, { useState, useEffect } from "react";
import {
  VSCodeDropdown,
  VSCodeOption,
  VSCodeButton,
  VSCodeDivider,
} from "@vscode/webview-ui-toolkit/react";
import TypeCheckboxes from "../components/TypeCheckboxes";
import { useRecoilState, useRecoilValue, selector } from "recoil";
import { typeObjectAtom } from "../components/TypeCheckboxes";
import { existingConfigurationsAtom } from "./App";
import { idAtom } from "../components/Common";
import { atomSyncString } from "../utilities/recoilSyncWrapper";

type FromExistingEntityProps = {
  fromExistingSubmit: (submitData: Object) => void;
};

export const selectedTypeAtom = atomSyncString("selectedType", "", "StoreB");
export const selectedConfigFromExistingAtom = atomSyncString(
  "selectedConfigFromExistingAtom",
  "",
  "StoreB"
);

function FromExistingEntity({ fromExistingSubmit }: FromExistingEntityProps) {
  const [selectedConfig, setSelectedConfig] = useRecoilState(selectedConfigFromExistingAtom);
  const [selectedType, setSelectedType] = useRecoilState(selectedTypeAtom);
  const existingConfigurations = useRecoilValue(existingConfigurationsAtom);
  const fromExistingSelector = selector({
    key: `fromExistingCfgSelector_${Math.random()}`,
    get: ({ get }) => {
      const id = get(idAtom);
      const typeObject = get(typeObjectAtom);
      return {
        id,
        selectedConfig,
        typeObject,
      };
    },
  });
  const fromExistingData = useRecoilValue(fromExistingSelector);

  const handleDropdownChange = (e: any) => {
    setSelectedConfig(e.target.value);
  };

  const getTypeFromConfig = (config: string) => {
    const match = config.match(/\(([^)]+)\)$/);
    return match ? match[1] : "";
  };

  useEffect(() => {
    setSelectedType(getTypeFromConfig(selectedConfig));
  }, [selectedConfig]);

  const filteredConfigurations = existingConfigurations.filter(
    (config: string) => !config.startsWith("defaults/") && !config.includes("-tiles")
  );

  return (
    <>
      <section className="component-example">
        <label style={{ display: "block" }} className="vscode-text">
          <strong>Configuration</strong>
        </label>
        <VSCodeDivider style={{ marginBottom: "10px", width: "165px" }} />
        <VSCodeDropdown
          style={{ height: "26px", minWidth: "165px" }}
          value={selectedConfig}
          onChange={handleDropdownChange}>
          {filteredConfigurations.map((config: string, index: number) => (
            <VSCodeOption key={index} value={config} title={config}>
              {config}
            </VSCodeOption>
          ))}
        </VSCodeDropdown>
      </section>
      <TypeCheckboxes mode="fromExisting" selectedType={selectedType} />
      <div className="submitAndReset">
        <VSCodeButton className="submitButton" onClick={() => fromExistingSubmit(fromExistingData)}>
          Next
        </VSCodeButton>
      </div>
    </>
  );
}

export default FromExistingEntity;
