import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import "./App.css";
import { vscode } from "./utilities/vscode";

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
    </div>
  );
};

export default Final;
