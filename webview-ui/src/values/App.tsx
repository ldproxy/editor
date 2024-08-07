import {
  VSCodeTextField,
  VSCodeRadioGroup,
  VSCodeRadio,
  VSCodeButton,
} from "@vscode/webview-ui-toolkit/react";
import { useRecoilState, selector, useRecoilValue } from "recoil";

import { atomSyncString } from "../utilities/recoilSyncWrapper";
import { Response, Error, xtracfg } from "../utilities/xtracfgValues";

export const apiNameAtom = atomSyncString("apiName", "");
export const valueFileNameAtom = atomSyncString("valueFileName", "");
export const typeAtom = atomSyncString("type", "maplibre-style");

export const valueDataSelector = selector({
  key: "valueDataSelector",
  get: ({ get }) => {
    const apiId = get(apiNameAtom);
    const name = get(valueFileNameAtom);
    const type = get(typeAtom);
    const source = "/Users/pascal/Documents/ldproxy_mount";
    const command = "autoValue";
    return {
      apiId,
      name,
      type,
      source,
      command,
    };
  },
});

export type valueData = {
  apiId: string;
  name: string;
  type: string;
  source: string;
  command: string;
};

export type BasicData = valueData & {
  subcommand: string;
};

function App() {
  const [apiName, setApiName] = useRecoilState(apiNameAtom);
  const [valueFileName, setValueFileName] = useRecoilState(valueFileNameAtom);
  const [type, setType] = useRecoilState(typeAtom);
  const valueData = useRecoilValue<valueData>(valueDataSelector);

  const submitData = (data: valueData) => {
    const basicData: BasicData = {
      ...data,
      subcommand: "generate",
    };

    xtracfg.send(basicData);
  };

  return (
    <>
      <main>
        <h3>Create new values</h3>
        <div className="input-container">
          <section className="component-example">
            <VSCodeTextField
              value={apiName}
              onChange={(e) => {
                const target = e.target as HTMLInputElement;
                if (target) {
                  setApiName(target.value);
                }
              }}>
              Api Name
            </VSCodeTextField>
          </section>
          <section className="component-example">
            <VSCodeTextField
              value={valueFileName}
              onChange={(e) => {
                const target = e.target as HTMLInputElement;
                if (target) {
                  setValueFileName(target.value);
                }
              }}>
              Value Filename
            </VSCodeTextField>
          </section>
        </div>
        <section className="component-example">
          <VSCodeRadioGroup name="ValueType" value={type} orientation="vertical">
            <label slot="label">Value Type</label>
            <VSCodeRadio
              id="MapLibreStyle"
              value="maplibre-style"
              onChange={() => setType("maplibre-style")}>
              maplibre-style
            </VSCodeRadio>
          </VSCodeRadioGroup>
        </section>
        <div className="postgresWfsSubmit">
          <VSCodeButton className="submitButton" onClick={() => submitData(valueData)}>
            Next
          </VSCodeButton>
        </div>
      </main>
    </>
  );
}

export default App;
