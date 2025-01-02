import React, { useState, useEffect } from "react";
import { VSCodeCheckbox } from "@vscode/webview-ui-toolkit/react";
import { atomSyncObject } from "../utilities/recoilSyncWrapper";
import { useRecoilState } from "recoil";

export const typeObjectAtom = atomSyncObject("typeObject", {}, "StoreB");

type TypeCheckboxesProps = {
  mode?: string;
  selectedType?: string;
};

function TypeCheckboxes({ mode, selectedType }: TypeCheckboxesProps) {
  const [typeObject, setTypeObject] = useRecoilState(typeObjectAtom);
  const [isServiceChecked, setIsServiceChecked] = useState(false);
  const [isProviderChecked, setIsProviderChecked] = useState(false);
  const [isTileProviderChecked, setIsTileProviderChecked] = useState(false);
  const [isStyleChecked, setIsStyleChecked] = useState(false);

  useEffect(() => {
    setTypeObject(() => ({
      provider: true,
      service: isServiceChecked,
      tileProvider: isTileProviderChecked,
      style: isStyleChecked,
    }));
  }, [isServiceChecked, isTileProviderChecked, isStyleChecked, setTypeObject]);

  useEffect(() => {
    setIsServiceChecked(false);
    setIsTileProviderChecked(false);
    setIsStyleChecked(false);
  }, [selectedType]);

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

  return (
    <>
      <section className="component-example">
        <h4>Select Types</h4>
        <div style={{ display: "flex", gap: "20px", flexWrap: "nowrap", marginTop: "-5px" }}>
          <VSCodeCheckbox
            checked={(mode && (!selectedType || selectedType !== "service")) || isProviderChecked}
            onChange={handleProviderChange}
            disabled={mode !== undefined}>
            Provider
          </VSCodeCheckbox>
          <VSCodeCheckbox
            checked={isServiceChecked || selectedType === "service"}
            onChange={handleServiceChange}
            disabled={mode === "fromExisting" && selectedType === "service"}>
            Service
          </VSCodeCheckbox>
          <VSCodeCheckbox
            checked={isTileProviderChecked}
            onChange={handleTileProviderChange}
            disabled={mode === "fromExisting" && selectedType === "service"}>
            Tile Provider
          </VSCodeCheckbox>
          <VSCodeCheckbox
            checked={isStyleChecked}
            onChange={handleStyleChange}
            disabled={
              (mode === "fromData" && !isServiceChecked) ||
              (mode === "fromExisting" && !isServiceChecked && selectedType !== "service")
            }>
            Style
          </VSCodeCheckbox>
        </div>
      </section>
    </>
  );
}

export default TypeCheckboxes;
