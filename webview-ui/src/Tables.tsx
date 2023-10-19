import { VSCodeCheckbox, VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import "./App.css";
import { useEffect, useState } from "react";

type TabelsProps = {
  selectedDataSource: string;
  allTables: {
    [key: string]: string[];
  };
};

const Tables = (props: TabelsProps) => {
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
      <div className="submitandBack">
        <VSCodeButton className="submitButton">Next</VSCodeButton>
        <VSCodeButton className="submitButton">Back</VSCodeButton>
      </div>
    </>
  );
};

export default Tables;
