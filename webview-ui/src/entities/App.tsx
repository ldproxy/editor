import { useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";

import { vscode } from "../utilities/vscode";
import GeoPackage, { GpkgData, gpkgDataSelector } from "./from_data_source/GeoPackage";
import { fromExistingSelector } from "./FromExistingEntity";
import Wfs, { WfsData, wfsDataSelector } from "./from_data_source/Wfs";
import PostgreSql, { sqlDataSelector, SqlData } from "./from_data_source/PostgreSql";
import Tables, { TableData, allTablesAtom, currentTableAtom } from "./from_data_source/Tables";
import Final from "./Final";
import { xtracfg } from "../utilities/xtracfg";
import type { BasicData, Response, Error } from "../utilities/xtracfg";
import { DEV } from "../utilities/constants";
import { namesOfCreatedFilesAtom } from "./Final";
import { featureProviderTypeAtom, createCfgOptionAtom } from "../components/Common";
import Common from "../components/Common";
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

export const existingConfigurationsAtom = atomSyncStringArray(
  "existingConfigurations",
  [""],
  "StoreB"
);

export const existingStylesAtom = atomSyncObject("existingStyles", {}, "StoreB");

export const workspaceAtom = atomSyncString("workspace", "", "StoreB");

export const errorAtom = atomSyncObject<FieldErrors>("error", {}, "StoreB");

export const generateProgressAtom = atomSyncString("generateProgress", "", "StoreB");

export const progressAtom = atomSyncObject<TableData>("progress", {}, "StoreB");

export const typesAtom = atomSyncBoolean("types", false, "StoreB");

function App() {
  const [types, setTypes] = useRecoilState(typesAtom);
  const fromExistingData = useRecoilValue(fromExistingSelector);
  const sqlData = useRecoilValue<SqlData>(sqlDataSelector);
  const wfsData = useRecoilValue<WfsData>(wfsDataSelector);
  const gpkgData = useRecoilValue<GpkgData>(gpkgDataSelector);
  const [existingGeopackages, setExistingGeopackages] =
    useRecoilState<string[]>(existingGeopackageAtom);
  const [existingConfigurations, setExistingConfigurations] = useRecoilState<string[]>(
    existingConfigurationsAtom
  );
  const [existingStyles, setExistingStyles] = useRecoilState<{}>(existingStylesAtom);
  const selectedDataSource = useRecoilValue(featureProviderTypeAtom);
  const selectedCreateCfgOption = useRecoilValue(createCfgOptionAtom);
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

    vscode.postMessage({
      command: "setExistingCfgs",
      text: "setExistingCfgs",
    });

    vscode.postMessage({
      command: "setExistingStyles",
      text: "setExistingStyles",
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
      case "setConfigurations":
        setExistingConfigurations(message.existingCfgs);
        if (DEV) {
          console.log("existing Configurations:", message.existingCfgs);
        }
        break;
      case "setStyles":
        setExistingStyles(message.existingStyles);
        if (DEV) {
          console.log("existing Styles:", message.existingStyles);
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
    console.log("types", connectionInfo);

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

  const fromExistingSubmit = (submitData: any) => {
    console.log("submitDataExisting", submitData);
    xtracfg.send({
      ...basicData,
      ...fromExistingData,
      // types: selectedTables,
      subcommand: "generate",
    });
    setDataProcessing("generated");
    setNamesOfCreatedFiles(
      [
        submitData.id,
        submitData.selectedConfig,
        submitData.typeObject.provider ? "provider" : undefined,
        submitData.typeObject.service ? "service" : undefined,
        submitData.typeObject.tileProvider ? "tileProvider" : undefined,
        submitData.typeObject.style ? "style" : undefined,
      ].filter(Boolean)
    );
  };

  const copySubmit = (submitData: any) => {
    setDataProcessing("generated");
    setNamesOfCreatedFiles([
      submitData.id,
      submitData.selectedConfigSelector,
      ...submitData.selectedSubConfigsSelector,
    ]);
  };

  const fromScratchSubmit = (submitData: any) => {
    console.log("submitDataScratch", submitData);
    setDataProcessing("generated");
    setNamesOfCreatedFiles(
      [
        submitData.id,
        submitData.typeObject.provider ? "provider" : undefined,
        submitData.typeObject.service ? "service" : undefined,
        submitData.typeObject.tileProvider ? "tileProvider" : undefined,
        submitData.typeObject.style ? "style" : undefined,
      ].filter(Boolean)
    );
  };

  return (
    <>
      {dataProcessing === "" || dataProcessing === "inProgress" ? (
        <main>
          <div className="frame">
            <Common
              error={error}
              fromExistingSubmit={fromExistingSubmit}
              copySubmit={copySubmit}
              fromScratchSubmit={fromScratchSubmit}
            />
            {selectedDataSource === "PGIS" &&
            selectedCreateCfgOption === "generateFromDataSource" ? (
              <PostgreSql
                submitData={analyze}
                inProgress={dataProcessing === "inProgress"}
                error={error}
              />
            ) : selectedDataSource === "GPKG" &&
              selectedCreateCfgOption === "generateFromDataSource" ? (
              <GeoPackage
                submitData={analyze}
                inProgress={dataProcessing === "inProgress"}
                existingGeopackages={existingGeopackages}
                error={error}
              />
            ) : selectedCreateCfgOption === "generateFromDataSource" ? (
              <Wfs
                submitData={analyze}
                inProgress={dataProcessing === "inProgress"}
                error={error}
              />
            ) : null}
          </div>
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
