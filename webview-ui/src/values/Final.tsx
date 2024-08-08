import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";

import { vscode } from "../utilities/vscode";

type FinalProps = {
  workspace: string;
  nameOfCreatedFile: string;
  apiId: string;
  type: string;
};

const Final = ({ workspace, nameOfCreatedFile, apiId, type }: FinalProps) => {
  const onClose = () => {
    vscode.postMessage({ command: "closeWebview" });
  };

  const onCreateAnother = () => {
    vscode.setState({});
    vscode.postMessage({
      command: "reloadWebview",
    });
  };

  const onLinkClick = (file: string) => {
    vscode.postMessage({
      command: "success",
      text: `${workspace}/values/${type}/${apiId}/${file}.json`,
    });
    vscode.getState();
  };

  return (
    <div className="final-container">
      <h3 className="final-title">The following files were created</h3>
      <ul>
        <li>
          <a
            className="final-link"
            style={{ cursor: "pointer" }}
            onClick={() => onLinkClick(nameOfCreatedFile)}>
            {`values/${type}/${apiId}/${nameOfCreatedFile}.json`}
          </a>
        </li>
      </ul>
      <div className="final-buttons">
        <VSCodeButton
          className="final-create-another"
          style={{ marginRight: "10px" }}
          onClick={onCreateAnother}>
          Create Another
        </VSCodeButton>
        <VSCodeButton className="final-dismiss" onClick={onClose}>
          Close
        </VSCodeButton>
      </div>
    </div>
  );
};

export default Final;
