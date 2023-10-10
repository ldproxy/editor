import { vscode } from "./utilities/vscode";
import { VSCodeButton,VSCodeTextField,VSCodeRadioGroup,VSCodeRadio } from "@vscode/webview-ui-toolkit/react";
import "./App.css";

function App() {
  function handleHowdyClick() {
    vscode.postMessage({
      command: "hello",
      text: "Hey there partner! 🤠",
    });
  }

  return (
    <main>
      <h3>Create new service</h3>
      <section className="component-example">
        <VSCodeTextField>Id</VSCodeTextField>
      </section>
      <section className="component-example">
        <VSCodeRadioGroup>
          <label slot="label">Data Source Type</label>
          <VSCodeRadio>GeoPackage</VSCodeRadio>
          <VSCodeRadio>PostgreSQL</VSCodeRadio>
          <VSCodeRadio>WFS</VSCodeRadio>
        </VSCodeRadioGroup>
      </section>
      <section className="component-example">
      <VSCodeTextField>Host</VSCodeTextField>
      </section>
      <section className="component-example">
      <VSCodeTextField>Database</VSCodeTextField>
      </section>
      <section className="component-example">
      <VSCodeTextField>User</VSCodeTextField>
      </section>
      <section className="component-example">
      <VSCodeTextField>Password</VSCodeTextField>
      </section>
      <VSCodeButton onClick={handleHowdyClick}>Next</VSCodeButton>
    </main>
  );
}

export default App;
