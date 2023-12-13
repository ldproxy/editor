import { VSCodeProgressRing } from "@vscode/webview-ui-toolkit/react";

import { SchemaTables } from "./utilities/xtracfg";

type ProgressProps = {
  currentTable: string;
  progress: { [key: string]: string[] };
  selectedTable: SchemaTables;
  dataProcessed: string;
  fallbackSchema?: string;
};

type SchemaData = {
  schema: string;
  completedTables: string[];
};

const Progress = ({
  currentTable,
  progress,
  selectedTable,
  dataProcessed,
  fallbackSchema,
}: ProgressProps) => {
  if (Object.keys(progress).length === 0 || Object.keys(selectedTable).length === 0) {
    return null;
  }

  const schemasToShow: SchemaData[] = Object.keys(selectedTable).map((schema) => ({
    schema,
    completedTables: [],
  }));

  schemasToShow.forEach((schemaData) => {
    const { schema } = schemaData;
    if (progress.hasOwnProperty(schema)) {
      const tablesForSchema = progress[schema];
      const completedTables = tablesForSchema.filter((table) => {
        return table !== currentTable.split(".")[1] || dataProcessed === "generated";
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
            <span className="schema-bullet">{schema || fallbackSchema}</span>
            {completedTables.length === selectedTable[schema].length ? (
              <span className="table-item">✓</span>
            ) : (
              <span className="table-item">
                {completedTables.length} / {selectedTable[schema].length}
              </span>
            )}
            {completedTables.length === selectedTable[schema].length ? null : (
              <ul>
                {progress[schema]?.map((table, tableIndex) => {
                  if (table !== currentTable.split(".")[1]) {
                    return (
                      <li key={tableIndex}>
                        <span className="table-item">✓ {table}</span>
                      </li>
                    );
                  } else if (dataProcessed === "generated") {
                    return (
                      <li key={tableIndex}>
                        <span className="table-item">✓ {table}</span>
                      </li>
                    );
                  }
                  return null;
                })}
                {currentTable &&
                !Object.values(progress).flat().includes(currentTable) &&
                currentTable.split(".")[0] === schema &&
                dataProcessed !== "generated" ? (
                  <li className="spinnerTable">
                    <VSCodeProgressRing className="progressRing2" />
                    <span className="table-item"> {currentTable.split(".")[1]}</span>
                  </li>
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
