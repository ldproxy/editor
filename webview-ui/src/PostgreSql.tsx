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
  const geoPackageTables: string[] = Object.keys(getGeoPackageTables());
  const [selectedTable, setSelectedTable] = useState<string[]>([]);

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
          <fieldset>
            <legend>Choose tables</legend>
            <div className="checkbox-container">
              {geoPackageTables.map((tableName) => (
                <VSCodeCheckbox
                  key={tableName}
                  checked={selectedTable.includes(tableName)}
                  onChange={() => handleTableSelection(tableName)}>
                  {tableName}
                </VSCodeCheckbox>
              ))}
            </div>
          </fieldset>
        </form>
      )}{" "}
    </div>
  );
}

export default PostgreSql;
