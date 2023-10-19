import {
  VSCodeButton,
  VSCodeTextField,
  VSCodeRadioGroup,
  VSCodeRadio,
} from "@vscode/webview-ui-toolkit/react";
import { vscode } from "./utilities/vscode";
import "./App.css";
import { useEffect, useState } from "react";
import GeoPackage from "./GeoPackage";
import Wfs from "./Wfs";
import PostgreSql from "./PostgreSql";

type TableData = {
  [key: string]: string[];
};

function App() {
  const [sqlData, setSqlData] = useState({});
  const [wfsData, setWfsData] = useState({});
  const [gpkgData, setGpkgData] = useState({});
  const [existingGeopackages, setExistingGeopackages] = useState<string[]>([""]);
  const [selectedDataSource, setSelectedDataSource] = useState("PostgreSQL");
  const [dataProcessed, setDataProcessed] = useState<string>("");
  const [allTables, setAllTables] = useState<TableData>({});
  const [workspace, setWorkspace] = useState("c:/Users/p.zahnen/Documents/GitHub/editor/data");
  const basisDates = {
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
        setWorkspace(workspaceRoot.replace(/\\/g, "/"));
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
    if (selectedDataSource === "PostgreSQL") {
      setWfsData({});
      setGpkgData({});
      if (!Object.keys(sqlData).includes("command")) {
        setSqlData(basisDates);
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
      if (!Object.keys(wfsData).includes("command")) {
        setWfsData(basisDates);
      }
      setWfsData((prevWfsData) => ({
        ...prevWfsData,
        [key]: value,
        featureProviderType: selectedDataSource,
      }));
    }
    if (selectedDataSource === "GeoPackage") {
      setSqlData({});
      setWfsData({});
      if (!Object.keys(gpkgData).includes("command")) {
        setGpkgData(basisDates);
      }
      setGpkgData((prevGpkgData) => ({
        ...prevGpkgData,
        [key]: value,
        featureProviderType: selectedDataSource,
      }));
    }
  };

  const submitData = (data: Object) => {
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
        console.log("Nachricht vom Server erhalten:", response);
        if (response.error && response.error === "No 'command' given: {}") {
          vscode.postMessage({
            command: "error",
            text: `Error: Empty Fields`,
          });
        } else if (response.error) {
          vscode.postMessage({
            command: "error",
            text: `Error: ${response.error}`,
          });
        }
        setAllTables(response.details.schemas);
        console.log("All Tables:", response.details.schemas);
      });
      setDataProcessed("inProgress");
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
    if (dataProcessed === "inProgress") {
      setTimeout(() => {
        setDataProcessed("true");
      }, 2000);
    } else if (dataProcessed === "true") {
      vscode.postMessage({
        command: "hello",
        text: "Die Daten wurden verarbeitet.",
      });
    }
  }, [dataProcessed]);

  return (
    <main>
      <h3>Create new service</h3>
      <section className="component-example">
        <VSCodeTextField
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
        <VSCodeRadioGroup name="DataType" value={selectedDataSource}>
          <label slot="label">Data Source Type</label>
          <VSCodeRadio
            id="GeoPackage"
            value="GeoPackage"
            onChange={() => setSelectedDataSource("GeoPackage")}>
            GeoPackage
          </VSCodeRadio>
          <VSCodeRadio
            id="PostgreSQL"
            value="PostgreSQL"
            onChange={() => setSelectedDataSource("PostgreSQL")}>
            PostgreSQL
          </VSCodeRadio>
          <VSCodeRadio id="WFS" value="WFS" onChange={() => setSelectedDataSource("WFS")}>
            WFS
          </VSCodeRadio>
        </VSCodeRadioGroup>
      </section>
      {selectedDataSource === "PostgreSQL" ? (
        <PostgreSql
          submitData={submitData}
          handleUpdateData={handleUpdateData}
          dataProcessed={dataProcessed}
          selectedDataSource={selectedDataSource}
          sqlData={sqlData}
          allTables={allTables}
        />
      ) : selectedDataSource === "GeoPackage" ? (
        <GeoPackage
          selectedDataSource={selectedDataSource}
          submitData={submitData}
          dataProcessed={dataProcessed}
          setDataProcessed={setDataProcessed}
          existingGeopackages={existingGeopackages}
          handleUpdateData={handleUpdateData}
          gpkgData={gpkgData}
          setGpkgData={setGpkgData}
          allTables={allTables}
        />
      ) : (
        <Wfs
          submitData={submitData}
          handleUpdateData={handleUpdateData}
          wfsData={wfsData}
          setWfsData={setWfsData}
          dataProcessed={dataProcessed}
        />
      )}
    </main>
  );
}

export default App;
