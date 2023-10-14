import "./App.css";
import React, { useState, useEffect } from "react";
import { VSCodeCheckbox, VSCodeProgressRing, VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import getGeoPackageTables from "./Testdaten/GeoPackageTabellen";

type PostgreSqlProps = {
  submitData: (data: JSON) => void;
  selectedDataSource: any;
  dataProcessed: string;
  setDataProcessed(arg0: string): void;
};

function GeoPackage(props: PostgreSqlProps) {
  const allTables = getGeoPackageTables();
  const allSchemas = Object.keys(allTables);
  const [GPKG, setGPKG] = useState<File | null | Blob>(null);
  const [filename, setFilename] = useState<string>("");
  const [selectedGeoPackageTable, setSelectedGeoPackageTable] = useState<string[]>([]);
  const [schemasSelectedinEntirety, setschemasSelectedinEntirety] = useState<string[]>([]);

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

  useEffect(() => {
    if (props.selectedDataSource !== "GeoPackage") {
      setGPKG(null);
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
    console.log("allSchemasAlreadySelected", allSchemasAlreadySelected);
    if (!allSchemasAlreadySelected) {
      setschemasSelectedinEntirety(
        schemasSelectedinEntirety.concat(
          allSchemas.filter((schema) => !schemasSelectedinEntirety.includes(schema))
        )
      );
      console.log("schemasSelectedinEntirety", schemasSelectedinEntirety);
      setSelectedGeoPackageTable(allTableNames);
      console.log("selectedTable", selectedGeoPackageTable);
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
        />
        {filename !== "" && <span id="GpkgName">{filename}</span>}
        <VSCodeButton
          className="submitButton"
          onClick={() => props.submitData}
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
          {allSchemas.length > 1 && (
            <div id="everything">
              <fieldset key="everything">
                <legend>Select all Schemas</legend>
                <VSCodeCheckbox
                  key="everything"
                  checked={allSchemas.every((schema) => schemasSelectedinEntirety.includes(schema))}
                  onChange={selectAllSchemasWithTables}>
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
                    onChange={() => handleSelectAllTablesInSchema(schema)}>
                    All
                  </VSCodeCheckbox>
                  {Object.keys(getGeoPackageTables()[schema]).map((tableName) => (
                    <VSCodeCheckbox
                      key={tableName}
                      checked={selectedGeoPackageTable.includes(tableName)}
                      onChange={() => handleTableSelection(tableName)}>
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
