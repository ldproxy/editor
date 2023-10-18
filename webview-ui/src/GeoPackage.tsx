import "./App.css";
import React, { useState, useEffect } from "react";
import { VSCodeCheckbox, VSCodeProgressRing, VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import getGeoPackageTables from "./Testdaten/GeoPackageTabellen";

type PostgreSqlProps = {
  submitData: (data: JSON) => void;
  selectedDataSource: any;
  dataProcessed: string;
  setDataProcessed(arg0: string): void;
  existingGeopackages: string[];
};

function GeoPackage(props: PostgreSqlProps) {
  const allTables = getGeoPackageTables();
  const allSchemas = Object.keys(allTables);
  const [newGPKG, setNewGPKG] = useState<string>("");
  const [existingGPKG, setExistingGPKG] = useState<string>("");
  const [filename, setFilename] = useState<string>("");
  const [selectedGeoPackageTable, setSelectedGeoPackageTable] = useState<string[]>([]);
  const [schemasSelectedinEntirety, setschemasSelectedinEntirety] = useState<string[]>([]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewGPKG(file.name);
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

  useEffect(() => {
    if (props.selectedDataSource !== "GeoPackage") {
      setNewGPKG("");
      setExistingGPKG("");
      setFilename("");
      setSelectedGeoPackageTable([]);
    }
  }, [props.selectedDataSource]);

  const selectAllSchemasWithTables = () => {
    const allTableNames = [];

    for (const schema in allTables) {
      const schemas = allTables[schema];
      const tableNames = Object.keys(schemas);
      allTableNames.push(...tableNames);
    }

    const allSchemasAlreadySelected = allSchemas.every((schema) =>
      schemasSelectedinEntirety.includes(schema)
    );
    if (!allSchemasAlreadySelected) {
      setschemasSelectedinEntirety(
        schemasSelectedinEntirety.concat(
          allSchemas.filter((schema) => !schemasSelectedinEntirety.includes(schema))
        )
      );
      setSelectedGeoPackageTable(allTableNames);
    } else {
      setschemasSelectedinEntirety([]);
      setSelectedGeoPackageTable([]);
    }
  };

  const handleTableSelection = (tableName: string) => {
    if (selectedGeoPackageTable.includes(tableName)) {
      setSelectedGeoPackageTable(selectedGeoPackageTable.filter((table) => table !== tableName));
    } else {
      setSelectedGeoPackageTable([...selectedGeoPackageTable, tableName]);
    }
  };

  useEffect(() => {
    if (props.selectedDataSource !== "GeoPackage") {
      setSelectedGeoPackageTable([]);
    }
  }, [props.selectedDataSource]);

  const handleSelectAllTablesInSchema = (schema: string) => {
    const tablesInThisSchema: string[] = Object.keys(allTables[schema]);
    if (!schemasSelectedinEntirety.includes(schema)) {
      setschemasSelectedinEntirety([...schemasSelectedinEntirety, schema]);

      setSelectedGeoPackageTable((selectedTable) => selectedTable.concat(tablesInThisSchema));
    } else {
      setschemasSelectedinEntirety(schemasSelectedinEntirety.filter((s) => s !== schema));
      setSelectedGeoPackageTable((prevSelectedTable) =>
        prevSelectedTable.filter((tableName) => !tablesInThisSchema.includes(tableName))
      );
    }
  };

  const handleReset = () => {
    setExistingGPKG("");
    setNewGPKG("");
    setFilename("");
    const fileInput = document.getElementById("geoInput") as HTMLInputElement | null;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  return (
    <>
      <div className="button-container">
        {!existingGPKG ? (
          <label htmlFor="geoInput" id="uploadLabel">
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
        or
        <select
          className="dropdown"
          placeholder="Choose existing File..."
          value={existingGPKG}
          onChange={(event) => setExistingGPKG(event.target.value)}
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
        <div className="submitAndReset">
          <VSCodeButton
            className="submitButton"
            onClick={() => props.submitData}
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
      {filename !== "" && (
        <form id="outerContainerCheckboxes">
          {allSchemas.length > 1 && (
            <div id="everything">
              <fieldset key="everything">
                <legend>Select all Schemas</legend>
                <VSCodeCheckbox
                  key="everything"
                  checked={allSchemas.every((schema) => schemasSelectedinEntirety.includes(schema))}
                  onClick={selectAllSchemasWithTables}>
                  All
                </VSCodeCheckbox>
              </fieldset>
            </div>
          )}
          <div className="mappedCheckboxesContainer">
            {allSchemas.map((schema) => (
              <fieldset key={schema}>
                <legend>{schema}</legend>
                <div className="checkbox-container">
                  <VSCodeCheckbox
                    key={schema}
                    checked={schemasSelectedinEntirety.includes(schema)}
                    onClick={() => handleSelectAllTablesInSchema(schema)}>
                    All
                  </VSCodeCheckbox>
                  {Object.keys(getGeoPackageTables()[schema]).map((tableName) => (
                    <VSCodeCheckbox
                      key={tableName}
                      checked={selectedGeoPackageTable.includes(tableName)}
                      onClick={() => handleTableSelection(tableName)}>
                      {tableName}
                    </VSCodeCheckbox>
                  ))}
                </div>
              </fieldset>
            ))}
          </div>
        </form>
      )}
    </>
  );
}

export default GeoPackage;
