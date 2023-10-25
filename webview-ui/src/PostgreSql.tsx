import {
  VSCodeButton,
  VSCodeTextField,
  VSCodeProgressRing,
} from "@vscode/webview-ui-toolkit/react";
import "./App.css";
import { BasicData } from "./utilities/xtracfg";

export type SqlData = BasicData & {
  host?: string;
  database?: string;
  user?: string;
  password?: string;
};

type PostgreSqlProps = {
  submitData: (data: Object) => void;
  handleUpdateData(key: string, value: string): void;
  dataProcessing: string;
  sqlData: SqlData;
};

function PostgreSql(props: PostgreSqlProps) {
  return (
    <div className="frame">
      <div className="postgresWfsOuterContainer">
        <div className="postgresWfsInnerContainer">
          <section className="component-example">
            <VSCodeTextField
              value={props.sqlData.host ? props.sqlData.host : undefined || ""}
              disabled={props.dataProcessing === "inProgress"}
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
              value={props.sqlData.database ? props.sqlData.database : undefined || ""}
              disabled={props.dataProcessing === "inProgress"}
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
              value={props.sqlData.user ? props.sqlData.user : undefined || ""}
              disabled={props.dataProcessing === "inProgress"}
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
              value={props.sqlData.password ? props.sqlData.password : undefined || ""}
              disabled={props.dataProcessing === "inProgress"}
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
        <div className="submitAndReset">
          <VSCodeButton
            className="submitButton"
            onClick={() => props.submitData(props.sqlData)}
            disabled={props.dataProcessing === "inProgress"}>
            Next
          </VSCodeButton>
        </div>
      </div>
      {props.dataProcessing === "inProgress" && (
        <div className="progress-container">
          <VSCodeProgressRing className="progressRing" />
          <span id="progressText">Analyzing database ...</span>
        </div>
      )}
    </div>
  );
}

export default PostgreSql;
