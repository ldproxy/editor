import "./App.css";
import {
  VSCodeTextField,
  VSCodeButton,
  VSCodeProgressRing,
} from "@vscode/webview-ui-toolkit/react";
import { useState } from "react";
import { BasicData } from "./utilities/xtracfg";

export type WfsData = BasicData & {
  url?: string;
  user?: string;
  password?: string;
};

type PostgreSqlProps = {
  submitData: (data: Object) => void;
  wfsData: WfsData;
  setWfsData(wfsData: Object): void;
  dataProcessing: string;
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
              value={props.wfsData.url ? props.wfsData.url : undefined || ""}
              disabled={props.dataProcessing === "inProgress"}
              onChange={(e) => {
                const target = e.target as HTMLInputElement;
                if (target) {
                  //  props.handleUpdateData("url", target.value);
                }
              }}>
              WFS URL
            </VSCodeTextField>
          </section>
          <div id="switchDiv">
            <label className="switch">
              <input
                type="checkbox"
                checked={isSwitchOn}
                onChange={handleSwitchToggle}
                disabled={props.dataProcessing === "inProgress"}
              />
              <span className="slider"></span>
            </label>
            <label htmlFor="basicAuthSwitch">Basic Auth</label>
          </div>
          {isSwitchOn ? (
            <>
              <section className="component-example">
                <VSCodeTextField
                  value={props.wfsData.user ? props.wfsData.user : undefined || ""}
                  disabled={props.dataProcessing === "inProgress"}
                  onChange={(e) => {
                    const target = e.target as HTMLInputElement;
                    if (target) {
                      //        props.handleUpdateData("user", target.value);
                    }
                  }}>
                  User
                </VSCodeTextField>
              </section>
              <section className="component-example">
                <VSCodeTextField
                  value={props.wfsData.password ? props.wfsData.password : undefined || ""}
                  disabled={props.dataProcessing === "inProgress"}
                  onChange={(e) => {
                    const target = e.target as HTMLInputElement;
                    if (target) {
                      //    props.handleUpdateData("password", target.value);
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
            disabled={props.dataProcessing === "inProgress"}>
            Next
          </VSCodeButton>
        </div>
      </div>
      {props.dataProcessing === "inProgress" && (
        <div className="progress-container">
          <VSCodeProgressRing className="progressRing" />
          <span id="progressText">Data is being processed...</span>
        </div>
      )}{" "}
    </div>
  );
}

export default Wfs;
