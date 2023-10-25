import { VSCodeCheckbox, VSCodeButton, VSCodeProgressRing } from "@vscode/webview-ui-toolkit/react";
import "./App.css";
import { useEffect, useState } from "react";
import { SqlData } from "./PostgreSql";
import { WfsData } from "./Wfs";
import { GpkgData } from "./GeoPackage";

export type TableData = {
  [key: string]: string[];
};

type TabelsProps = {
  selectedDataSource: string;
  allTables: TableData;
  setDataProcessing(dataProcessing: string): void;
  handleGenerate(): void;
  selectedTable: TableData;
  setSelectedTable(selectedTable: TableData): void;
  dataProcessing: string;
  sqlData: SqlData;
  wfsData: WfsData;
  gpkgData: GpkgData;
  submitData(data: Object): void;
  setSqlData(sqlData: Object): void;
  setWfsData(wfsData: Object): void;
  setGpkgData(gpkgData: Object): void;
  handleUpdateData(key: string, value: string): void;
  generateProgress: string;
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
        if (updatedSelectedTables[schema].length === 0) {
          delete updatedSelectedTables[schema];
        }
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
    if (props.selectedDataSource !== "GPKG") {
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
    if (props.selectedDataSource === "PGIS") {
      props.submitData(props.sqlData);
    } else if (props.selectedDataSource === "GPKG") {
      props.submitData(props.gpkgData);
    } else if (props.selectedDataSource === "WFS") {
      props.submitData(props.gpkgData);
    }
  };

  const handleBack = () => {
    props.setDataProcessing("");
    props.setSelectedTable({});

    if (props.selectedDataSource === "PGIS") {
      const { types, ...sqlDataWithoutSelectedTables } = props.sqlData;
      props.setSqlData(sqlDataWithoutSelectedTables);
    } else if (props.selectedDataSource === "GPKG") {
      const { types, ...gpkgDataWithoutSelectedTables } = props.gpkgData;
      props.setGpkgData(gpkgDataWithoutSelectedTables);
    } else if (props.selectedDataSource === "WFS") {
      const { types, ...wfsDataWithoutSelectedTables } = props.wfsData;
      props.setWfsData(wfsDataWithoutSelectedTables);
    }

    props.handleUpdateData("subcommand", "analyze");
  };

  console.log("selectedTables", props.selectedTable);

  // TODO: use indeterminate={true} for All checkboxes when not all/nothing checked
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
            <fieldset key={schema} className="checkbox-fieldset">
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
      <div className="submitAndReset">
        <VSCodeButton className="submitButton" onClick={handleBack}>
          Back
        </VSCodeButton>
        <VSCodeButton
          className="submitButton"
          onClick={handleGenerateSubmit}
          disabled={
            props.dataProcessing === "inProgressGenerating" ||
            Object.keys(props.selectedTable).length === 0
          }>
          Next
        </VSCodeButton>
      </div>
      {props.dataProcessing === "inProgressGenerating" && (
        <div className="progress-container">
          <VSCodeProgressRing className="progressRing" />
          <span id="progressText">{props.generateProgress} ...</span>
        </div>
      )}
    </>
  );
};

export default Tables;
