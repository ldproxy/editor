import { newXtracfg } from "../utilities/xtracfg";
import { getCurrentFilePath, getWorkspacePath } from "../utilities/paths";
import { DEV } from "../utilities/constants";
import { findMyRef } from "./findDefaultCfgRef";
import { TOP_LEVEL_REF } from "./defineDefs";

export interface DefinitionsMap {
  [key: string]: LooseDefinition;
}

export interface LooseDefinition {
  title?: string;
  description?: string;
  [key: string]: any;
}

interface FileType {
  type: string;
  subProperty?: string;
  discriminatorKey?: string;
  discriminatorValue?: string;
}

const xtracfg = newXtracfg();

let allSchemas: Promise<DefinitionsMap>;

const fileTypes: {
  [key: string]: {
    result: Promise<FileType>;
    resolve: (fileType: FileType) => void;
    reject: (reason: string) => void;
  };
} = {};

//TODO: is called 3 times
export const initSchemas = () => {
  if (DEV) {
    console.log("INIT SCHEMAS");
  }
  let res: (value: DefinitionsMap) => void, rej;
  allSchemas = new Promise((resolve, reject) => {
    res = resolve;
    rej = reject;
  });

  //TODO: reject on error
  xtracfg.listen(
    (response) => {
      if (DEV) {
        console.log("RESP", response);
      }
      if (response.details && response.details.path && response.details.fileType) {
        if (Object.hasOwn(fileTypes, response.details.path)) {
          if (DEV) {
            console.log("FOUND");
          }
          const fileType: FileType = { type: response.details.fileType, ...response.details };
          fileTypes[response.details.path].resolve(fileType);
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
        if (DEV) {
          console.log("SCHEMAS", schemas);
        }
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

  const schema = schemas[fileType.type];
  schema.groupName = TOP_LEVEL_REF;

  if (DEV) {
    console.log("FT", fileType);
  }

  if (fileType.subProperty) {
    const myRef = await findMyRef(
      schema,
      fileType.subProperty,
      fileType?.discriminatorKey,
      fileType?.discriminatorValue
    );
    const subSchema = {
      ...schema.$defs[myRef[0].ref],
      $defs: schema.$defs,
      groupName: TOP_LEVEL_REF,
    };
    if (DEV) {
      console.log("SUBSCHEMA", subSchema, myRef[0].ref);
    }
    return subSchema;
  }
  if (DEV) {
    console.log("schemaGetSchema", schema);
  }
  return schema;
};

export const getSchemaDefs = async (): Promise<DefinitionsMap | undefined> => {
  const schema = await getSchema();

  if (!schema) {
    return undefined;
  }

  return schema;
};

const getCurrentFileType = async (): Promise<FileType | undefined> => {
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
