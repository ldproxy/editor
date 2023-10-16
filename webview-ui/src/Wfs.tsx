import "./App.css";
import {
  VSCodeTextField,
  VSCodeButton,
  VSCodeProgressRing,
} from "@vscode/webview-ui-toolkit/react";
import { useState } from "react";

type PostgreSqlProps = {
  submitData: (data: Object) => void;
  handleUpdateData(key: string, value: string): void;
  wfsData: Object;
  setWfsData(wfsData: Object): void;
  dataProcessed: string;
  error: Object;
};

function Wfs(props: PostgreSqlProps) {
  const [isSwitchOn, setIsSwitchOn] = useState(false);

  const handleSwitchToggle = () => {
    setIsSwitchOn(!isSwitchOn);
    if (!isSwitchOn) {
      const updatedWfsData = props.wfsData;
      if ("user" in updatedWfsData) {
        delete updatedWfsData["user"];
      }
      if ("password" in updatedWfsData) {
        delete updatedWfsData["password"];
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
                      props.handleUpdateData("user", target.value);
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
                      props.handleUpdateData("password", target.value);
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
            onClick={() => props.submitData(props.wfsData)}
            disabled={props.dataProcessed === "inProgress"}>
            Next
          </VSCodeButton>
        </div>
      </div>
      <div id="errorSpan">
        {props.error && props.error.hasOwnProperty("WFS") ? (
          <span id="error-text">{`Error: ${(props.error as any).WFS}`}</span>
        ) : null}
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
