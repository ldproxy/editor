import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { vscode } from "../utilities/vscode";
import { namesOfCreatedFilesAtom } from "../entities/Final";
import { workspaceAtom } from "../entities/App";
import { useRecoilValue } from "recoil";

type FinalProps = {
  workspace: string;
  nameOfCreatedFile: string;
  apiId: string;
  type: string;
};

const Final = ({ workspace, nameOfCreatedFile, apiId, type }: FinalProps) => {
  const namesOfCreatedFilesOtherThanStyle = useRecoilValue(namesOfCreatedFilesAtom);
  const entitiesWorkspace = useRecoilValue(workspaceAtom);

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

  const onLinkClickEntityFile = (file: string) => {
    vscode.postMessage({
      command: "success",
      text: `${entitiesWorkspace}/${file}`,
    });
    vscode.getState();
  };

  return (
    <div className="final-container">
      <h3 className="final-title">The following files were created</h3>
      <ul>
        {namesOfCreatedFilesOtherThanStyle.map((file: string, index: number) => (
          <li key={index}>
            <a
              className="final-link"
              style={{ cursor: "pointer" }}
              onClick={() => onLinkClickEntityFile(file)}>
              {file}
            </a>
          </li>
        ))}
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
