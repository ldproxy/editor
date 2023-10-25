import { VSCodeProgressRing } from "@vscode/webview-ui-toolkit/react";
import "./App.css";
import { SchemaTables } from "./utilities/xtracfg";

type ProgressProps = {
  currentTable: string;
  progress: { [key: string]: string[] };
  selectedTable: SchemaTables;
};

const Progress = (props: ProgressProps) => {
  return (
    <div>
      {Object.keys(props.selectedTable).map((schema: string) => (
        <div key={schema}>
          {props.selectedTable[schema].map((tableName: string) => (
            <div key={tableName}>
              {tableName === props.currentTable ? (
                <div>
                  <VSCodeProgressRing />
                  {tableName}
                </div>
              ) : props.progress[schema].includes(tableName) ? (
                <div>✓ {tableName}</div>
              ) : (
                <div>{tableName}</div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Progress;
