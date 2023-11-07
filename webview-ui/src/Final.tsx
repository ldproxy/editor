import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import "./App.css";
import { vscode } from "./utilities/vscode";
import Progress from "./Progress";
import { selectedTablesAtom, TableData } from "./Tables";
import { atom, useRecoilState } from "recoil";
import { dataProcessingAtom } from "./App";

export const currentCountAtom = atom({
  key: "currentCount",
  default: 0,
});

export const targetCountAtom = atom({
  key: "targetCount",
  default: 0,
});

export const namesOfCreatedFilesAtom = atom({
  key: "namesOfCreatedFiles",
  default: [""],
});

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
  const [selectedTables, setSelectedTables] = useRecoilState<TableData>(selectedTablesAtom);
  const [dataProcessing, setDataProcessing] = useRecoilState<string>(dataProcessingAtom);

  const onClose = () => {
    vscode.postMessage({ command: "closeWebview" });
  };

  const onCreateAnother = () => {
    setDataProcessing("");
    setSelectedTables({});
  };

  const onLinkClick = (file: string) => {
    vscode.postMessage({
      command: "success",
      text: `${workspace}/${file}`,
    });
    vscode.getState();
  };

  return (
    <div className="final-container">
      <Progress
        currentTable={currentTable}
        progress={progress}
        selectedTable={selectedTables}
        dataProcessed={dataProcessing}
        fallbackSchema={fallbackSchema}
      />
      {dataProcessing === "generated" ? (
        <div className="final-content">
          <h2 className="final-title">The following files were created.</h2>
          <ul>
            {namesOfCreatedFiles.map((file, index) => {
              return (
                <li key={index}>
                  <a
                    key={index}
                    href={`${workspace}/${file}`}
                    className="final-link"
                    onClick={() => onLinkClick(file)}>
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
