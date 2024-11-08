import { VSCodeCheckbox, VSCodeButton, VSCodeProgressRing } from "@vscode/webview-ui-toolkit/react";
import { useRecoilState, useRecoilValue } from "recoil";

import { SetterOrUpdater } from "recoil";

import { atomSyncString, atomSyncObject, atomSyncBoolean } from "../utilities/recoilSyncWrapper";
import { DEV } from "../utilities/constants";
import { useEffect, useState } from "react";

export const selectedTablesAtom = atomSyncObject<TableData>("selectedTablesValues", {}, "StoreA");

export const allTablesAtom = atomSyncObject<TableData>("allTablesValues", {}, "StoreA");

export type TableData = {
  [key: string]: string;
};

export const currentTableAtom = atomSyncString("currentTableValues", "", "StoreA");

type TablesProps = {
  details: TableData;
  generate(data: Object): void;
  success: string;
  error: string;
  setCollectionColors: SetterOrUpdater<object>;
  onBack: () => void;
};

const CollectionTables = ({
  generate,
  details,
  success,
  error,
  setCollectionColors,
  onBack,
}: TablesProps) => {
  const [allTables, setAllTables] = useRecoilState<TableData>(allTablesAtom);
  const [selectedTables, setSelectedTables] = useRecoilState<TableData>(selectedTablesAtom);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setAllTables(details);
  }, [details]);

  useEffect(() => {
    setSelectedTables(allTables);
  }, [allTables, setSelectedTables]);

  const handleTableSelection = (tableName: string) => {
    if (selectedTables[tableName]) {
      const updatedSelectedTables = { ...selectedTables };
      delete updatedSelectedTables[tableName];
      setSelectedTables(updatedSelectedTables);
    } else {
      setSelectedTables({
        ...selectedTables,
        [tableName]: allTables[tableName],
      });
    }
  };

  const handleSelectAllTables = () => {
    const allSelected = Object.keys(allTables).length === Object.keys(selectedTables).length;

    if (!allSelected) {
      setSelectedTables({ ...allTables });
    } else {
      setSelectedTables({});
    }
  };

  const areAllTablesSelected = () => {
    return Object.keys(allTables).length === Object.keys(selectedTables).length;
  };

  const handleColorChange = (tableName: string, color: string) => {
    setSelectedTables({
      ...selectedTables,
      [tableName]: color,
    });
  };

  return (
    <>
      <form id="outerContainerCheckboxes">
        <h3>Select all Collections</h3>
        {Object.keys(allTables).length > 1 && (
          <div id="everything" style={{ marginBottom: "15px" }}>
            <fieldset key="everything">
              <legend>Select all Collections</legend>
              <VSCodeCheckbox
                key="everything"
                checked={areAllTablesSelected()}
                onClick={handleSelectAllTables}>
                All
              </VSCodeCheckbox>
            </fieldset>
          </div>
        )}
        <div className="mappedCheckboxesContainer">
          <fieldset className="checkbox-fieldset">
            <legend>Collections</legend>
            {Object.keys(allTables).map((tableName) => (
              <div
                className="checkbox-container"
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: "5px",
                }}>
                <VSCodeCheckbox
                  key={tableName}
                  checked={!!selectedTables[tableName]}
                  onClick={() => handleTableSelection(tableName)}>
                  {tableName}
                </VSCodeCheckbox>
                <div>
                  <input
                    type="color"
                    value={selectedTables[tableName] || allTables[tableName]}
                    onChange={(e) => handleColorChange(tableName, e.target.value)}
                    style={{
                      border: "none",
                      outline: "none",
                      padding: "0",
                      margin: "0",
                      cursor: "pointer",
                      height: "23px",
                    }}
                  />
                </div>
              </div>
            ))}
          </fieldset>
        </div>
      </form>
      <div
        className="submitAndReset"
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          marginTop: "15px",
          marginBottom: "15px",
        }}>
        <VSCodeButton className="submitButton" style={{ marginRight: "10px" }} onClick={onBack}>
          Back
        </VSCodeButton>
        <VSCodeButton
          className="submitButton"
          style={{ marginRight: "15px" }}
          onClick={() => {
            generate(selectedTables);
            setLoading(true);
            setCollectionColors(selectedTables);
          }}
          disabled={Object.keys(selectedTables).length === 0}>
          Next
        </VSCodeButton>
        {success === "" && error === "" && loading && (
          <div className="progress-container">
            <VSCodeProgressRing
              className="progressRing"
              style={{ width: "1.3em", height: "1.3em" }}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default CollectionTables;
