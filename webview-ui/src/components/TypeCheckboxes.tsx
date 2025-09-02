import React, { useState, useEffect } from "react";
import { VSCodeCheckbox, VSCodeDivider } from "@vscode/webview-ui-toolkit/react";
import { atomSyncObject, atomSyncBoolean, atomSyncString } from "../utilities/recoilSyncWrapper";
import { useRecoilState } from "recoil";

export const typeObjectAtom = atomSyncObject(
  "typeObject",
  {
    provider: false,
    service: false,
    tileProvider: false,
    style: false,
  },
  "StoreB"
);
export const isServiceCheckedAtom = atomSyncBoolean("isServiceChecked", false, "StoreB");
export const isTileProviderCheckedAtom = atomSyncBoolean("isTileProviderChecked", false, "StoreB");
export const isProviderCheckedAtom = atomSyncBoolean("isProviderChecked", false, "StoreB");
export const isStyleCheckedAtom = atomSyncBoolean("isStyleChecked", false, "StoreB");

export const typeAtom = atomSyncString("typeAtom", "", "StoreB");
export const modeAtom = atomSyncString("modeAtom", "", "StoreB");

type TypeCheckboxesProps = {
  mode?: string;
  selectedType?: string;
};

function TypeCheckboxes({ mode, selectedType }: TypeCheckboxesProps) {
  const [type, setType] = useRecoilState(typeAtom);
  const [createCfgMode, setCreateCfgMode] = useRecoilState(modeAtom);
  const [typeObject, setTypeObject] = useRecoilState(typeObjectAtom);
  const [isServiceChecked, setIsServiceChecked] = useRecoilState(isServiceCheckedAtom);
  const [isProviderChecked, setIsProviderChecked] = useRecoilState(isProviderCheckedAtom);
  const [isTileProviderChecked, setIsTileProviderChecked] =
    useRecoilState(isTileProviderCheckedAtom);
  const [isStyleChecked, setIsStyleChecked] = useRecoilState(isStyleCheckedAtom);

  useEffect(() => {
    if (selectedType !== type || mode !== createCfgMode) {
      if (selectedType && selectedType !== undefined) {
        setType(selectedType);
      } else setType("undefined");
      if (mode && mode !== undefined) {
        setCreateCfgMode(mode);
      } else setCreateCfgMode("undefined");
    }
  }, [selectedType, mode]);

  useEffect(() => {
    setTypeObject(() => ({
      provider: isProviderChecked,
      service: isServiceChecked,
      tileProvider: isTileProviderChecked,
      style: isStyleChecked,
    }));
  }, [isServiceChecked, isTileProviderChecked, isStyleChecked, isProviderChecked, setTypeObject]);

  useEffect(() => {
    if (
      (mode && mode !== createCfgMode) ||
      (createCfgMode !== "undefined" && mode === undefined) ||
      (selectedType && type !== selectedType) ||
      (type !== "undefined" && selectedType === undefined)
    ) {
      setIsServiceChecked(false);
      setIsTileProviderChecked(false);
      setIsStyleChecked(false);
      setIsProviderChecked(false);
    }
  }, [type, selectedType, mode, createCfgMode]);

  const handleServiceChange = (e: any) => {
    const target = e.target as HTMLInputElement;
    setIsServiceChecked(target.checked);
    if (!target.checked) {
      setIsStyleChecked(false);
    }
  };

  const handleTileProviderChange = (e: any) => {
    const target = e.target as HTMLInputElement;
    setIsTileProviderChecked(target.checked);
  };

  const handleProviderChange = (e: any) => {
    const target = e.target as HTMLInputElement;
    setIsProviderChecked(target.checked);
  };

  const handleStyleChange = (e: any) => {
    const target = e.target as HTMLInputElement;
    setIsStyleChecked(target.checked);
  };

  useEffect(() => {
    if (
      createCfgMode !== "fromExisting" &&
      createCfgMode !== undefined &&
      (!type || type !== "service") &&
      !isProviderChecked
    ) {
      setIsProviderChecked(true);
    }
    if (
      (createCfgMode === "fromExisting" || (createCfgMode !== undefined && type === "service")) &&
      isProviderChecked
    ) {
      setIsProviderChecked(false);
    }
  }, [createCfgMode, type, isProviderChecked, setIsProviderChecked]);

  return (
    <>
      <section className="component-example">
        <label style={{ display: "block" }} className="vscode-text">
          <strong>Select Types</strong>
        </label>
        <VSCodeDivider style={{ marginBottom: "10px", width: "410px" }} />
        <div style={{ display: "flex", gap: "20px", flexWrap: "nowrap", marginTop: "-5px" }}>
          <VSCodeCheckbox
            checked={
              createCfgMode === "fromExisting"
                ? false
                : (createCfgMode !== undefined && (!type || type !== "service")) ||
                  isProviderChecked
            }
            onChange={handleProviderChange}
            disabled={createCfgMode !== undefined}>
            Provider
          </VSCodeCheckbox>
          <VSCodeCheckbox
            checked={isServiceChecked}
            onChange={handleServiceChange}
            disabled={createCfgMode === "fromExisting" && type === "service"}>
            Service
          </VSCodeCheckbox>
          <VSCodeCheckbox
            checked={isTileProviderChecked}
            onChange={handleTileProviderChange}
            disabled={
              createCfgMode === "fromDataWfs" ||
              (createCfgMode === "fromExisting" && type === "service")
            }>
            Tile Provider
          </VSCodeCheckbox>
          <VSCodeCheckbox
            checked={isStyleChecked}
            onChange={handleStyleChange}
            disabled={
              mode === "fromScratch" ||
              createCfgMode === "fromDataWfs" ||
              (createCfgMode === "fromData" && !isServiceChecked) ||
              (createCfgMode === "fromExisting" && !isServiceChecked && type !== "service")
            }>
            Style
          </VSCodeCheckbox>
        </div>
      </section>
    </>
  );
}

export default TypeCheckboxes;
