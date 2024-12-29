import React, { useState } from "react";
import { VSCodeCheckbox } from "@vscode/webview-ui-toolkit/react";

function TypeCheckboxes() {
  const [isServiceChecked, setIsServiceChecked] = useState(false);
  const [isTileProviderChecked, setIsTileProviderChecked] = useState(false);
  const [isStyleChecked, setIsStyleChecked] = useState(false);

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

  const handleStyleChange = (e: any) => {
    const target = e.target as HTMLInputElement;
    setIsStyleChecked(target.checked);
  };

  return (
    <>
      <section className="component-example">
        <h4>Select Types</h4>
        <div style={{ display: "flex", gap: "20px", flexWrap: "nowrap", marginTop: "-5px" }}>
          <VSCodeCheckbox checked={true} disabled>
            Provider
          </VSCodeCheckbox>
          <VSCodeCheckbox checked={isServiceChecked} onChange={handleServiceChange}>
            Service
          </VSCodeCheckbox>
          <VSCodeCheckbox checked={isTileProviderChecked} onChange={handleTileProviderChange}>
            Tile Provider
          </VSCodeCheckbox>
          <VSCodeCheckbox
            checked={isStyleChecked}
            disabled={!isServiceChecked}
            onChange={handleStyleChange}>
            Style
          </VSCodeCheckbox>
        </div>
      </section>
    </>
  );
}

export default TypeCheckboxes;
