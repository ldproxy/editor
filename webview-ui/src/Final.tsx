import React, { useState, useEffect } from "react";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import "./App.css";
import { vscode } from "./utilities/vscode";

type FinalProps = {
  workspace: string;
  sqlData: Object;
  wfsData: Object;
  gpkgData: Object;
  selectedDataSource: string;
  setDataProcessing: Function;
  setGpkgData: Function;
  setSqlData: Function;
  setWfsData: Function;
  setSelectedTable: Function;
};

const Final = (props: FinalProps) => {
  const [id, setId] = useState<string>("");

  useEffect(() => {
    if (props.selectedDataSource === "PGIS") {
      setId(props.sqlData.id);
    } else if (props.selectedDataSource === "WFS") {
      setId(props.wfsData.id);
    } else if (props.selectedDataSource === "GPKG") {
      setId(props.gpkgData.id);
    }
  }, []);

  const onClose = () => {
    vscode.postMessage({ command: "closeWebview" });
  };

  const onCreateAnother = () => {
    props.setDataProcessing("");
    props.setGpkgData({});
    props.setSqlData({});
    props.setWfsData({});
    props.setSelectedTable({});
  };

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
