import "./App.css";
import React, { useState, useEffect } from "react";
import { VSCodeProgressRing, VSCodeButton } from "@vscode/webview-ui-toolkit/react";

type PostgreSqlProps = {
  submitData: (data: Object) => void;
  selectedDataSource: any;
  dataProcessed: string;
  existingGeopackages: string[];
  handleUpdateData(key: string, value: string): void;
  gpkgData: Object;
  setGpkgData(arg0: Object): void;
};

function GeoPackage(props: PostgreSqlProps) {
  const [newGPKG, setNewGPKG] = useState<any>();
  const [existingGPKG, setExistingGPKG] = useState<string>("");
  const [filename, setFilename] = useState<string>("");
  const [selectedTable, setSelectedTable] = useState<{
    [schema: string]: string[];
  }>({});
  const [schemasSelectedinEntirety, setschemasSelectedinEntirety] = useState<string[]>([]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewGPKG(file.name);
      setFilename(file.name);
      console.log("GP", file);
      props.handleUpdateData("Geopackage", "resources/features/" + file.name);

      file.arrayBuffer().then((buffer: ArrayBuffer) => {
        const uint8Array = new Uint8Array(buffer);
        const charArray = Array.from(uint8Array).map((charCode) => String.fromCharCode(charCode));
        const base64String = btoa(charArray.join(""));
      });
    }
  };

  useEffect(() => {
    if (props.selectedDataSource !== "GeoPackage") {
      setNewGPKG("");
      setExistingGPKG("");
      setFilename("");
      setSelectedTable({});
    }
  }, [props.selectedDataSource]);

  useEffect(() => {
    if (props.selectedDataSource !== "GeoPackage") {
      setSelectedTable({});
    }
  }, [props.selectedDataSource]);

  const handleReset = () => {
    setExistingGPKG("");
    setNewGPKG("");
    setFilename("");
    const fileInput = document.getElementById("geoInput") as HTMLInputElement | null;
    if (fileInput) {
      fileInput.value = "";
    }
    props.setGpkgData({});
  };

  console.log("selectedTable", selectedTable);
  console.log("schemasSelectedinEntirety", schemasSelectedinEntirety);

  return (
    <>
      <div className="button-container">
        <select
          className="dropdown"
          placeholder="Choose existing File..."
          value={existingGPKG}
          onChange={(event) => {
            setExistingGPKG(event.target.value);
            props.handleUpdateData("Geopackage", event.target.value);
          }}
          disabled={!!newGPKG}>
          <option value="" hidden>
            Choose existing File...
          </option>
          {props.existingGeopackages.map((option) => (
            <option key={option} value={option.split("\\").slice(-3).join("/")}>
              {option.split("\\").pop()}
            </option>
          ))}
        </select>
        or
        {!existingGPKG ? (
          <label htmlFor="geoInput" className="vscode-button">
            Upload new File
          </label>
        ) : (
          <label htmlFor="geoInput" id="uploadLabelDisabled">
            Upload new File
          </label>
        )}
        <input
          id={"geoInput"}
          type="file"
          onChange={(event) => onFileChange(event)}
          accept=".gpkg"
          multiple={false}
          disabled={!!existingGPKG}
        />
        {filename !== "" && <span id="GpkgName">{filename}</span>}
        <div className="submitAndReset">
          <VSCodeButton
            className="submitButton"
            onClick={() => props.submitData(props.gpkgData)}
            disabled={props.dataProcessed === "inProgress"}>
            Next
          </VSCodeButton>
          {existingGPKG || newGPKG ? (
            <VSCodeButton className="resetButton" onClick={handleReset}>
              Reset
            </VSCodeButton>
          ) : null}
        </div>
      </div>
      {props.dataProcessed === "inProgress" && (
        <div className="progress-container">
          <VSCodeProgressRing className="progressRing" />
          <span id="progressText">Die Daten werden verarbeitet...</span>
        </div>
      )}
    </>
  );
}

export default GeoPackage;
