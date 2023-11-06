import { VSCodeTextField, VSCodeRadioGroup, VSCodeRadio } from "@vscode/webview-ui-toolkit/react";
import "./App.css";
import { atom, useRecoilState } from "recoil";
import { syncEffect } from "recoil-sync";
import { string } from "@recoiljs/refine";

export const idAtom = atom({
  key: "id",
  default: "",
});

export const featureProviderTypeAtom = atom({
  key: "featureProviderType",
  default: "PGIS",
  effects: [syncEffect({ refine: string() })],
});

type CommonProps = {
  disabled: boolean;
  error: {
    id?: string;
  };
};

function Common({ disabled, error }: CommonProps) {
  const [id, setId] = useRecoilState(idAtom);
  const [featureProviderType, setFeatureProviderType] = useRecoilState(featureProviderTypeAtom);

  return (
    <>
      <h3>Create new service</h3>
      <section className="component-example">
        <div className="input-container">
          <VSCodeTextField
            value={id}
            disabled={disabled}
            onChange={(e) => {
              const target = e.target as HTMLInputElement;
              if (target) {
                setId(target.value);
              }
            }}>
            Id
          </VSCodeTextField>
          {error.id && <span className="error-message">{error.id}</span>}
        </div>
      </section>
      <section className="component-example">
        <VSCodeRadioGroup
          name="DataType"
          value={featureProviderType}
          orientation="vertical"
          disabled={disabled}>
          <label slot="label">Data Source Type</label>
          <VSCodeRadio id="PostgreSQL" value="PGIS" onChange={() => setFeatureProviderType("PGIS")}>
            PostgreSQL
          </VSCodeRadio>
          <VSCodeRadio
            id="GeoPackage"
            value=" GPKG"
            onChange={() => setFeatureProviderType("GPKG")}>
            GeoPackage
          </VSCodeRadio>
          <VSCodeRadio id="WFS" value="WFS" onChange={() => setFeatureProviderType("WFS")}>
            WFS
          </VSCodeRadio>
        </VSCodeRadioGroup>
      </section>
    </>
  );
}

export default Common;