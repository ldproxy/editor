import { useEffect, Suspense } from "react";
import { vscode } from "./utilities/vscode";
import "./App.css";
import GeoPackage, { GpkgData, gpkgDataSelector } from "./GeoPackage";
import Wfs, { WfsData, wfsDataSelector } from "./Wfs";
import PostgreSql, { sqlDataSelector, SqlData } from "./PostgreSql";
import Tables, { TableData, allTablesAtom, currentTableAtom } from "./Tables";
import Final from "./Final";
import { BasicData, SchemaTables } from "./utilities/xtracfg";
import { atom, useRecoilState, useRecoilValue } from "recoil";
import { currentCountAtom, targetCountAtom, namesOfCreatedFilesAtom } from "./Final";
import { featureProviderTypeAtom } from "./Common";
import { RecoilSync } from "recoil-sync";

export const dataProcessingAtom = atom({
  key: "dataProcessing",
  default: "",
});

export const existingGeopackageAtom = atom({
  key: "existingGeopackage",
  default: [""],
});

export const workspaceAtom = atom({
  key: "workspace",
  default: "c:/Users/p.zahnen/Documents/GitHub/editor/data",
});

export const errorAtom = atom({
  key: "error",
  default: {},
});

export const currentResponseAtom = atom<ResponseType>({
  key: "currentResponse",
  default: {
    error: "",
    details: {
      types: {},
      new_files: [],
      currentTable: "",
      currentCount: 0,
      targetCount: 0,
      progress: {},
    },
    results: [],
  },
});

export const generateProgressAtom = atom({
  key: "generateProgress",
  default: "",
});

export const progressAtom = atom({
  key: "progress",
  default: {},
});

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
  const [currentResponse, setCurrentResponse] = useRecoilState(currentResponseAtom);
  const [generateProgress, setGenerateProgress] = useRecoilState<string>(generateProgressAtom);

  const [currentTable, setCurrentTable] = useRecoilState<string>(currentTableAtom);
  const [progress, setProgress] = useRecoilState<{ [key: string]: string[] }>(progressAtom);
  const [currentCount, setCurrentCount] = useRecoilState<number>(currentCountAtom);
  const [targetCount, setTargetCount] = useRecoilState<number>(targetCountAtom);
  const [error, setError] = useRecoilState<{ [key: string]: string }>(errorAtom);

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
    } else if (selectedDataSource === "GPKG") {
      submitData({
        ...basicData,
        ...gpkgData,
        types: selectedTables,
        subcommand: "generate",
      });
    } else if (selectedDataSource === "WFS") {
      submitData({
        ...basicData,
        ...wfsData,
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
        } else if (
          response.error ||
          (response.results && response.results[0].status && response.results[0].status === "ERROR")
        ) {
          setDataProcessing("");
          setGenerateProgress("Analyzing tables");
          if (
            (response &&
              response.results &&
              response.results[0] &&
              response.results[0].message &&
              !response.results[0].message.includes("host") &&
              !response.results[0].message.includes("url") &&
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
          response.results[0].status &&
          response.results[0].status === "ERROR" &&
          response.results[0].message.includes("host") &&
          !response.results[0].message.includes("refused")
        ) {
          setError((prevError) => {
            return { ...prevError, host: response.results[0].message.split(",")[0] };
          });
        } else if (
          response.results &&
          response.results[0].status &&
          response.results[0].status === "ERROR" &&
          response.results[0].message.includes("database")
        ) {
          setError((prevError) => {
            return { ...prevError, database: response.results[0].message };
          });
        } else if (
          response.results &&
          response.results[0].status &&
          response.results[0].status === "ERROR" &&
          response.results[0].message.includes("user name")
        ) {
          setError((prevError) => {
            return { ...prevError, user: response.results[0].message };
          });
        } else if (
          response.results &&
          response.results[0].status &&
          response.results[0].status === "ERROR" &&
          response.results[0].message.includes("password")
        ) {
          setError((prevError) => {
            return {
              ...prevError,
              password: response.results[0].message,
              user: response.results[0].message,
            };
          });
        } else if (response.error && response.error === "No id given") {
          setError((prevError) => {
            return { ...prevError, id: response.error };
          });
        } else if (
          response.results &&
          response.results[0].status &&
          response.results[0].status === "ERROR" &&
          response.results[0].message.includes("url")
        ) {
          setError((prevError) => {
            return { ...prevError, url: response.results[0].message };
          });
        }
        /*
        if (wfsData.user && wfsData.password) {
          setWfsData((prevWfsData) => {
            const newWfsData = { ...prevWfsData };
            delete newWfsData.user;
            delete newWfsData.password;
            return newWfsData;
          });
        }
        */
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
      currentResponse.results.length >= 1 &&
      currentResponse.results[0].status &&
      currentResponse.results[0]?.status === "SUCCESS"
    ) {
      if (currentResponse.details && currentResponse.details.types) {
        setAllTables(currentResponse.details.types);
      }
      setCurrentResponse({});
      setDataProcessing("analyzed");
    } else if (
      dataProcessing === "inProgressGenerating" &&
      currentResponse.results &&
      currentResponse.results[0].status &&
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

  return (
    <RecoilSync storeKey="storeA" read={async () => ["item one", "item two"]}>
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
              selectedDataSource={selectedDataSource}
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
    </RecoilSync>
  );
}

export default App;
