import { useEffect, useState } from "react";
import { VSCodeTextField, VSCodeRadioGroup, VSCodeRadio } from "@vscode/webview-ui-toolkit/react";
import { vscode } from "./utilities/vscode";
import "./App.css";
import GeoPackage, { GpkgData } from "./GeoPackage";
import Wfs, { WfsData } from "./Wfs";
import PostgreSql, { SqlData } from "./PostgreSql";
import Tables, { TableData } from "./Tables";
import Final from "./Final";
import { BasicData, SchemaTables } from "./utilities/xtracfg";

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
  const [sqlData, setSqlData] = useState<SqlData>({});
  const [wfsData, setWfsData] = useState<WfsData>({});
  const [gpkgData, setGpkgData] = useState<GpkgData>({});
  const [existingGeopackages, setExistingGeopackages] = useState<string[]>([""]);
  const [selectedDataSource, setSelectedDataSource] = useState("PGIS");
  const [dataProcessing, setDataProcessing] = useState<string>("");
  const [allTables, setAllTables] = useState<TableData>({});
  const [namesOfCreatedFiles, setNamesOfCreatedFiles] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<SchemaTables>({});
  const [workspace, setWorkspace] = useState("c:/Users/p.zahnen/Documents/GitHub/editor/data");
  const [currentResponse, setCurrentResponse] = useState<ResponseType>({});
  const [generateProgress, setGenerateProgress] = useState<string>("Analyzing tables");
  const [currentTable, setCurrentTable] = useState<string>("");
  const [progress, setProgress] = useState<{ [key: string]: string[] }>({});
  const [currentCount, setCurrentCount] = useState<number>(0);
  const [targetCount, setTargetCount] = useState<number>(0);
  const [error, setError] = useState<{ [key: string]: string }>({});

  const basicData: BasicData = {
    command: "auto",
    subcommand: "analyze",
    source: workspace,
    verbose: true,
  };

  useEffect(() => {
    setGpkgData({});
    setWfsData({});
    setSqlData({});
  }, [selectedDataSource]);

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

  const handleUpdateData = (key: string, value: string) => {
    if (selectedDataSource === "PGIS") {
      setWfsData({});
      setGpkgData({});
      if (!Object.keys(sqlData).includes("subcommand")) {
        setSqlData(basicData);
      }
      setSqlData((prevSqlData) => ({
        ...prevSqlData,
        [key]: value,
        featureProviderType: selectedDataSource,
      }));
    }
    if (selectedDataSource === "WFS") {
      setSqlData({});
      setGpkgData({});
      if (!Object.keys(wfsData).includes("subcommand")) {
        setWfsData(basicData);
      }
      setWfsData((prevWfsData) => ({
        ...prevWfsData,
        [key]: value,
        featureProviderType: selectedDataSource,
      }));
    }
    if (selectedDataSource === "GPKG") {
      setSqlData({});
      setWfsData({});
      if (!Object.keys(gpkgData).includes("subcommand")) {
        setGpkgData(basicData);
      }
      setGpkgData((prevGpkgData) => ({
        ...prevGpkgData,
        [key]: value,
        featureProviderType: selectedDataSource,
      }));
    }
  };

  const handleGenerate = () => {
    if (selectedDataSource === "PGIS") {
      setSqlData((prevSqlData) => ({
        ...prevSqlData,
        subcommand: "generate",
      }));
      if (Object.keys(selectedTable).length !== 0) {
        setSqlData((prevSqlData) => ({
          ...prevSqlData,
          types: selectedTable,
        }));
      }
    } else if (selectedDataSource === "GPKG") {
      setGpkgData((prevGpkgData) => ({
        ...prevGpkgData,
        subcommand: "generate",
      }));
      if (Object.keys(selectedTable).length !== 0) {
        setGpkgData((prevGpkgData) => ({
          ...prevGpkgData,
          selectedTables: selectedTable,
        }));
      }
    } else if (selectedDataSource === "WFS") {
      setWfsData((prevWfsData) => ({
        ...prevWfsData,
        subcommand: "generate",
      }));
      if (Object.keys(selectedTable).length !== 0) {
        setWfsData((prevWfsData) => ({
          ...prevWfsData,
          selectedTables: selectedTable,
        }));
      }
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
          vscode.postMessage({
            command: "error",
            text: `Error: ${response.error || response.results[0].message}`,
          });
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
          (response.results &&
            response.results[0].status === "ERROR" &&
            response.results[0].message === "database") ||
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

  console.log("dataProccessing:", dataProcessing);

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

  return (
    <>
      {dataProcessing === "" || dataProcessing === "inProgress" ? (
        <main>
          <h3>Create new service</h3>
          <section className="component-example">
            <VSCodeTextField
              value={sqlData.id || wfsData.id || gpkgData.id || ""}
              disabled={dataProcessing === "inProgress"}
              onChange={(e) => {
                const target = e.target as HTMLInputElement;
                if (target) {
                  handleUpdateData("id", target.value);
                }
              }}>
              Id
            </VSCodeTextField>
          </section>
          {error.id && <span className="error-message">{error.id}</span>}
          <section className="component-example">
            <VSCodeRadioGroup
              name="DataType"
              value={selectedDataSource}
              orientation="vertical"
              disabled={dataProcessing === "inProgress"}>
              <label slot="label">Data Source Type</label>
              <VSCodeRadio
                id="PostgreSQL"
                value="PGIS"
                onChange={() => setSelectedDataSource("PGIS")}>
                PostgreSQL
              </VSCodeRadio>
              <VSCodeRadio
                id="GeoPackage"
                value=" GPKG"
                onChange={() => setSelectedDataSource("GPKG")}>
                GeoPackage
              </VSCodeRadio>
              <VSCodeRadio id="WFS" value="WFS" onChange={() => setSelectedDataSource("WFS")}>
                WFS
              </VSCodeRadio>
            </VSCodeRadioGroup>
          </section>
          {selectedDataSource === "PGIS" ? (
            <PostgreSql
              submitData={submitData}
              handleUpdateData={handleUpdateData}
              dataProcessing={dataProcessing}
              sqlData={sqlData}
              error={error}
            />
          ) : selectedDataSource === "GPKG" ? (
            <GeoPackage
              selectedDataSource={selectedDataSource}
              submitData={submitData}
              dataProcessing={dataProcessing}
              existingGeopackages={existingGeopackages}
              handleUpdateData={handleUpdateData}
              gpkgData={gpkgData}
              setGpkgData={setGpkgData}
            />
          ) : (
            <Wfs
              submitData={submitData}
              handleUpdateData={handleUpdateData}
              wfsData={wfsData}
              setWfsData={setWfsData}
              dataProcessing={dataProcessing}
            />
          )}
        </main>
      ) : dataProcessing === "analyzed" ? (
        <Tables
          allTables={allTables}
          selectedDataSource={selectedDataSource}
          setDataProcessing={setDataProcessing}
          handleGenerate={handleGenerate}
          selectedTable={selectedTable}
          setSelectedTable={setSelectedTable}
          dataProcessing={dataProcessing}
          submitData={submitData}
          sqlData={sqlData}
          wfsData={wfsData}
          gpkgData={gpkgData}
          setSqlData={setSqlData}
          setWfsData={setWfsData}
          setGpkgData={setGpkgData}
          handleUpdateData={handleUpdateData}
          generateProgress={generateProgress}
        />
      ) : dataProcessing === "inProgressGenerating" || dataProcessing === "generated" ? (
        <Final
          workspace={workspace}
          sqlData={sqlData}
          wfsData={wfsData}
          gpkgData={gpkgData}
          selectedDataSource={selectedDataSource}
          setDataProcessing={setDataProcessing}
          setGpkgData={setGpkgData}
          setSqlData={setSqlData}
          setWfsData={setWfsData}
          setSelectedTable={setSelectedTable}
          namesOfCreatedFiles={namesOfCreatedFiles}
          currentTable={currentTable}
          progress={progress}
          selectedTable={selectedTable}
          dataProcessing={dataProcessing}
          currentCount={currentCount}
          targetCount={targetCount}
        />
      ) : (
        "An Error Occurred"
      )}
    </>
  );
}

export default App;
