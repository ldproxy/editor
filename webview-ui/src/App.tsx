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

function App() {
  const [sqlData, setSqlData] = useState({});
  const [wfsData, setWfsData] = useState({});
  const [selectedDataSource, setSelectedDataSource] = useState("PostgreSQL");
  const [dataProcessed, setDataProcessed] = useState<string>("");
  const [error, setError] = useState<Object>({});
  const [workspace, setWorkspace] = useState(
    "c:\\Users\\p.zahnen\\Documents\\GitHub\\editor\\data"
  );
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
      default:
        console.log("Access to the workspace is not available.");
    }
  });

  const handleUpdateData = (key: string, value: string) => {
    if (selectedDataSource === "PostgreSQL") {
      setWfsData({});
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
      if (!Object.keys(wfsData).includes("command")) {
        setWfsData(basisDates);
      }
      setWfsData((prevWfsData) => ({
        ...prevWfsData,
        [key]: value,
        featureProviderType: selectedDataSource,
      }));
    }
  };

  const submitData = (data: Object) => {
    const socket = new WebSocket("ws://localhost:8080/sock");

    socket.addEventListener("open", () => {
      console.log("WebSocket-Verbindung geöffnet");
      const jsonData = JSON.stringify(data);
      console.log("sqlData", jsonData);
      socket.send(jsonData);
    });

    socket.addEventListener("message", (event) => {
      const response = JSON.parse(event.data);
      console.log("Nachricht vom Server erhalten:", response);
      if (response.error) {
        console.error(`Error:`, response.error);
        setError({ [selectedDataSource]: response.error });
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
    setDataProcessed("inProgress");
  };

  useEffect(() => {
    if (dataProcessed === "inProgress") {
      vscode.postMessage({
        command: "hello",
        text: "Die Daten werden verarbeitet.",
      });
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
          error={error}
        />
      ) : selectedDataSource === "GeoPackage" ? (
        <GeoPackage
          selectedDataSource={selectedDataSource}
          submitData={submitData}
          dataProcessed={dataProcessed}
          setDataProcessed={setDataProcessed}
          error={error}
        />
      ) : (
        <Wfs
          submitData={submitData}
          handleUpdateData={handleUpdateData}
          wfsData={wfsData}
          setWfsData={setWfsData}
          dataProcessed={dataProcessed}
          error={error}
        />
      )}
    </main>
  );
}

export default App;
