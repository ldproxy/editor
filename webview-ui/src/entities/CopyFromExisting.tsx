import React, { useState, useEffect } from "react";
import {
  VSCodeDropdown,
  VSCodeOption,
  VSCodeButton,
  VSCodeCheckbox,
} from "@vscode/webview-ui-toolkit/react";
import { useRecoilState, useRecoilValue, selector } from "recoil";
import { typeObjectAtom } from "../components/TypeCheckboxes";
import { existingConfigurationsAtom, existingStylesAtom } from "./App";
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
  const existingStyles = useRecoilValue(existingStylesAtom);
  const fromCopySelector = selector({
    key: `copyExistingCfgSelector_${Math.random()}`,
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

  const relatedStylesKeys: string[] = Object.keys(existingStyles).filter(
    (styleKey: string) => getMainNameCfg(styleKey) === mainNameSelectedCfg
  );

  useEffect(() => {
    if (existingConfigurations.length > 0 && !selectedConfig) {
      setSelectedConfig(existingConfigurations[0]);
    }
  }, [existingConfigurations]);

  const getBasename = (filePath: string) => {
    return filePath.split("/").pop();
  };

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
      {subConfigs && subConfigs.length > 0 && (
        <section className="component-example">
          <label style={{ marginBottom: "7px", display: "block", color: "#666666" }}>
            Related Configurations
          </label>
          {subConfigs.map((config: string, index: number) => (
            <div key={`${index}`}>
              <VSCodeCheckbox
                key={index}
                value={config}
                checked={selectedSubConfigs.includes(config)}
                onChange={handleSubConfigChange}>
                {config}
              </VSCodeCheckbox>
            </div>
          ))}
        </section>
      )}
      {relatedStylesKeys.length > 0 && (
        <section className="component-example">
          <label style={{ marginBottom: "7px", display: "block", color: "#666666" }}>
            Related Styles
          </label>
          {relatedStylesKeys.map((styleKey: string, index: number) =>
            existingStyles[styleKey].map((styleValue: string, subIndex: number) => {
              const basename = getBasename(styleValue);
              return basename ? (
                <div key={`${index}-${subIndex}`}>
                  <VSCodeCheckbox
                    key={`${index}-${subIndex}`}
                    value={styleValue}
                    checked={selectedSubConfigs.includes(styleValue)}
                    onChange={handleSubConfigChange}>
                    {basename}
                  </VSCodeCheckbox>
                </div>
              ) : null;
            })
          )}
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
