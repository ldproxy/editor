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

function getBasename(filePath: string) {
  return filePath.split("/").pop() || filePath;
}

export const fromExistingSelector = selector({
  key: "fromExistingSelector",
  get: ({ get }) => {
    const id = get(idAtom);
    const selectedConfig = get(selectedConfigFromExistingAtom);
    const typeObject = get(typeObjectAtom);
    const existingConfigurations = get(existingConfigurationsAtom);

    let fullConfigPath = selectedConfig;
    existingConfigurations.forEach((full: string) => {
      const match = full.match(/^(.*?)(\s+\(provider\)|\s+\(service\))?$/);
      const fullPath = match ? match[1] : full;
      const typeSuffix = match && match[2] ? match[2] : "";
      const filename = getBasename(fullPath);
      if (selectedConfig === filename + typeSuffix) {
        fullConfigPath = full.replace(/\s+\([^)]+\)$/, "");
      }
    });

    return {
      id,
      selectedConfig: fullConfigPath,
      typeObject,
    };
  },
});

export const selectedTypeAtom = atomSyncString("selectedType", "", "StoreB");
export const selectedConfigFromExistingAtom = atomSyncString(
  "selectedConfigFromExistingAtom",
  "",
  "StoreB"
);

type TypeObject = {
  [key: string]: boolean;
};

function FromExistingEntity({ fromExistingSubmit }: FromExistingEntityProps) {
  const [selectedConfig, setSelectedConfig] = useRecoilState(selectedConfigFromExistingAtom);
  const [selectedType, setSelectedType] = useRecoilState(selectedTypeAtom);
  const existingConfigurations = useRecoilValue(existingConfigurationsAtom);
  const typeObject = useRecoilValue<TypeObject>(typeObjectAtom);
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

  const configurationsWithFilename = existingConfigurations.map((config: string) => {
    const match = config.match(/^(.*?)(\s+\(provider\)|\s+\(service\))?$/);
    const fullPath = match ? match[1] : config;
    const typeSuffix = match && match[2] ? match[2] : "";
    const filename = getBasename(fullPath);
    return filename + typeSuffix;
  });

  const filteredConfigurations = configurationsWithFilename.filter(
    (config: string) => !config.startsWith("defaults/") && !config.includes("-tiles")
  );

  const isNextButtonDisabled = () => {
    if (!selectedConfig) {
      return true;
    }
    if (selectedConfig.endsWith("(provider)")) {
      return !Object.keys(typeObject).some((key) => key !== "provider" && typeObject[key] === true);
    }
    if (selectedConfig.endsWith("(service)")) {
      return !typeObject["style"];
    }
    return false;
  };

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
        <VSCodeButton
          className="submitButton"
          onClick={() => fromExistingSubmit(fromExistingData)}
          disabled={isNextButtonDisabled()}>
          Next
        </VSCodeButton>
      </div>
    </>
  );
}

export default FromExistingEntity;
