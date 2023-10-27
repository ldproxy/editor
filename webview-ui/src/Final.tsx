import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import "./App.css";
import { vscode } from "./utilities/vscode";
import Progress from "./Progress";
import { SchemaTables } from "./utilities/xtracfg";

type FinalProps = {
  workspace: string;
  sqlData: Object;
  wfsData: Object;
  gpkgData: Object;
  selectedDataSource: string;
  setDataProcessing: Function;
  setGpkgData: Function;
  setSqlData: Function;
  setWfsData: Function;
  setSelectedTable: Function;
  namesOfCreatedFiles: Array<string>;
  currentTable: string;
  progress: { [key: string]: string[] };
  selectedTable: SchemaTables;
  dataProcessing: string;
  currentCount: number;
  targetCount: number;
};

const Final = (props: FinalProps) => {
  const onClose = () => {
    vscode.postMessage({ command: "closeWebview" });
  };

  const onCreateAnother = () => {
    props.setDataProcessing("");
    props.setGpkgData({});
    props.setSqlData({});
    props.setWfsData({});
    props.setSelectedTable({});
  };

  const onLinkClick = (file: string) => {
    vscode.postMessage({
      command: "success",
      text: `${props.workspace}/${file}`,
    });
    vscode.getState();
  };

  return (
    <div className="final-container">
      <Progress
        currentTable={props.currentTable}
        progress={props.progress}
        selectedTable={props.selectedTable}
        dataProcessed={props.dataProcessing}
        currentCount={props.currentCount}
        targetCount={props.targetCount}
      />
      {props.dataProcessing === "generated" ? (
        <div className="final-content">
          <h2 className="final-title">The following files were created.</h2>
          <ul>
            {props.namesOfCreatedFiles.map((file, index) => {
              const parts = file.split("/");
              const fileName = parts[parts.length - 1];
              return (
                <li key={index}>
                  <a
                    key={index}
                    href={`${props.workspace}/${fileName}`}
                    className="final-link"
                    onClick={() => onLinkClick(fileName)}>
                    {file}
                  </a>
                </li>
              );
            })}
          </ul>
          <div className="final-buttons">
            <VSCodeButton className="final-dismiss" onClick={onClose}>
              Dismiss
            </VSCodeButton>
            <VSCodeButton className="final-create-another" onClick={onCreateAnother}>
              Create Another
            </VSCodeButton>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Final;
