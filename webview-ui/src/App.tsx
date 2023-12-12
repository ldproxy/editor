import { useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

import { vscode } from "./utilities/vscode";
import GeoPackage, { GpkgData, gpkgDataSelector } from "./GeoPackage";
import Wfs, { WfsData, wfsDataSelector } from "./Wfs";
import PostgreSql, { sqlDataSelector, SqlData } from "./PostgreSql";
import Tables, { TableData, allTablesAtom, currentTableAtom } from "./Tables";
import Final from "./Final";
import { BasicData, Response, Error, xtracfg } from "./utilities/xtracfg";
import { DEV } from "./utilities/constants";
import { namesOfCreatedFilesAtom } from "./Final";
import { featureProviderTypeAtom } from "./Common";
import { atomSyncString, atomSyncObject, atomSyncStringArray } from "./utilities/recoilSyncWrapper";

import "./App.css";

type FieldErrors = {
  [key: string]: string;
};

export const dataProcessingAtom = atomSyncString("dataProcessing", "");

export const existingGeopackageAtom = atomSyncStringArray("existingGeopackage", [""]);

export const workspaceAtom = atomSyncString("workspace", "");

export const errorAtom = atomSyncObject<FieldErrors>("error", {});

export const generateProgressAtom = atomSyncString("generateProgress", "");

export const progressAtom = atomSyncObject<TableData>("progress", {});

function App() {
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
    debug: true,
  };

  useEffect(() => {
    vscode.listen(handleVscode);

    xtracfg.listen(handleSuccess, handleError);

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

    console.log("HANDLE SUCCESS", isSuccess, isProgress, dataProcessing, details);

    if (isSuccess) {
      if (details.types) {
        setAllTables(details.types);
      }
      if (details.new_files) {
        setNamesOfCreatedFiles(details.new_files);
      }

      // need to use updater since dataProcessing is bound on first render
      setDataProcessing((prev) => {
        console.log("DP", prev);

        if (prev === "" || prev === "inProgress") {
          return "analyzed";
        }
        if (prev === "inProgressGenerating") {
          return "generated";
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
    setTimeout(() => {
      setDataProcessing("inProgressGenerating");
    }, 100);
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
      ) : dataProcessing === "analyzed" ? (
        <Tables generateProgress={generateProgress} generate={generate} />
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
