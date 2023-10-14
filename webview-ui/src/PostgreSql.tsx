import {
  VSCodeButton,
  VSCodeTextField,
  VSCodeProgressRing,
  VSCodeCheckbox,
} from "@vscode/webview-ui-toolkit/react";
import getGeoPackageTables from "./Testdaten/GeoPackageTabellen";
import "./App.css";
import { useEffect, useState } from "react";

type PostgreSqlProps = {
  submitData: () => void;
  handleUpdateData(key: string, value: string): void;
  dataProcessed: string;
  selectedDataSource: any;
};

function PostgreSql(props: PostgreSqlProps) {
  const allTables = getGeoPackageTables();
  const allSchemas = Object.keys(allTables);
  const [selectedTable, setSelectedTable] = useState<string[]>([]);
  const [schemasSelectedinEntirety, setschemasSelectedinEntirety] = useState<string[]>([]);

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
      setSelectedTable(allTableNames);
      console.log("selectedTable", selectedTable);
    } else {
      setschemasSelectedinEntirety([]);
      setSelectedTable([]);
    }
  };

  const handleTableSelection = (tableName: string) => {
    if (selectedTable.includes(tableName)) {
      setSelectedTable(selectedTable.filter((table) => table !== tableName));
    } else {
      setSelectedTable([...selectedTable, tableName]);
    }
  };

  useEffect(() => {
    if (props.selectedDataSource !== "GeoPackage") {
      setSelectedTable([]);
    }
  }, [props.selectedDataSource]);

  const handleSelectAllTablesInSchema = (schema: string) => {
    const tablesInThisSchema: string[] = Object.keys(allTables[schema]);
    if (!schemasSelectedinEntirety.includes(schema)) {
      setschemasSelectedinEntirety([...schemasSelectedinEntirety, schema]);

      setSelectedTable((selectedTable) => selectedTable.concat(tablesInThisSchema));
    } else {
      setschemasSelectedinEntirety(schemasSelectedinEntirety.filter((s) => s !== schema));
      setSelectedTable((prevSelectedTable) =>
        prevSelectedTable.filter((tableName) => !tablesInThisSchema.includes(tableName))
      );
    }
  };

  return (
    <div className="frame">
      <div className="postgresWfsOuterContainer">
        <div className="postgresWfsInnerContainer">
          <section className="component-example">
            <VSCodeTextField
              onChange={(e) => {
                const target = e.target as HTMLInputElement;
                if (target) {
                  props.handleUpdateData("Host", target.value);
                }
              }}>
              Host
            </VSCodeTextField>
          </section>
          <section className="component-example">
            <VSCodeTextField
              onChange={(e) => {
                const target = e.target as HTMLInputElement;
                if (target) {
                  props.handleUpdateData("Database", target.value);
                }
              }}>
              Database
            </VSCodeTextField>
          </section>
          <section className="component-example">
            <VSCodeTextField
              onChange={(e) => {
                const target = e.target as HTMLInputElement;
                if (target) {
                  props.handleUpdateData("User", target.value);
                }
              }}>
              User
            </VSCodeTextField>
          </section>
          <section className="component-example">
            <VSCodeTextField
              onChange={(e) => {
                const target = e.target as HTMLInputElement;
                if (target) {
                  props.handleUpdateData("Password", target.value);
                }
              }}>
              Password
            </VSCodeTextField>
          </section>
        </div>
        <div className="postgresWfsSubmit">
          <VSCodeButton
            className="submitButton"
            onClick={props.submitData}
            disabled={props.dataProcessed === "inProgress"}>
            Next
          </VSCodeButton>
        </div>
      </div>
      {props.dataProcessed === "inProgress" && (
        <div className="progress-container">
          <VSCodeProgressRing className="progressRing" />
          <span id="progressText">Die Daten werden verarbeitet...</span>
        </div>
      )}
      {props.dataProcessed !== "inProgress" && (
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
                      checked={selectedTable.includes(tableName)}
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
    </div>
  );
}

export default PostgreSql;
