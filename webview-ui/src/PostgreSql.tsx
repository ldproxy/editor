import { VSCodeButton, VSCodeTextField } from "@vscode/webview-ui-toolkit/react";
import "./App.css";

type PostgreSqlProps = {
  submitData: () => void;
  handleUpdateData(key: string, value: string): void;
};

function PostgreSql(props: PostgreSqlProps) {
  return (
    <>
      <section className="component-example">
        <VSCodeTextField
          onChange={(e) => {
            const target = e.target as HTMLInputElement;
            if (target) {
              props.handleUpdateData("Host", target.value);
            }
          }}>
          Host
        </VSCodeTextField>
      </section>
      <section className="component-example">
        <VSCodeTextField
          onChange={(e) => {
            const target = e.target as HTMLInputElement;
            if (target) {
              props.handleUpdateData("Database", target.value);
            }
          }}>
          Database
        </VSCodeTextField>
      </section>
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
      <VSCodeButton onClick={props.submitData}>Next</VSCodeButton>
    </>
  );
}

export default PostgreSql;
