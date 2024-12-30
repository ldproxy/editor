import {
  VSCodeTextField,
  VSCodeButton,
  VSCodeProgressRing,
} from "@vscode/webview-ui-toolkit/react";
import { useRecoilState, useRecoilValue, selector } from "recoil";

import { BasicData } from "../../utilities/xtracfg";
import Common, { idAtom, featureProviderTypeAtom } from "../Common";
import { atomSyncString, atomSyncBoolean } from "../../utilities/recoilSyncWrapper";
import { DEV } from "../../utilities/constants";
import TypeCheckboxes, { typeObjectAtom } from "../../components/TypeCheckboxes";

export const urlAtom = atomSyncString("url", "", "StoreB");

const userAtom = atomSyncString("userWFS", "", "StoreB");

const passwordAtom = atomSyncString("passwordWFS", "", "StoreB");

export const wfsDataSelector = selector({
  key: "wfsDataSelector",
  get: ({ get }) => {
    const id = get(idAtom);
    const url = get(urlAtom);
    const user = get(userAtom);
    const password = get(passwordAtom);
    const featureProviderType = get(featureProviderTypeAtom);
    const typeObject = get(typeObjectAtom);
    return {
      id,
      ...(url ? { url } : null),
      ...(user ? { user } : null),
      ...(password ? { password } : null),
      featureProviderType,
      typeObject,
    };
  },
});

export type WfsData = BasicData & {
  id?: string;
  url?: string;
  user?: string;
  password?: string;
  featureProviderType?: string;
  typeObject?: object;
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

export const isSwitchOnAtom = atomSyncBoolean("isSwitchOn", false, "StoreB");

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

  if (DEV) {
    console.log("wfsData", wfsData);
  }

  return (
    <>
      <div className="postgresWfsOuterContainer">
        <div className="postgresWfsInnerContainer">
          <section className="component-example">
            <VSCodeTextField
              value={url ? url : ""}
              disabled={inProgress}
              onInput={(e) => {
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
                  value={user ? user : ""}
                  disabled={inProgress}
                  onInput={(e) => {
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
                  value={password ? password : ""}
                  disabled={inProgress}
                  onInput={(e) => {
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
        <div style={{ width: "700px", marginTop: "20px", marginBottom: "25px" }}>
          <TypeCheckboxes mode="fromData" />
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
    </>
  );
}

export default Wfs;
