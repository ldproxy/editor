import "./App.css";
import {
  VSCodeTextField,
  VSCodeButton,
  VSCodeProgressRing,
} from "@vscode/webview-ui-toolkit/react";
import { useState } from "react";

type PostgreSqlProps = {
  submitData: () => void;
  handleUpdateData(key: string, value: string): void;
  wfsData: { [key: string]: string };
  setWfsData(wfsData: { [key: string]: string }): void;
  dataProcessed: string;
};

function Wfs(props: PostgreSqlProps) {
  const [isSwitchOn, setIsSwitchOn] = useState(false);

  const handleSwitchToggle = () => {
    setIsSwitchOn(!isSwitchOn);
    if (!isSwitchOn) {
      const updatedWfsData = { ...props.wfsData };
      if ("User" in updatedWfsData) {
        delete updatedWfsData["User"];
      }
      if ("Password" in updatedWfsData) {
        delete updatedWfsData["Password"];
      }

      props.setWfsData(updatedWfsData);
    }
  };

  return (
    <div className="frame">
      <div className="postgresWfsOuterContainer">
        <div className="postgresWfsInnerContainer">
          <section className="component-example">
            <VSCodeTextField
              onChange={(e) => {
                const target = e.target as HTMLInputElement;
                if (target) {
                  props.handleUpdateData("WFS URL", target.value);
                }
              }}>
              WFS URL
            </VSCodeTextField>
          </section>
          <div id="switchDiv">
            <label className="switch">
              <input type="checkbox" checked={isSwitchOn} onChange={handleSwitchToggle} />
              <span className="slider"></span>
            </label>
            <label htmlFor="basicAuthSwitch">Basic Auth</label>
          </div>
          {isSwitchOn ? (
            <>
              <section className="component-example">
                <VSCodeTextField
                  onChange={(e) => {
                    const target = e.target as HTMLInputElement;
                    if (target) {
                      props.handleUpdateData("User", target.value);
                    }
                  }}>
                  User
                </VSCodeTextField>
              </section>
              <section className="component-example">
                <VSCodeTextField
                  onChange={(e) => {
                    const target = e.target as HTMLInputElement;
                    if (target) {
                      props.handleUpdateData("Password", target.value);
                    }
                  }}>
                  Password
                </VSCodeTextField>
              </section>
            </>
          ) : null}
        </div>
        <div className="postgresWfsSubmit">
          <VSCodeButton
            className="submitButton"
            onClick={props.submitData}
            disabled={props.dataProcessed === "inProgress"}>
            Next
          </VSCodeButton>
        </div>
      </div>
      {props.dataProcessed === "inProgress" && (
        <div className="progress-container">
          <VSCodeProgressRing className="progressRing" />
          <span id="progressText">Die Daten werden verarbeitet...</span>
        </div>
      )}{" "}
    </div>
  );
}

export default Wfs;
