import { useEffect, useState } from "react";
import { vscode } from "./utilities/vscode";
import "./App.css";
import GeoPackage, { GpkgData } from "./GeoPackage";
import Wfs, { WfsData } from "./Wfs";
import PostgreSql, { sqlDataSelector, SqlData } from "./PostgreSql";
import Tables, { TableData, allTablesAtom } from "./Tables";
import Final from "./Final";
import { BasicData, SchemaTables } from "./utilities/xtracfg";
import { RecoilRoot, useRecoilState, useRecoilValue } from "recoil";
import { currentCountAtom, targetCountAtom } from "./Final";
import { featureProviderTypeAtom } from "./Common";

type ResponseType = {
  error?: string;
  details?: {
    types?: SchemaTables;
    new_files?: string[];
    currentTable?: string;
    currentCount?: number;
    targetCount?: number;
    progress?: SchemaTables;
  };
  results?: Array<{ status: string }>;
};

function App() {
  const sqlData = useRecoilValue<SqlData>(sqlDataSelector);
  const [wfsData, setWfsData] = useState<WfsData>({});
  const [gpkgData, setGpkgData] = useState<GpkgData>({});
  const [existingGeopackages, setExistingGeopackages] = useState<string[]>([""]);
  const selectedDataSource = useRecoilValue(featureProviderTypeAtom);
  const [dataProcessing, setDataProcessing] = useState<string>("");
  const [allTables, setAllTables] = useRecoilState<TableData>(allTablesAtom);
  const [namesOfCreatedFiles, setNamesOfCreatedFiles] = useState<string[]>([]);
  const [workspace, setWorkspace] = useState("c:/Users/p.zahnen/Documents/GitHub/editor/data");
  const [currentResponse, setCurrentResponse] = useState<ResponseType>({});
  const [generateProgress, setGenerateProgress] = useState<string>("Analyzing tables");
  const [currentTable, setCurrentTable] = useState<string>("");
  const [progress, setProgress] = useState<{ [key: string]: string[] }>({});
  const [currentCount, setCurrentCount] = useRecoilState<number>(currentCountAtom);
  const [targetCount, setTargetCount] = useRecoilState<number>(targetCountAtom);
  const [error, setError] = useState<{ [key: string]: string }>({});

  const basicData: BasicData = {
    command: "auto",
    subcommand: "analyze",
    source: workspace,
    verbose: true,
  };

  useEffect(() => {
    vscode.postMessage({
      command: "onLoad",
      text: "onLoad",
    }),
      vscode.postMessage({
        command: "setExistingGpkg",
        text: "setExistingGpkg",
      });
  }, []);

  window.addEventListener("message", (event) => {
    const message = event.data;

    switch (message.command) {
      case "setWorkspace":
        const workspaceRoot = message.workspaceRoot;
        console.log("Workspace Root:", workspaceRoot);
        setWorkspace(workspaceRoot);
        break;
      case "setGeopackages":
        setExistingGeopackages(message.existingGeopackages);
        console.log("Existing Geopackages:", message.existingGeopackages);
        break;
      default:
        console.log("Access to the workspace and/or existing Gpkg is not available.");
    }
  });

  const analyze = (connectionInfo: Object) => {
    submitData({
      ...basicData,
      ...connectionInfo,
      subcommand: "analyze",
    });
  };

  const generate = (selectedTables: TableData) => {
    if (selectedDataSource === "PGIS") {
      submitData({
        ...basicData,
        ...sqlData,
        types: selectedTables,
        subcommand: "generate",
      });
    }
  };

  const submitData = (data: BasicData) => {
    setError({});
    if (data.subcommand === "analyze") {
      setDataProcessing("inProgress");
    } else if (data.subcommand === "generate") {
      setDataProcessing("inProgressGenerating");
    }

    try {
      JSON.parse(JSON.stringify(data));
      const socket = new WebSocket("ws://localhost:8080/sock");

      socket.addEventListener("open", () => {
        const jsonData = JSON.stringify(data);
        console.log("WebSocket-Verbindung geöffnet");
        console.log("Data", jsonData);
        socket.send(jsonData);
      });

      socket.addEventListener("message", (event) => {
        const response = JSON.parse(event.data);
        setCurrentResponse(response);
        console.log("Nachricht vom Server erhalten:", response);

        if (response.error && response.error === "No 'command' given: {}") {
          vscode.postMessage({
            command: "error",
            text: `Error: Empty Fields`,
          });
        } else if (response.error || (response.results && response.results[0].status === "ERROR")) {
          setDataProcessing("");
          setGenerateProgress("Analyzing tables");
          if (
            (response &&
              response.results &&
              response.results[0] &&
              response.results[0].message &&
              !response.results[0].message.includes("host") &&
              !response.results[0].message.includes("database") &&
              !response.results[0].message.includes("user") &&
              !response.results[0].message.includes("password")) ||
            (response &&
              response.results &&
              response.results[0] &&
              response.results[0].message &&
              response.results[0].message.includes("refused")) ||
            (response && response.error && !response.error.includes("No id given"))
          ) {
            vscode.postMessage({
              command: "error",
              text: `Error: ${response.error || response.results[0].message}`,
            });
          }
        }

        if (
          response.results &&
          response.results[0].status === "ERROR" &&
          response.results[0].message.includes("host") &&
          !response.results[0].message.includes("refused")
        ) {
          setError((prevError) => {
            return { ...prevError, host: response.results[0].message.split(",")[0] };
          });
        } else if (
          response.results &&
          response.results[0].status === "ERROR" &&
          response.results[0].message.includes("database")
        ) {
          setError((prevError) => {
            return { ...prevError, database: "No 'database' given" };
          });
        } else if (
          response.results &&
          response.results[0].status === "ERROR" &&
          response.results[0].message.includes("user name")
        ) {
          setError((prevError) => {
            return { ...prevError, user: "No 'username' specified" };
          });
        } else if (
          response.results &&
          response.results[0].status === "ERROR" &&
          response.results[0].message.includes("password")
        ) {
          setError((prevError) => {
            return { ...prevError, password: "'Password' authentication failed" };
          });
        } else if (response.error && response.error === "No id given") {
          setError((prevError) => {
            return { ...prevError, id: response.error };
          });
        }

        if (wfsData.user && wfsData.password) {
          setWfsData((prevWfsData) => {
            const newWfsData = { ...prevWfsData };
            delete newWfsData.user;
            delete newWfsData.password;
            return newWfsData;
          });
        }
      });
      /*
      socket.addEventListener("close", (event) => {
        if (event.wasClean) {
          console.log(
            `WebSocket-Verbindung geschlossen, Code: ${event.code}, Grund: ${event.reason}`
          );
        } else {
          console.error("WebSocket-Verbindung unerwartet geschlossen");
        }
      });

      socket.addEventListener("error", (error) => {
        console.error("WebSocket-Fehler:", error);
      }); 
      */
    } catch (error) {
      console.error("Fehler beim JSON-Serialisieren:", error);
    }
  };

  useEffect(() => {
    if (
      dataProcessing === "inProgress" &&
      currentResponse.results &&
      currentResponse.results[0].status === "SUCCESS"
    ) {
      if (currentResponse.details && currentResponse.details.types) {
        setAllTables(currentResponse.details.types);
      }
      setCurrentResponse({});
      setDataProcessing("analyzed");
    } else if (
      dataProcessing === "inProgressGenerating" &&
      currentResponse.results &&
      currentResponse.results[0].status === "SUCCESS"
    ) {
      if (currentResponse.details && currentResponse.details.new_files) {
        const namesOfCreatedFiles = currentResponse.details.new_files;
        setNamesOfCreatedFiles(namesOfCreatedFiles);
      }
      setCurrentResponse({});
      setDataProcessing("generated");
      setGenerateProgress("Analyzing tables");
    } else if (currentResponse.details && currentResponse.details.currentTable) {
      setCurrentTable(currentResponse.details.currentTable);
      currentResponse.details.progress ? setProgress(currentResponse.details.progress) : null;
      currentResponse.details.currentCount
        ? setCurrentCount(currentResponse.details.currentCount)
        : 0;
      currentResponse.details.targetCount ? setTargetCount(currentResponse.details.targetCount) : 0;
      setGenerateProgress(
        `Analyzing table '${currentResponse.details.currentTable}' (${currentResponse.details.currentCount}/${currentResponse.details.targetCount})`
      );
    }
  }, [dataProcessing, currentResponse]);

  console.log("crd", currentResponse.details);
  console.log("myError", error);
  console.log("dataProcessing", dataProcessing);

  return (
    <>
      {dataProcessing === "" || dataProcessing === "inProgress" ? (
        <main>
          {selectedDataSource === "PGIS" ? (
            <PostgreSql
              submitData={analyze}
              inProgress={dataProcessing === "inProgress"}
              sqlData={sqlData}
              error={error}
            />
          ) : selectedDataSource === "GPKG" ? (
            <GeoPackage
              selectedDataSource={selectedDataSource}
              submitData={submitData}
              dataProcessing={dataProcessing}
              existingGeopackages={existingGeopackages}
              gpkgData={gpkgData}
              setGpkgData={setGpkgData}
            />
          ) : (
            <Wfs
              submitData={submitData}
              wfsData={wfsData}
              setWfsData={setWfsData}
              dataProcessing={dataProcessing}
            />
          )}
        </main>
      ) : dataProcessing === "analyzed" ? (
        <Tables
          selectedDataSource={selectedDataSource}
          setDataProcessing={setDataProcessing}
          dataProcessing={dataProcessing}
          submitData={submitData}
          sqlData={sqlData}
          wfsData={wfsData}
          gpkgData={gpkgData}
          setWfsData={setWfsData}
          setGpkgData={setGpkgData}
          generateProgress={generateProgress}
          generate={generate}
        />
      ) : dataProcessing === "inProgressGenerating" || dataProcessing === "generated" ? (
        <Final
          workspace={workspace}
          wfsData={wfsData}
          gpkgData={gpkgData}
          selectedDataSource={selectedDataSource}
          setDataProcessing={setDataProcessing}
          setGpkgData={setGpkgData}
          setWfsData={setWfsData}
          namesOfCreatedFiles={namesOfCreatedFiles}
          currentTable={currentTable}
          progress={progress}
          dataProcessing={dataProcessing}
        />
      ) : (
        "An Error Occurred"
      )}
    </>
  );
}

export default App;
