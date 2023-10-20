import React, { useState, useEffect } from "react";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import "./App.css";

type FinalProps = {
  workspace: string;
  sqlData: Object;
  wfsData: Object;
  gpkgData: Object;
  selectedDataSource: string;
};

const Final = (props: FinalProps) => {
  const [id, setId] = useState<string>("");

  useEffect(() => {
    if (props.selectedDataSource === "PostgreSQL") {
      setId(props.sqlData.id);
    } else if (props.selectedDataSource === "WFS") {
      setId(props.wfsData.id);
    } else if (props.selectedDataSource === "GeoPackage") {
      setId(props.gpkgData.id);
    }
  }, []);

  const onClose = () => {};

  const onCreateAnother = () => {};

  console.log("workspace", props.workspace);

  return (
    <div className="final-container">
      <div className="final-content">
        <h2 className="final-title">File created.</h2>
        <a href={`${props.workspace}/resources/features/${id}`} className="final-link">
          Open File
        </a>
        <div className="final-buttons">
          <VSCodeButton className="final-dismiss" onClick={onClose}>
            Dismiss
          </VSCodeButton>
          <VSCodeButton className="final-create-another" onClick={onCreateAnother}>
            Create Another
          </VSCodeButton>
        </div>
      </div>
    </div>
  );
};

export default Final;
