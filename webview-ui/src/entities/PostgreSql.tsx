import {
  VSCodeButton,
  VSCodeTextField,
  VSCodeProgressRing,
} from "@vscode/webview-ui-toolkit/react";
import { useRecoilState, useRecoilValue, selector } from "recoil";

import { BasicData } from "../utilities/xtracfg";
import Common, { idAtom, featureProviderTypeAtom } from "./Common";
import { atomSyncString } from "../utilities/recoilSyncWrapper";

const hostAtom = atomSyncString("host", "", "StoreB");

const databaseAtom = atomSyncString("database", "", "StoreB");

export const userAtom = atomSyncString("user", "", "StoreB");

export const passwordAtom = atomSyncString("password", "", "StoreB");

export const sqlDataSelector = selector({
  key: "sqlDataSelector",
  get: ({ get }) => {
    const id = get(idAtom);
    const featureProviderType = get(featureProviderTypeAtom);
    const host = get(hostAtom);
    const database = get(databaseAtom);
    const user = get(userAtom);
    const password = get(passwordAtom);
    return {
      id,
      featureProviderType,
      host,
      database,
      user,
      password,
    };
  },
});

export type SqlData = BasicData & {
  id?: string;
  featureProviderType?: string;
  host?: string;
  database?: string;
  user?: string;
  password?: string;
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
  };
};

function PostgreSql({ error, inProgress, submitData }: PostgreSqlProps) {
  const [host, setHost] = useRecoilState<string>(hostAtom);
  const [database, setDatabase] = useRecoilState<string>(databaseAtom);
  const [user, setUser] = useRecoilState<string>(userAtom);
  const [password, setPassword] = useRecoilState<string>(passwordAtom);
  const sqlData = useRecoilValue(sqlDataSelector);

  return (
    <div className="frame">
      <Common error={error} disabled={inProgress} />
      <div className="postgresWfsOuterContainer">
        <div className="postgresWfsInnerContainer">
          <section className="component-example">
            <VSCodeTextField
              value={host}
              disabled={inProgress}
              onInput={(e) => {
                const target = e.target as HTMLInputElement;
                if (target) {
                  setHost(target.value);
                }
              }}>
              Host
            </VSCodeTextField>
            {error.host && <span className="error-message">{error.host}</span>}
          </section>
          <section className="component-example">
            <VSCodeTextField
              value={database}
              disabled={inProgress}
              onInput={(e) => {
                const target = e.target as HTMLInputElement;
                if (target) {
                  setDatabase(target.value);
                }
              }}>
              Database
            </VSCodeTextField>
            {error.database && <span className="error-message">{error.database}</span>}
          </section>
          <section className="component-example">
            <VSCodeTextField
              value={user}
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
              value={password}
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
        </div>
        <div className="submitAndReset">
          <VSCodeButton
            className="submitButton"
            onClick={() => submitData(sqlData)}
            disabled={inProgress}>
            Next
          </VSCodeButton>
        </div>
      </div>
      {inProgress && (
        <div className="progress-container">
          <VSCodeProgressRing className="progressRing" />
          <span id="progressText">Analyzing database ...</span>
        </div>
      )}
    </div>
  );
}

export default PostgreSql;
