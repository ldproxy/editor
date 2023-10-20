import { VSCodeCheckbox, VSCodeButton, VSCodeProgressRing } from "@vscode/webview-ui-toolkit/react";
import "./App.css";
import { useEffect, useState } from "react";

type TabelsProps = {
  selectedDataSource: string;
  allTables: {
    [key: string]: string[];
  };
  setDataProcessed(dataProcessed: string): void;
  handleGenerate(): void;
  selectedTable: {
    [key: string]: string[];
  };
  setSelectedTable(selectedTable: { [key: string]: string[] }): void;
  dataProcessed: string;
  sqlData: Object;
  wfsData: Object;
  gpkgData: Object;
  submitData(data: Object): void;
};

const Tables = (props: TabelsProps) => {
  const allSchemas = Object.keys(props.allTables);
  const [schemasSelectedinEntirety, setschemasSelectedinEntirety] = useState<string[]>([]);

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
      props.setSelectedTable(props.allTables);
    } else {
      setschemasSelectedinEntirety([]);
      props.setSelectedTable({});
    }
  };

  const handleTableSelection = (tableName: string, schema: string) => {
    if (props.selectedTable[schema]) {
      if (props.selectedTable[schema].includes(tableName)) {
        const updatedSelectedTables = {
          ...props.selectedTable,
          [schema]: props.selectedTable[schema].filter((table) => table !== tableName),
        };
        props.setSelectedTable(updatedSelectedTables);
      } else {
        const updatedSelectedTables = {
          ...props.selectedTable,
          [schema]: [...props.selectedTable[schema], tableName],
        };
        props.setSelectedTable(updatedSelectedTables);
      }
    } else {
      props.setSelectedTable({
        ...props.selectedTable,
        [schema]: [tableName],
      });
    }
  };

  useEffect(() => {
    if (props.selectedDataSource !== "GeoPackage") {
      props.setSelectedTable({});
    }
  }, [props.selectedDataSource]);

  const handleSelectAllTablesInSchema = (schema: string) => {
    const tablesInThisSchema: string[] = props.allTables[schema];
    if (!schemasSelectedinEntirety.includes(schema)) {
      setschemasSelectedinEntirety([...schemasSelectedinEntirety, schema]);

      const updatedSelectedTables = { ...props.selectedTable };
      updatedSelectedTables[schema] = tablesInThisSchema;

      props.setSelectedTable(updatedSelectedTables);
    } else {
      setschemasSelectedinEntirety(schemasSelectedinEntirety.filter((s) => s !== schema));
      const updatedSelectedTables = { ...props.selectedTable };
      delete updatedSelectedTables[schema];

      props.setSelectedTable(updatedSelectedTables);
    }
  };

  useEffect(() => {
    props.handleGenerate();
  }, [props.selectedTable]);

  const handleGenerateSubmit = () => {
    if (props.selectedDataSource === "PostgreSQL") {
      props.submitData(props.sqlData);
    } else if (props.selectedDataSource === "GeoPackage") {
      props.submitData(props.gpkgData);
    } else if (props.selectedDataSource === "WFS") {
      props.submitData(props.gpkgData);
    }
  };

  return (
    <>
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
                {props.allTables[schema].map((tableName) => (
                  <VSCodeCheckbox
                    key={tableName + Math.floor(Math.random() * 1000)}
                    checked={props.selectedTable[schema]?.includes(tableName)}
                    onClick={() => handleTableSelection(tableName, schema)}>
                    {tableName}
                  </VSCodeCheckbox>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
      </form>
      <div className="submitandBack">
        <VSCodeButton
          className="submitButton"
          onClick={handleGenerateSubmit}
          disabled={props.dataProcessed === "inProgress"}>
          Next
        </VSCodeButton>
        <VSCodeButton className="submitButton" onClick={() => props.setDataProcessed("")}>
          Back
        </VSCodeButton>
      </div>
      {props.dataProcessed === "inProgress" && (
        <div className="progress-container">
          <VSCodeProgressRing className="progressRing" />
          <span id="progressText">Die Daten werden verarbeitet...</span>
        </div>
      )}
    </>
  );
};

export default Tables;
