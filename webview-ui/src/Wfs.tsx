import "./App.css";
import {
  VSCodeTextField,
  VSCodeButton,
  VSCodeProgressRing,
} from "@vscode/webview-ui-toolkit/react";
import { BasicData } from "./utilities/xtracfg";
import { useRecoilState, atom, useRecoilValue, selector } from "recoil";
import Common, { idAtom, featureProviderTypeAtom } from "./Common";
import { atomSyncString, atomSyncObject, atomSyncBoolean } from "./utilities/recoilSyncWrapper";

export const wfsDataAtom = atomSyncObject("wfsData", {});

export const urlAtom = atomSyncString("url", "");

const userAtom = atomSyncString("user", "");

const passwordAtom = atomSyncString("password", "");

export const wfsDataSelector = selector({
  key: "wfsDataSelector",
  get: ({ get }) => {
    const id = get(idAtom);
    const url = get(urlAtom);
    const user = get(userAtom);
    const password = get(passwordAtom);
    const featureProviderType = get(featureProviderTypeAtom);
    return {
      id,
      ...(url ? { url } : null),
      ...(user ? { user } : null),
      ...(password ? { password } : null),
      featureProviderType,
    };
  },
});

export type WfsData = BasicData & {
  id?: string;
  url?: string;
  user?: string;
  password?: string;
  featureProviderType?: string;
};

type PostgreSqlProps = {
  submitData: (data: Object) => void;
  inProgress: boolean;
  error: {
    id?: string;
    host?: string;
    database?: string;
    user?: string;
    password?: string;
    url?: string;
  };
};

export const isSwitchOnAtom = atomSyncBoolean("isSwitchOn", false);

function Wfs({ submitData, inProgress, error }: PostgreSqlProps) {
  const wfsData = useRecoilValue<WfsData>(wfsDataSelector);

  const [url, setUrl] = useRecoilState<string>(urlAtom);
  const [user, setUser] = useRecoilState<string>(userAtom);
  const [password, setPassword] = useRecoilState<string>(passwordAtom);
  const [isSwitchOn, setIsSwitchOn] = useRecoilState(isSwitchOnAtom);

  const handleSwitchToggle = () => {
    setIsSwitchOn(!isSwitchOn);
    if (!isSwitchOn) {
      setUser("");
      setPassword("");
    }
  };

  console.log("wfsData", wfsData);

  return (
    <div className="frame">
      <Common error={error} disabled={inProgress} />
      <div className="postgresWfsOuterContainer">
        <div className="postgresWfsInnerContainer">
          <section className="component-example">
            <VSCodeTextField
              value={url ? url : undefined || ""}
              disabled={inProgress}
              onChange={(e) => {
                const target = e.target as HTMLInputElement;
                if (target) {
                  setUrl(target.value);
                }
              }}>
              WFS URL
            </VSCodeTextField>
            {error.url && <span className="error-message">{error.url}</span>}
          </section>
          <div id="switchDiv">
            <label className="switch">
              <input
                type="checkbox"
                checked={isSwitchOn}
                onChange={handleSwitchToggle}
                disabled={inProgress}
              />
              <span className="slider"></span>
            </label>
            <label htmlFor="basicAuthSwitch">Basic Auth</label>
          </div>
          {isSwitchOn ? (
            <>
              <section className="component-example">
                <VSCodeTextField
                  value={user ? user : undefined || ""}
                  disabled={inProgress}
                  onChange={(e) => {
                    const target = e.target as HTMLInputElement;
                    if (target) {
                      setUser(target.value);
                    }
                  }}>
                  User
                </VSCodeTextField>
                {error.user && <span className="error-message">{error.user}</span>}
              </section>
              <section className="component-example">
                <VSCodeTextField
                  value={password ? password : undefined || ""}
                  disabled={inProgress}
                  onChange={(e) => {
                    const target = e.target as HTMLInputElement;
                    if (target) {
                      setPassword(target.value);
                    }
                  }}>
                  Password
                </VSCodeTextField>
                {error.password && <span className="error-message">{error.password}</span>}
              </section>
            </>
          ) : null}
        </div>
        <div className="postgresWfsSubmit">
          <VSCodeButton
            className="submitButton"
            onClick={() => submitData(wfsData)}
            disabled={inProgress}>
            Next
          </VSCodeButton>
        </div>
      </div>
      {inProgress && (
        <div className="progress-container">
          <VSCodeProgressRing className="progressRing" />
          <span id="progressText">Data is being processed...</span>
        </div>
      )}{" "}
    </div>
  );
}

export default Wfs;
