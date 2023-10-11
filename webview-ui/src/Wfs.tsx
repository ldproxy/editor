import "./App.css";
import { VSCodeTextField, VSCodeButton } from "@vscode/webview-ui-toolkit/react";

type PostgreSqlProps = {
  submitData: () => void;
  handleUpdateData(key: string, value: string): void;
};

function Wfs(props: PostgreSqlProps) {
  return (
    <>
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
      <VSCodeButton onClick={props.submitData}>Next</VSCodeButton>
    </>
  );
}

export default Wfs;
