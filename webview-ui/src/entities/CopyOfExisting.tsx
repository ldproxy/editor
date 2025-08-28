import React, { useState, useEffect } from "react";
import {
  VSCodeDropdown,
  VSCodeOption,
  VSCodeButton,
  VSCodeCheckbox,
  VSCodeDivider,
} from "@vscode/webview-ui-toolkit/react";
import { useRecoilState, useRecoilValue, selector } from "recoil";
import { existingConfigurationsAtom, existingStylesAtom } from "./App";
import { idAtom } from "../components/Common";
import { atomSyncString, atomSyncStringArray } from "../utilities/recoilSyncWrapper";

export const selectedConfigAtom = atomSyncString("selectedConfigAtom", "", "StoreB");

export const basenameAtom = atomSyncString("basenameAtom", "", "StoreB");

export const mainNameSelectedCfgAtom = atomSyncString("mainNameSelectedCfgAtom", "", "StoreB");

export const selectedSubConfigsAtom = atomSyncStringArray("selectedSubConfigsAtom", [], "StoreB");

export const relatedStylesAtom = atomSyncStringArray("relatedStylesAtom", [], "StoreB");

type CopyExistingEntityProps = {
  copySubmit: (submitData: Object) => void;
};

type ExistingStyles = {
  [key: string]: string[];
};

function getBasename(filePath: string) {
  return filePath.split("/").pop() || filePath;
}

export const fromCopySelector = selector({
  key: "copyExistingSelector",
  get: ({ get }) => {
    const id = get(idAtom);
    const selectedConfigSelector = get(selectedConfigAtom);
    const selectedSubConfigsSelector = get(selectedSubConfigsAtom);
    const existingConfigurations = get(existingConfigurationsAtom);

    let fullConfigPath = selectedConfigSelector;
    existingConfigurations.forEach((full: string) => {
      const match = full.match(/^(.*?)(\s+\(provider\)|\s+\(service\))?$/);
      const fullPath = match ? match[1] : full;
      const typeSuffix = match && match[2] ? match[2] : "";
      const filename = getBasename(fullPath);
      if (selectedConfigSelector === filename + typeSuffix) {
        fullConfigPath = full.replace(/\s+\([^)]+\)$/, "");
      }
    });

    return {
      id,
      selectedConfigSelector: fullConfigPath,
      selectedSubConfigsSelector,
      createOption: "copy",
    };
  },
});

function CopyFromExistingEntity({ copySubmit }: CopyExistingEntityProps) {
  const [selectedConfig, setSelectedConfig] = useRecoilState(selectedConfigAtom);
  const [selectedSubConfigs, setSelectedSubConfigs] = useRecoilState(selectedSubConfigsAtom);
  const [relatedStyles, setRelatedStyles] = useRecoilState(relatedStylesAtom);
  const [basename, setBasename] = useRecoilState(basenameAtom);
  const [mainNameSelectedCfg, setMainNameSelectedCfg] = useRecoilState(mainNameSelectedCfgAtom);

  const existingConfigurations = useRecoilValue(existingConfigurationsAtom);
  const existingStyles = useRecoilValue<ExistingStyles>(existingStylesAtom);
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

  const subConfigs: string[] = existingConfigurations.filter(
    (config: string) => getMainNameCfg(config) === mainNameSelectedCfg && config !== selectedConfig
  );

  useEffect(() => {
    const mainNameCfg = getMainNameCfg(selectedConfig);
    if (mainNameCfg) {
      setMainNameSelectedCfg(mainNameCfg);
    }

    const styles = Object.keys(existingStyles).filter(
      (styleKey: string) => getMainNameCfg(styleKey) === mainNameSelectedCfg
    );
    if (styles) {
      setRelatedStyles(styles);
    }
  }, [existingStyles, mainNameSelectedCfg, selectedConfig]);

  const getBasename = (filePath: string) => {
    return filePath.split("/").pop();
  };

  // necessary for empty dropdown after initialisation
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (selectedConfig === "") {
        setSelectedConfig("Initialising...");
        setSelectedConfig("");
      }
    }, 1);
    return () => clearTimeout(timeoutId);
  }, []);

  const filterAndFormatConfigurations = (config: string) => {
    if (config.startsWith("defaults/")) {
      if (config.startsWith("defaults/services") || config.startsWith("defaults/providers")) {
        const parts = config.split("/");
        let lastPart = parts.pop();
        const parentPart = parts.pop();
        const match = config.match(/\(([^)]+)\)/);
        const suffix = match ? match[1] : parentPart;
        lastPart = lastPart?.replace(/\s*\([^)]*\)/, "");
        return `${lastPart} (defaults/${suffix})`;
      }
      return null;
    }
    return config;
  };

  const configurationsWithFilename = existingConfigurations.map((config: string) => {
    const match = config.match(/^(.*?)(\s+\(provider\)|\s+\(service\))?$/);
    const fullPath = match ? match[1] : config;
    const typeSuffix = match && match[2] ? match[2] : "";
    const filename = getBasename(fullPath);
    return filename + typeSuffix;
  });

  const formattedConfigurations = configurationsWithFilename
    .map(filterAndFormatConfigurations)
    .filter((config: string) => config !== null);

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
          {formattedConfigurations.map((config: string, index: number) => (
            <VSCodeOption key={index} value={config} title={config}>
              {config}
            </VSCodeOption>
          ))}
        </VSCodeDropdown>
      </section>
      {subConfigs && subConfigs.length > 0 && (
        <section className="component-example">
          <label style={{ display: "block" }} className="vscode-text">
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
      {relatedStyles.some(
        (styleKey: string) =>
          Array.isArray(existingStyles[styleKey]) && existingStyles[styleKey].length > 0
      ) && (
        <section className="component-example">
          <label style={{ marginBottom: "7px", display: "block", color: "#666666" }}>
            Related Styles
          </label>
          {relatedStyles.map((styleKey: string, index: number) =>
            existingStyles[styleKey].map((styleValue: string, subIndex: number) => {
              const myBasename = getBasename(styleValue);
              if (myBasename) {
                setBasename(myBasename);
              }
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
        <VSCodeButton
          className="submitButton"
          onClick={() => copySubmit(copyData)}
          disabled={!selectedConfig}>
          Next
        </VSCodeButton>
      </div>
    </>
  );
}

export default CopyFromExistingEntity;
