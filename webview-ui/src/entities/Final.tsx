import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { useRecoilValue, useRecoilState } from "recoil";

import { vscode } from "../utilities/vscode";
import Progress from "./Progress";
import { selectedTablesAtom, TableData } from "./from_data_source/Tables";
import { dataProcessingAtom } from "./App";
import { atomSyncStringArray } from "../utilities/recoilSyncWrapper";
import { typeObjectAtom } from "../components/TypeCheckboxes";
import { VSCodeProgressRing } from "@vscode/webview-ui-toolkit/react";
import { useEffect } from "react";

export const namesOfCreatedFilesAtom = atomSyncStringArray("namesOfCreatedFiles", [""], "StoreB");

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
  const typeObject = useRecoilValue(typeObjectAtom);
  const [_, setNamesOfCreatedFilesAtom] = useRecoilState(namesOfCreatedFilesAtom);

  const createNoStyle = typeObject && typeObject.style === false;

  useEffect(() => {
    if (!createNoStyle && namesOfCreatedFiles.length > 0) {
      setNamesOfCreatedFilesAtom(namesOfCreatedFiles);
    }
    console.log("namesOfCreatedFiles", namesOfCreatedFiles);
  }, [createNoStyle, namesOfCreatedFiles]);

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

  const hasProgress = progress && Object.keys(progress).length > 0;
  return (
    <div className="final-container">
      {hasProgress && (
        <>
          <h3 className="final-title">Progress</h3>
          <Progress
            currentTable={currentTable}
            progress={progress}
            selectedTable={selectedTables}
            dataProcessed={dataProcessing}
            fallbackSchema={fallbackSchema}
          />
        </>
      )}
      {createNoStyle ? (
        dataProcessing === "generated" ? (
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
            {typeObject && typeObject.style === false && (
              <div className="final-buttons">
                <VSCodeButton className="final-create-another" onClick={onCreateAnother}>
                  Create Another
                </VSCodeButton>
                <VSCodeButton className="final-dismiss" onClick={onClose}>
                  Close
                </VSCodeButton>
              </div>
            )}
          </div>
        ) : (
          <VSCodeButton className="resetButton" onClick={onCancelGenerating}>
            Cancel
          </VSCodeButton>
        )
      ) : (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100px",
          }}>
          <VSCodeProgressRing />{" "}
        </div>
      )}
    </div>
  );
};

export default Final;
