import { connect } from "@xtracfg/core";
import { getCurrentFilePath, getWorkspacePath } from "./paths";
import { DEV } from "./constants";
import { extractSingleRefs } from "./refs";
import { TOP_LEVEL_REF } from "./refs";
import { DefinitionsMap, LooseDefinition } from "./defs";

interface FileType {
  type: string;
  subProperty?: string;
  discriminatorKey?: string;
  discriminatorValue?: string;
}

let allSchemas: Promise<DefinitionsMap>;

const fileTypes: {
  [key: string]: {
    result: Promise<FileType>;
    resolve: (fileType: FileType) => void;
    reject: (reason: string) => void;
  };
} = {};

export const initSchemas = (transport: any) => {
  const xtracfg = connect(transport, { debug: true });

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

export const getSchema = async (transport: any): Promise<LooseDefinition | undefined> => {
  const xtracfg = connect(transport, { debug: true });

  const schemas = await allSchemas;
  const fileType = await getCurrentFileType(xtracfg);

  if (!schemas || !fileType) {
    return undefined;
  }

  const schema = schemas[fileType.type];
  schema.groupName = TOP_LEVEL_REF;

  if (DEV) {
    console.log("FT", fileType);
  }

  if (fileType.subProperty) {
    const myRef = extractSingleRefs(
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

const getCurrentFileType = async (xtracfg: any): Promise<FileType | undefined> => {
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
