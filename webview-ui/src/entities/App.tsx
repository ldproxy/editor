import { useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";

import { vscode } from "../utilities/vscode";
import GeoPackage, { GpkgData, gpkgDataSelector } from "./GeoPackage";
import Wfs, { WfsData, wfsDataSelector } from "./Wfs";
import PostgreSql, { sqlDataSelector, SqlData } from "./PostgreSql";
import Tables, { TableData, allTablesAtom, currentTableAtom } from "./Tables";
import Final from "./Final";
import { BasicData, Response, Error, xtracfg } from "../utilities/xtracfg";
import { DEV } from "../utilities/constants";
import { namesOfCreatedFilesAtom } from "./Final";
import { featureProviderTypeAtom } from "./Common";
import {
  atomSyncString,
  atomSyncObject,
  atomSyncStringArray,
  atomSyncBoolean,
} from "../utilities/recoilSyncWrapper";

import "./App.css";

type FieldErrors = {
  [key: string]: string;
};

export const dataProcessingAtom = atomSyncString("dataProcessing", "", "StoreB");

export const existingGeopackageAtom = atomSyncStringArray("existingGeopackage", [""], "StoreB");

export const workspaceAtom = atomSyncString("workspace", "", "StoreB");

export const errorAtom = atomSyncObject<FieldErrors>("error", {}, "StoreB");

export const generateProgressAtom = atomSyncString("generateProgress", "", "StoreB");

export const progressAtom = atomSyncObject<TableData>("progress", {}, "StoreB");

export const typesAtom = atomSyncBoolean("types", false, "StoreB");

function App() {
  const [types, setTypes] = useRecoilState(typesAtom);
  const sqlData = useRecoilValue<SqlData>(sqlDataSelector);
  const wfsData = useRecoilValue<WfsData>(wfsDataSelector);
  const gpkgData = useRecoilValue<GpkgData>(gpkgDataSelector);
  const [existingGeopackages, setExistingGeopackages] =
    useRecoilState<string[]>(existingGeopackageAtom);
  const selectedDataSource = useRecoilValue(featureProviderTypeAtom);
  const [dataProcessing, setDataProcessing] = useRecoilState<string>(dataProcessingAtom);
  const [allTables, setAllTables] = useRecoilState<TableData>(allTablesAtom);
  const [namesOfCreatedFiles, setNamesOfCreatedFiles] =
    useRecoilState<string[]>(namesOfCreatedFilesAtom);
  const [workspace, setWorkspace] = useRecoilState(workspaceAtom);
  const [generateProgress, setGenerateProgress] = useRecoilState<string>(generateProgressAtom);

  const [currentTable, setCurrentTable] = useRecoilState<string>(currentTableAtom);
  const [progress, setProgress] = useRecoilState<TableData>(progressAtom);
  const [error, setError] = useRecoilState<FieldErrors>(errorAtom);

  const basicData: BasicData = {
    command: "auto",
    subcommand: "analyze",
    source: workspace,
    verbose: true,
    debug: DEV,
  };

  useEffect(() => {
    vscode.listen(handleVscode);

    //xtracfg.listen(handleSuccess, handleError);

    vscode.postMessage({
      command: "onLoad",
      text: "onLoad",
    });

    vscode.postMessage({
      command: "setExistingGpkg",
      text: "setExistingGpkg",
    });
  }, []);

  const handleVscode = (message: any) => {
    switch (message.command) {
      case "setWorkspace":
        const workspaceRoot = message.workspaceRoot;
        if (DEV) {
          console.log("workspace root:", workspaceRoot);
        }
        setWorkspace(workspaceRoot);
        break;
      case "setGeopackages":
        setExistingGeopackages(message.existingGeopackages);
        if (DEV) {
          console.log("existing GeoPackages:", message.existingGeopackages);
        }
        break;
      case "xtracfg":
        if (message.response) {
          handleSuccess(message.response);

          if (
            message.response.details &&
            message.response.details.types &&
            Object.keys(message.response.details.types).length > 0
          ) {
            setTypes(true);
          } else {
            setTypes(false);
          }
        } else {
          handleError(message.error);
        }
        break;
      default:
        console.error("Unexpected message received from vscode", message);
    }
  };

  const handleSuccess = (response: Response) => {
    const isSuccess =
      response.results && response.results.length > 0 && response.results[0].status === "SUCCESS";
    const isProgress =
      response.results && response.results.length > 0 && response.results[0].status === "INFO";
    const details = response.details || {};

    if (isSuccess) {
      if (details.types) {
        setAllTables(details.types);
      }
      if (details.new_files) {
        setNamesOfCreatedFiles(details.new_files);
      }

      // need to use updater since dataProcessing is bound on first render
      setDataProcessing((prev) => {
        if (prev === "" || prev === "inProgress") {
          if (DEV) {
            console.log("setDataProcessing, Case1", prev);
          }
          return "analyzed";
        }
        if (prev === "inProgressGenerating") {
          if (DEV) {
            console.log("setDataProcessing, Case2", prev);
          }
          return "generated";
        }
        if (DEV) {
          console.log("setDataProcessing, Case3", prev);
        }
        return prev;
      });

      setGenerateProgress("Analyzing tables");
    } else if (isProgress && details.currentTable) {
      setCurrentTable(details.currentTable);
      setProgress(details.progress ? details.progress : {});
      setGenerateProgress(
        `Analyzing table '${details.currentTable}' (${details.currentCount || 0}/${
          details.targetCount || 0
        })`
      );
    }
  };

  const handleError = (error: Error) => {
    setDataProcessing("");
    setGenerateProgress("Analyzing tables");

    if (error.notification) {
      vscode.postMessage({
        command: "error",
        text: `Error: ${error.notification}`,
      });
    }
    if (error.fields) {
      setError((prevError) => {
        return { ...prevError, ...error.fields };
      });
    }
  };

  const analyze = (connectionInfo: Object) => {
    setError({});
    if (DEV) {
      console.log("setDataProcessing, CaseAnalyze");
    }
    setDataProcessing("inProgress");

    xtracfg.send({
      ...basicData,
      ...connectionInfo,
      subcommand: "analyze",
    });
  };

  const generate = (selectedTables: TableData) => {
    if (selectedDataSource === "PGIS") {
      xtracfg.send({
        ...basicData,
        ...sqlData,
        types: selectedTables,
        subcommand: "generate",
      });
    } else if (selectedDataSource === "GPKG") {
      xtracfg.send({
        ...basicData,
        ...gpkgData,
        types: selectedTables,
        subcommand: "generate",
      });
    } else if (selectedDataSource === "WFS") {
      xtracfg.send({
        ...basicData,
        ...wfsData,
        types: selectedTables,
        subcommand: "generate",
      });
    }

    setError({});
    if (DEV) {
      console.log("setDataProcessing, CaseGenerate");
    }
    setDataProcessing("inProgressGenerating");
  };
  return (
    <>
      {dataProcessing === "" || dataProcessing === "inProgress" ? (
        <main>
          {selectedDataSource === "PGIS" ? (
            <PostgreSql
              submitData={analyze}
              inProgress={dataProcessing === "inProgress"}
              error={error}
            />
          ) : selectedDataSource === "GPKG" ? (
            <GeoPackage
              submitData={analyze}
              inProgress={dataProcessing === "inProgress"}
              existingGeopackages={existingGeopackages}
              error={error}
            />
          ) : (
            <Wfs submitData={analyze} inProgress={dataProcessing === "inProgress"} error={error} />
          )}
        </main>
      ) : dataProcessing === "analyzed" && types ? (
        <Tables generateProgress={generateProgress} generate={generate} />
      ) : dataProcessing === "analyzed" && !types ? (
        <div>
          <h3 className="final-title">No types found</h3>

          <div className="submitAndReset">
            <VSCodeButton className="submitButton" onClick={() => setDataProcessing("")}>
              Back
            </VSCodeButton>

            <VSCodeButton
              className="final-dismiss"
              onClick={() => {
                vscode.postMessage({ command: "closeWebview" });

                setDataProcessing("");
              }}>
              Close
            </VSCodeButton>
          </div>
        </div>
      ) : dataProcessing === "inProgressGenerating" || dataProcessing === "generated" ? (
        <Final
          workspace={workspace}
          namesOfCreatedFiles={namesOfCreatedFiles}
          currentTable={currentTable}
          progress={progress}
          fallbackSchema={gpkgData.database}
        />
      ) : (
        "An Error Occurred"
      )}
    </>
  );
}

export default App;
