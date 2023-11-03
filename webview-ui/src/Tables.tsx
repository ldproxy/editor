import { VSCodeCheckbox, VSCodeButton, VSCodeProgressRing } from "@vscode/webview-ui-toolkit/react";
import "./App.css";
import { SqlData } from "./PostgreSql";
import { WfsData } from "./Wfs";
import { GpkgData } from "./GeoPackage";
import { atom, useRecoilState, useRecoilValue } from "recoil";

export const allTablesAtom = atom({
  key: "allTables",
  default: {},
});

export const selectedTablesAtom = atom({
  key: "selectedTables",
  default: {},
});

const schemasSelectedinEntiretyAtom = atom({
  key: "schemasSelectedinEntirety",
  default: [""],
});

export type TableData = {
  [key: string]: string[];
};

type TabelsProps = {
  selectedDataSource: string;
  setDataProcessing(dataProcessing: string): void;
  dataProcessing: string;
  sqlData: SqlData;
  wfsData: WfsData;
  gpkgData: GpkgData;
  submitData(data: Object): void;
  setWfsData(wfsData: Object): void;
  setGpkgData(gpkgData: Object): void;
  generateProgress: string;
  generate(data: Object): void;
};

const Tables = (props: TabelsProps) => {
  const allTables = useRecoilValue<TableData>(allTablesAtom);
  const allSchemas = Object.keys(allTables);
  const [schemasSelectedinEntirety, setschemasSelectedinEntirety] = useRecoilState<string[]>(
    schemasSelectedinEntiretyAtom
  );
  const [selectedTables, setSelectedTables] = useRecoilState<TableData>(selectedTablesAtom);

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
      setSelectedTables(allTables);
    } else {
      setschemasSelectedinEntirety([]);
      setSelectedTables({});
    }
  };

  const handleTableSelection = (tableName: string, schema: string) => {
    if (selectedTables[schema]) {
      if (selectedTables[schema].includes(tableName)) {
        const updatedSelectedTables = {
          ...selectedTables,
          [schema]: selectedTables[schema].filter((table) => table !== tableName),
        };
        if (updatedSelectedTables[schema].length === 0) {
          delete updatedSelectedTables[schema];
        }
        setSelectedTables(updatedSelectedTables);
      } else {
        const updatedSelectedTables = {
          ...selectedTables,
          [schema]: [...selectedTables[schema], tableName],
        };
        setSelectedTables(updatedSelectedTables);
      }
    } else {
      setSelectedTables({
        ...selectedTables,
        [schema]: [tableName],
      });
    }
  };

  const handleSelectAllTablesInSchema = (schema: string) => {
    const tablesInThisSchema: string[] = allTables[schema];

    if (!schemasSelectedinEntirety.includes(schema)) {
      setschemasSelectedinEntirety([...schemasSelectedinEntirety, schema]);

      const updatedSelectedTables = { ...selectedTables };
      updatedSelectedTables[schema] = tablesInThisSchema;

      setSelectedTables(updatedSelectedTables);
    } else {
      setschemasSelectedinEntirety(schemasSelectedinEntirety.filter((s) => s !== schema));
      const updatedSelectedTables = { ...selectedTables };
      delete updatedSelectedTables[schema];

      setSelectedTables(updatedSelectedTables);
    }
  };

  //remove all but dataprocessing
  const handleBack = () => {
    props.setDataProcessing("");
    setSelectedTables({});
  };

  const isAllSelectedInSchema = (schema: string) => {
    const tablesInSchema = allTables[schema] || [];
    const selectedTablesInSchema = selectedTables[schema] || [];
    return tablesInSchema.length === selectedTablesInSchema.length;
  };

  const areAllTablesSelected = () => {
    const allTablesKeys = Object.keys(allTables);
    const selectedTablesKeys = Object.keys(selectedTables);

    if (allTablesKeys.length !== selectedTablesKeys.length) {
      return false;
    }

    for (const key of allTablesKeys) {
      const allTablesArray: string[] = allTables[key];
      const selectedTablesArray: string[] = selectedTables[key];

      if (allTablesArray.length !== selectedTablesArray.length) {
        return false;
      }
    }

    return true;
  };

  console.log("selectedTables", selectedTables);

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
                checked={areAllTablesSelected()}
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
                  checked={isAllSelectedInSchema(schema)}
                  onClick={() => handleSelectAllTablesInSchema(schema)}>
                  All
                </VSCodeCheckbox>
                {allTables[schema].map((tableName) => (
                  <VSCodeCheckbox
                    key={tableName + schema}
                    checked={selectedTables[schema]?.includes(tableName)}
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
          onClick={() => props.generate(selectedTables)}
          disabled={
            props.dataProcessing === "inProgressGenerating" ||
            Object.keys(selectedTables).length === 0
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
