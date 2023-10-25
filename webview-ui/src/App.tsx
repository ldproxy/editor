import { useEffect, useState } from "react";
import {
  VSCodeButton,
  VSCodeTextField,
  VSCodeRadioGroup,
  VSCodeRadio,
} from "@vscode/webview-ui-toolkit/react";
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

  const basicData: BasicData = {
    command: "auto",
    subcommand: "analyze",
    source: workspace,
    verbose: true,
  };

  useEffect(() => {
    vscode.getState();
  }, []);

  // Hilfsfunktion bis feststeht in welchem Format die selektierten Tabellen weitersgeschickt werden sollen.
  function objectToString(selectedTable: SchemaTables) {
    const strArr = [];

    for (const key in selectedTable) {
      if (selectedTable.hasOwnProperty(key)) {
        strArr.push(`${key}:${selectedTable[key].join("/")}`);
      }
    }

    return strArr.join(",");
  }

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
    if (data.subcommand === "analyze") {
      setDataProcessing("inProgress");
      vscode.setState(dataProcessing);
    } else if (data.subcommand === "generate") {
      setDataProcessing("inProgressGenerating");
      vscode.setState(dataProcessing);
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
        } else if (response.error) {
          setDataProcessing("");
          vscode.setState(dataProcessing);
          setGenerateProgress("Analyzing tables");
          vscode.postMessage({
            command: "error",
            text: `Error: ${response.error}`,
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
      vscode.setState(dataProcessing);
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
      vscode.setState(dataProcessing);
      setGenerateProgress("Analyzing tables");
    } else if (currentResponse.details && currentResponse.details.currentTable) {
      setGenerateProgress(
        `Analyzing table '${currentResponse.details.currentTable}' (${currentResponse.details.currentCount}/${currentResponse.details.targetCount})`
      );
    }
  }, [dataProcessing, currentResponse]);

  return (
    <>
      {dataProcessing === "" || dataProcessing === "inProgress" ? (
        <main>
          <h3>Create new service</h3>
          <section className="component-example">
            <VSCodeTextField
              value={sqlData.id || wfsData.id || gpkgData.id || ""}
              onChange={(e) => {
                const target = e.target as HTMLInputElement;
                if (target) {
                  handleUpdateData("id", target.value);
                }
              }}>
              Id
            </VSCodeTextField>
          </section>
          <section className="component-example">
            <VSCodeRadioGroup name="DataType" value={selectedDataSource} orientation="vertical">
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
      ) : dataProcessing === "analyzed" || dataProcessing === "inProgressGenerating" ? (
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
      ) : dataProcessing === "generated" ? (
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
        />
      ) : (
        "An Error Occurred"
      )}
    </>
  );
}

export default App;
