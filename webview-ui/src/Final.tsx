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
      text: `${props.workspace}/entities/instances/providers/${file}`,
    });
  };

  return (
    <div className="final-container">
      <div className="final-content">
        <h2 className="final-title">Files created.</h2>
        {props.namesOfCreatedFiles.map((file, index) => (
          <a
            key={index}
            href={`${props.workspace}/entities/instances/providers/${file}`}
            className="final-link"
            onClick={() => onLinkClick(file)}>
            Open {file}
          </a>
        ))}
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
