import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import "./App.css";
import { vscode } from "./utilities/vscode";
import Progress from "./Progress";
import { SchemaTables } from "./utilities/xtracfg";
import { selectedTablesAtom, TableData } from "./Tables";
import { atom, useRecoilState, useRecoilValue, selector } from "recoil";

export const currentCountAtom = atom({
  key: "currentCount",
  default: 0,
});

export const targetCountAtom = atom({
  key: "targetCount",
  default: 0,
});

type FinalProps = {
  workspace: string;
  wfsData: Object;
  gpkgData: Object;
  selectedDataSource: string;
  setDataProcessing: Function;
  setGpkgData: Function;
  setWfsData: Function;
  namesOfCreatedFiles: Array<string>;
  currentTable: string;
  progress: { [key: string]: string[] };
  dataProcessing: string;
};

const Final = (props: FinalProps) => {
  const [selectedTables, setSelectedTables] = useRecoilState<TableData>(selectedTablesAtom);
  const currentCount = useRecoilValue<number>(currentCountAtom);
  const targetCount = useRecoilValue<number>(targetCountAtom);

  const onClose = () => {
    vscode.postMessage({ command: "closeWebview" });
  };

  const onCreateAnother = () => {
    props.setDataProcessing("");
    setSelectedTables({});
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
        selectedTable={selectedTables}
        dataProcessed={props.dataProcessing}
        currentCount={currentCount}
        targetCount={targetCount}
      />
      {props.dataProcessing === "generated" ? (
        <div className="final-content">
          <h2 className="final-title">The following files were created.</h2>
          <ul>
            {props.namesOfCreatedFiles.map((file, index) => {
              return (
                <li key={index}>
                  <a
                    key={index}
                    href={`${props.workspace}/${file}`}
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
