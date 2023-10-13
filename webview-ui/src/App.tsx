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
  const [response, setResponse] = useState("");
  const [selectedDataSource, setSelectedDataSource] = useState("PostgreSQL");
  const [dataProcessed, setDataProcessed] = useState<string>("");

  const handleUpdateData = (key: string, value: string) => {
    if (selectedDataSource === "PostgreSQL") {
      setWfsData({});
      setSqlData({
        ...sqlData,
        [key]: value,
      });
    }
    if (selectedDataSource === "WFS") {
      setSqlData({});
      setWfsData({
        ...wfsData,
        [key]: value,
      });
    }
  };

  const submitData = () => {
    /*
    fetch("http://localhost:7080/rest/admin/services", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data), 
    })
      .then((response) => response.json())
      .then((responseData) => {
        setResponse(responseData);
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
              handleUpdateData("Id", target.value);
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
        />
      ) : selectedDataSource === "GeoPackage" ? (
        <GeoPackage
          selectedDataSource={selectedDataSource}
          submitData={submitData}
          dataProcessed={dataProcessed}
          setDataProcessed={setDataProcessed}
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
