import { VSCodeProgressRing } from "@vscode/webview-ui-toolkit/react";
import "./App.css";
import { SchemaTables } from "./utilities/xtracfg";

type ProgressProps = {
  currentTable: string;
  progress: { [key: string]: string[] };
  selectedTable: SchemaTables;
  dataProcessed: string;
};

const Progress = (props: ProgressProps) => {
  return (
    <div>
      {Object.keys(props.progress).map((schema, schemaIndex) => (
        <div key={schemaIndex}>
          <span>{schema}</span>
          {props.progress[schema].map((table, tableIndex) =>
            table !== props.currentTable.split(".")[1] ? (
              <div key={tableIndex}>
                <div>✓ {table}</div>
              </div>
            ) : props.dataProcessed === "generated" ? (
              <div key={tableIndex}>
                <div>✓ {table}</div>
              </div>
            ) : null
          )}
          {props.currentTable &&
          !Object.values(props.progress).flat().includes(props.currentTable) &&
          props.currentTable.split(".")[0] === schema &&
          props.dataProcessed !== "generated" ? (
            <div>
              <VSCodeProgressRing className="progressRing" />
              {props.currentTable.split(".")[1]}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
};

export default Progress;
