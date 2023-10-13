import "./App.css";
import React, { useState, useEffect } from "react";
import { VSCodeCheckbox, VSCodeProgressRing, VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import getGeoPackageTables from "./Testdaten/GeoPackageTabellen";

type PostgreSqlProps = {
  submitData: () => void;
  selectedDataSource: any;
  dataProcessed: string;
  setDataProcessed(arg0: string): void;
};

function GeoPackage(props: PostgreSqlProps) {
  const [GPKG, setGPKG] = useState<File | null | Blob>(null);
  const [filename, setFilename] = useState<string>("");
  const geoPackageTables: string[] = Object.keys(getGeoPackageTables());
  const [selectedGeoPackageTable, setSelectedGeoPackageTable] = useState<string[]>([]);
  const [selectAllTables, setSelectAllTables] = useState(false);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setGPKG(file);
      setFilename(file.name);
      console.log("GP", file);

      file.arrayBuffer().then((buffer: ArrayBuffer) => {
        const uint8Array = new Uint8Array(buffer);
        const charArray = Array.from(uint8Array).map((charCode) => String.fromCharCode(charCode));
        const base64String = btoa(charArray.join(""));
        console.log(base64String);
      });
    }
  };

  const handleTableSelection = (tableName: string) => {
    if (selectedGeoPackageTable.includes(tableName)) {
      setSelectedGeoPackageTable(selectedGeoPackageTable.filter((table) => table !== tableName));
    } else {
      setSelectedGeoPackageTable([...selectedGeoPackageTable, tableName]);
    }
  };

  const handleSelectAllTables = () => {
    setSelectAllTables(!selectAllTables);
    if (selectAllTables) {
      console.log("selectAllTables in Funktion", selectAllTables);
      setSelectedGeoPackageTable(geoPackageTables);
    } else {
      setSelectedGeoPackageTable([]);
    }
  };

  useEffect(() => {
    if (props.selectedDataSource !== "GeoPackage") {
      setSelectedGeoPackageTable([]);
    }
  }, [props.selectedDataSource]);

  useEffect(() => {
    if (props.selectedDataSource !== "GeoPackage") {
      setGPKG(null);
      setFilename("");
      setSelectedGeoPackageTable([]);
    }
  }, [props.selectedDataSource]);

  console.log("selected Tables", selectedGeoPackageTable);

  return (
    <>
      <div className="button-container">
        <label htmlFor="geoInput" id="uploadLabel">
          Choose File
        </label>
        <input
          id="geoInput"
          type="file"
          onChange={(event) => onFileChange(event)}
          accept=".gpkg"
          multiple={false}
          style={{ display: "none" }}
        />
        {filename !== "" && <span id="GpkgName">{filename}</span>}
        <VSCodeButton
          className="submitButton"
          onClick={props.submitData}
          disabled={props.dataProcessed === "inProgress"}>
          Next
        </VSCodeButton>
      </div>
      {props.dataProcessed === "inProgress" && (
        <div className="progress-container">
          <VSCodeProgressRing className="progressRing" />
          <span id="progressText">Die Daten werden verarbeitet...</span>
        </div>
      )}
      {filename !== "" && (
        <form id="outerContainerCheckboxes">
          <fieldset>
            <legend>Choose tables</legend>
            <div className="checkbox-container">
              <VSCodeCheckbox checked={selectAllTables} onChange={handleSelectAllTables}>
                All
              </VSCodeCheckbox>
              {geoPackageTables.map((tableName) => (
                <VSCodeCheckbox
                  key={tableName}
                  checked={selectedGeoPackageTable.includes(tableName)}
                  onChange={() => handleTableSelection(tableName)}>
                  {tableName}
                </VSCodeCheckbox>
              ))}
            </div>
          </fieldset>
        </form>
      )}
    </>
  );
}

export default GeoPackage;
