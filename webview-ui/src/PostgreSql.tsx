import {
  VSCodeButton,
  VSCodeTextField,
  VSCodeProgressRing,
  VSCodeCheckbox,
} from "@vscode/webview-ui-toolkit/react";
import "./App.css";
import { useEffect, useState } from "react";

type PostgreSqlProps = {
  submitData: (data: Object) => void;
  handleUpdateData(key: string, value: string): void;
  dataProcessed: string;
  selectedDataSource: string;
  sqlData: Object;
  allTables: {
    [key: string]: string[];
  };
};

function PostgreSql(props: PostgreSqlProps) {
  const allSchemas = Object.keys(props.allTables);
  const [selectedTable, setSelectedTable] = useState<{
    [schema: string]: string[];
  }>({});
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
      setSelectedTable(props.allTables);
    } else {
      setschemasSelectedinEntirety([]);
      setSelectedTable({});
    }
  };

  const handleTableSelection = (tableName: string, schema: string) => {
    if (selectedTable[schema]) {
      if (selectedTable[schema].includes(tableName)) {
        const updatedSelectedTables = {
          ...selectedTable,
          [schema]: selectedTable[schema].filter((table) => table !== tableName),
        };
        setSelectedTable(updatedSelectedTables);
      } else {
        const updatedSelectedTables = {
          ...selectedTable,
          [schema]: [...selectedTable[schema], tableName],
        };
        setSelectedTable(updatedSelectedTables);
      }
    } else {
      setSelectedTable({
        ...selectedTable,
        [schema]: [tableName],
      });
    }
  };

  useEffect(() => {
    if (props.selectedDataSource !== "GeoPackage") {
      setSelectedTable({});
    }
  }, [props.selectedDataSource]);

  const handleSelectAllTablesInSchema = (schema: string) => {
    const tablesInThisSchema: string[] = props.allTables[schema];
    if (!schemasSelectedinEntirety.includes(schema)) {
      setschemasSelectedinEntirety([...schemasSelectedinEntirety, schema]);

      const updatedSelectedTables = { ...selectedTable };
      updatedSelectedTables[schema] = tablesInThisSchema;

      setSelectedTable(updatedSelectedTables);
    } else {
      setschemasSelectedinEntirety(schemasSelectedinEntirety.filter((s) => s !== schema));
      const updatedSelectedTables = { ...selectedTable };
      delete updatedSelectedTables[schema];

      setSelectedTable(updatedSelectedTables);
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
                  props.handleUpdateData("host", target.value);
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
                  props.handleUpdateData("database", target.value);
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
                  props.handleUpdateData("user", target.value);
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
                  props.handleUpdateData("password", target.value);
                }
              }}>
              Password
            </VSCodeTextField>
          </section>
        </div>
        <div className="postgresWfsSubmit">
          <VSCodeButton
            className="submitButton"
            onClick={() => props.submitData(props.sqlData)}
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
                      checked={selectedTable[schema]?.includes(tableName)}
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
    </div>
  );
}

export default PostgreSql;
