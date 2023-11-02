import { VSCodeProgressRing } from "@vscode/webview-ui-toolkit/react";
import "./App.css";
import { SchemaTables } from "./utilities/xtracfg";

type ProgressProps = {
  currentTable: string;
  progress: { [key: string]: string[] };
  selectedTable: SchemaTables;
  dataProcessed: string;
  currentCount: number;
  targetCount: number;
};

type SchemaData = {
  schema: string;
  completedTables: string[];
};

const Progress = (props: ProgressProps) => {
  if (Object.keys(props.progress).length === 0 || Object.keys(props.selectedTable).length === 0) {
    return null;
  }

  const schemasToShow: SchemaData[] = Object.keys(props.selectedTable).map((schema) => ({
    schema,
    completedTables: [],
  }));

  schemasToShow.forEach((schemaData) => {
    const { schema } = schemaData;
    if (props.progress.hasOwnProperty(schema)) {
      const tablesForSchema = props.progress[schema];
      const completedTables = tablesForSchema.filter((table) => {
        return table !== props.currentTable.split(".")[1] || props.dataProcessed === "generated";
      });
      schemaData.completedTables = completedTables;
    }
  });

  return (
    <div className="progress">
      {schemasToShow.map((schemaData, schemaIndex) => {
        const { schema, completedTables } = schemaData;

        return (
          <div key={schemaIndex}>
            <span className="schema-bullet">&#8226; {schema}</span>
            {completedTables.length === props.selectedTable[schema].length ? (
              <span className="table-item">✓</span>
            ) : (
              <span className="table-item">
                {completedTables.length} / {props.selectedTable[schema].length}
              </span>
            )}
            {completedTables.length === props.selectedTable[schema].length ? null : (
              <ul>
                {props.progress[schema]?.map((table, tableIndex) => {
                  if (table !== props.currentTable.split(".")[1]) {
                    return (
                      <div key={tableIndex}>
                        <span className="table-item">✓ {table}</span>
                      </div>
                    );
                  } else if (props.dataProcessed === "generated") {
                    return (
                      <div key={tableIndex}>
                        <span className="table-item">✓ {table}</span>
                      </div>
                    );
                  }
                  return null;
                })}
                {props.currentTable &&
                !Object.values(props.progress).flat().includes(props.currentTable) &&
                props.currentTable.split(".")[0] === schema &&
                props.dataProcessed !== "generated" ? (
                  <div className="spinnerTable">
                    <VSCodeProgressRing className="progressRing2" />
                    <span className="table-item"> {props.currentTable.split(".")[1]}</span>
                  </div>
                ) : null}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Progress;
