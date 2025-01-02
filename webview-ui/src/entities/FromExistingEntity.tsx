import React, { useState, useEffect } from "react";
import { VSCodeDropdown, VSCodeOption, VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import TypeCheckboxes from "../components/TypeCheckboxes";
import { useRecoilState, useRecoilValue, selector } from "recoil";
import { typeObjectAtom } from "../components/TypeCheckboxes";
import { existingConfigurationsAtom } from "./App";
import { idAtom } from "./Common";

type FromExistingEntityProps = {
  fromExistingSubmit: (submitData: Object) => void;
};

function FromExistingEntity({ fromExistingSubmit }: FromExistingEntityProps) {
  const [selectedConfig, setSelectedConfig] = useState("");
  const existingConfigurations = useRecoilValue(existingConfigurationsAtom);
  const fromExistingSelector = selector({
    key: "fromExistingCfgSelector",
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

  const selectedType = getTypeFromConfig(selectedConfig);

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
