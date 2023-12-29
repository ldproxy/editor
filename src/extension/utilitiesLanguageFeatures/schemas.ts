import { newXtracfg } from "../utilities/xtracfg";
import { getCurrentFilePath, getWorkspacePath } from "../utilities/paths";

export interface DefinitionsMap {
  [key: string]: LooseDefinition;
}

export interface LooseDefinition {
  title?: string;
  description?: string;
  [key: string]: any;
}

const xtracfg = newXtracfg();

let allSchemas: Promise<DefinitionsMap>;

const fileTypes: {
  [key: string]: {
    result: Promise<string>;
    resolve: (fileType: string) => void;
    reject: (reason: string) => void;
  };
} = {};

//TODO: is called 3 times
export const initSchemas = () => {
  console.log("INIT SCHEMAS");

  let res: (value: DefinitionsMap) => void, rej;
  allSchemas = new Promise((resolve, reject) => {
    res = resolve;
    rej = reject;
  });

  //TODO: reject on error
  xtracfg.listen(
    (response) => {
      console.log("RESP", response);
      if (response.details && response.details.path && response.details.fileType) {
        if (Object.hasOwn(fileTypes, response.details.path)) {
          console.log("FOUND");
          fileTypes[response.details.path].resolve(response.details.fileType);
        }
      } else if (
        response.results &&
        response.results[0] &&
        response.results[0].message === "schemas" &&
        response.details
      ) {
        let schemas: DefinitionsMap = {};

        Object.keys(response.details).forEach((key) => {
          if (response.details) {
            schemas[key] = JSON.parse(response.details[key]);
          }
        });
        console.log("SCHEMAS", schemas);
        res(schemas);
      }
    },
    (error) => {
      console.error("ERR", error);
    }
  );

  xtracfg.send({ command: "schemas", source: getWorkspacePath(), verbose: true, debug: true });
};

export const getSchema = async (): Promise<LooseDefinition | undefined> => {
  const schemas = await allSchemas;
  const fileType = await getCurrentFileType();

  if (!schemas || !fileType) {
    return undefined;
  }

  return schemas[fileType];
};

export const getSchemaDefs = async (): Promise<DefinitionsMap | undefined> => {
  const schema = await getSchema();

  if (!schema) {
    return undefined;
  }

  return schema.$defs;
};

const getCurrentFileType = async (): Promise<string | undefined> => {
  const currentFilePath = getCurrentFilePath();

  if (!currentFilePath) {
    return undefined;
  }

  if (!Object.hasOwn(fileTypes, currentFilePath)) {
    const fileType: any = {};
    fileType.result = new Promise((resolve, reject) => {
      fileType.resolve = resolve;
      fileType.reject = reject;
    });

    fileTypes[currentFilePath] = fileType;

    xtracfg.send({
      command: "file_type",
      source: getWorkspacePath(),
      path: currentFilePath,
      verbose: true,
      debug: true,
    });
  }

  return fileTypes[currentFilePath].result;
};
