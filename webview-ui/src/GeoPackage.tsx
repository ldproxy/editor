import "./App.css";
import React, { useState, useEffect } from "react";
import { VSCodeCheckbox, VSCodeProgressRing, VSCodeButton } from "@vscode/webview-ui-toolkit/react";

type PostgreSqlProps = {
  submitData: (data: Object) => void;
  selectedDataSource: any;
  dataProcessed: string;
  setDataProcessed(arg0: string): void;
  existingGeopackages: string[];
  handleUpdateData(key: string, value: string): void;
  gpkgData: Object;
  setGpkgData(arg0: Object): void;
  allTables: {
    [key: string]: string[];
  };
};

function GeoPackage(props: PostgreSqlProps) {
  const allSchemas = Object.keys(props.allTables);
  const [newGPKG, setNewGPKG] = useState<any>();
  const [existingGPKG, setExistingGPKG] = useState<string>("");
  const [filename, setFilename] = useState<string>("");
  const [selectedGeoPackageTable, setSelectedGeoPackageTable] = useState<{
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
      setSelectedGeoPackageTable({});
    }
  }, [props.selectedDataSource]);

  const selectAllSchemasWithTables = () => {
    const allSchemasAlreadySelected = allSchemas.every((schema) =>
      schemasSelectedinEntirety.includes(schema)
    );
    if (!allSchemasAlreadySelected) {
      setschemasSelectedinEntirety(
        schemasSelectedinEntirety.concat(
          allSchemas.filter((schema) => !schemasSelectedinEntirety.includes(schema))
        )
      );
      setSelectedGeoPackageTable(props.allTables);
    } else {
      setschemasSelectedinEntirety([]);
      setSelectedGeoPackageTable({});
    }
  };

  const handleTableSelection = (tableName: string, schema: string) => {
    if (selectedGeoPackageTable[schema]) {
      if (selectedGeoPackageTable[schema].includes(tableName)) {
        const updatedSelectedTables = {
          ...selectedGeoPackageTable,
          [schema]: selectedGeoPackageTable[schema].filter((table) => table !== tableName),
        };
        setSelectedGeoPackageTable(updatedSelectedTables);
      } else {
        const updatedSelectedTables = {
          ...selectedGeoPackageTable,
          [schema]: [...selectedGeoPackageTable[schema], tableName],
        };
        setSelectedGeoPackageTable(updatedSelectedTables);
      }
    } else {
      setSelectedGeoPackageTable({
        ...selectedGeoPackageTable,
        [schema]: [tableName],
      });
    }
  };

  useEffect(() => {
    if (props.selectedDataSource !== "GeoPackage") {
      setSelectedGeoPackageTable({});
    }
  }, [props.selectedDataSource]);

  const handleSelectAllTablesInSchema = (schema: string) => {
    const tablesInThisSchema: string[] = props.allTables[schema];
    if (!schemasSelectedinEntirety.includes(schema)) {
      setschemasSelectedinEntirety([...schemasSelectedinEntirety, schema]);

      const updatedSelectedTables = { ...selectedGeoPackageTable };
      updatedSelectedTables[schema] = tablesInThisSchema;

      setSelectedGeoPackageTable(updatedSelectedTables);
    } else {
      setschemasSelectedinEntirety(schemasSelectedinEntirety.filter((s) => s !== schema));
      const updatedSelectedTables = { ...selectedGeoPackageTable };
      delete updatedSelectedTables[schema];

      setSelectedGeoPackageTable(updatedSelectedTables);
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
    props.setGpkgData({});
  };

  console.log("selectedGeoPackageTable", selectedGeoPackageTable);
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
                  {props.allTables[schema].map((tableName: string) => (
                    <VSCodeCheckbox
                      key={tableName + Math.floor(Math.random() * 1000)}
                      checked={selectedGeoPackageTable[schema]?.includes(tableName)}
                      onClick={() => handleTableSelection(tableName, schema)}>
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
