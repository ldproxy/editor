import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { useRecoilValue } from "recoil";

import { vscode } from "./utilities/vscode";
import Progress from "./Progress";
import { selectedTablesAtom, TableData } from "./Tables";
import { dataProcessingAtom } from "./App";
import { atomSyncStringArray } from "./utilities/recoilSyncWrapper";

export const namesOfCreatedFilesAtom = atomSyncStringArray("namesOfCreatedFiles", [""]);

type FinalProps = {
  workspace: string;
  namesOfCreatedFiles: Array<string>;
  currentTable: string;
  progress: { [key: string]: string[] };
  fallbackSchema?: string;
};

const Final = ({
  workspace,
  namesOfCreatedFiles,
  currentTable,
  progress,
  fallbackSchema,
}: FinalProps) => {
  const selectedTables = useRecoilValue<TableData>(selectedTablesAtom);
  const dataProcessing = useRecoilValue<string>(dataProcessingAtom);

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
      text: `${workspace}/${file}`,
    });
    vscode.getState();
  };

  const onCancelGenerating = () => {
    vscode.postMessage({
      command: "cancelGenerating",
    });
  };

  return (
    <div className="final-container">
      <h3 className="final-title">Progress</h3>
      <Progress
        currentTable={currentTable}
        progress={progress}
        selectedTable={selectedTables}
        dataProcessed={dataProcessing}
        fallbackSchema={fallbackSchema}
      />
      {dataProcessing === "generated" ? (
        <div className="final-content">
          <h3 className="final-title">The following files were created</h3>
          <ul>
            {namesOfCreatedFiles.map((file, index) => {
              return (
                <li key={index}>
                  <a key={index} className="final-link" onClick={() => onLinkClick(file)}>
                    {file}
                  </a>
                </li>
              );
            })}
          </ul>
          <div className="final-buttons">
            <VSCodeButton className="final-create-another" onClick={onCreateAnother}>
              Create Another
            </VSCodeButton>
            <VSCodeButton className="final-dismiss" onClick={onClose}>
              Close
            </VSCodeButton>
          </div>
        </div>
      ) : (
        <VSCodeButton className="resetButton" onClick={onCancelGenerating}>
          Cancel
        </VSCodeButton>
      )}
    </div>
  );
};

export default Final;
