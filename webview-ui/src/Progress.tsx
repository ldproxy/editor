import { VSCodeProgressRing } from "@vscode/webview-ui-toolkit/react";
import "./App.css";
import { SchemaTables } from "./utilities/xtracfg";

type ProgressProps = {
  currentTable: string;
  progress: { [key: string]: string[] };
  selectedTable: SchemaTables;
  dataProcessed: string;
  currentCount: number;
  targetCount: number;
};

const Progress = (props: ProgressProps) => {
  return (
    <div className="progress">
      {Object.keys(props.progress).map((schema, schemaIndex) => {
        const tablesForSchema = props.progress[schema];
        const completedTables = tablesForSchema.filter((table) => {
          return table !== props.currentTable.split(".")[1] || props.dataProcessed === "generated";
        });

        return (
          <div key={schemaIndex}>
            <span className="schema-bullet">&#8226; {schema}</span>
            {completedTables.length === props.selectedTable[schema].length ? (
              <span className="table-item">✓</span>
            ) : (
              <span className="table-item">
                {completedTables.length} / {props.selectedTable[schema].length}
              </span>
            )}
            {completedTables.length === props.selectedTable[schema].length ? null : (
              <ul>
                {props.progress[schema].map((table, tableIndex) => {
                  if (table !== props.currentTable.split(".")[1]) {
                    return (
                      <div key={tableIndex}>
                        <span className="table-item">✓ {table}</span>
                      </div>
                    );
                  } else if (props.dataProcessed === "generated") {
                    return (
                      <div key={tableIndex}>
                        <span className="table-item">✓ {table}</span>
                      </div>
                    );
                  }
                  return null;
                })}
                {props.currentTable &&
                !Object.values(props.progress).flat().includes(props.currentTable) &&
                props.currentTable.split(".")[0] === schema &&
                props.dataProcessed !== "generated" ? (
                  <div className="spinnerTable">
                    <VSCodeProgressRing className="progressRing2" />
                    <span className="table-item"> {props.currentTable.split(".")[1]}</span>
                  </div>
                ) : null}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
};
export default Progress;
