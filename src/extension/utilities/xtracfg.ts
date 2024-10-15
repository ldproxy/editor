import xtracfgLib from "xtracfg-lib";

import * as vscode from "vscode";
import { Mutex } from "async-mutex";
import { DEV } from "./constants";

export type Request = {
  command: string;
  subcommand?: string;
  source?: string;
  verbose?: boolean;
  debug?: boolean;
  [key: string]: any;
};

export type Response = {
  error?: string;
  details?: { [key: string]: any };
  results?: Array<{ status: string; message: string }>;
};

export type Error = {
  error?: string;
  status?: string;
  message?: string;
  notification?: string;
  fields?: {
    [key: string]: string;
  };
};

export const newXtracfg = () => {
  return {
    send: executeXtracfgLib(),
    listen: simulateListen(),
  };
};

const executeXtracfgLib = () => {
  return (request: Request) => {
    const cmd = JSON.stringify(request);

    if (DEV) {
      console.log("executing XtracfgLib with command", cmd);
    }

    try {
      const result = xtracfgLib.xtracfgLib(cmd);
      console.log("Result:", result);
    } catch (error) {
      console.error("Could not execute XtracfgLib command");
    }
  };
};

const simulateListen = () => {
  return (successHandler: (response: Response) => void, errorHandler: (error: Error) => void) => {
    const simulatedResponse = {
      results: [
        {
          status: "WARNING",
          message: "Blub",
        },
        {
          status: "INFO",
          message: "  - $.api[10].maxLevel: is unknown for type TilesConfiguration",
        },
        {
          status: "INFO",
          message:
            "  - $.collections.building.api[3].transformations.function.asLink: is unknown for type PropertyTransformation",
        },
      ],
      details: {
        path: "entities/instances/services/cologne_lod2.yml",
      },
    };

    if (simulatedResponse) {
      successHandler(simulatedResponse);
    } else {
      errorHandler({ error: "Could not simulate listen" });
    }
  };
};
/*
type Socket = () => Promise<WebSocket>;


export const newXtracfg = () => {
  const ensureOpen = socket();

  return {
    send: send(ensureOpen),
    listen: listen(ensureOpen),
  };
};

const send = (ensureOpen: Socket) => {
  return (request: Request) =>
    ensureOpen()
      .then((socket) => {
        const cmd = JSON.stringify(request);

        if (DEV) {
          console.log("sending to xtracfg", cmd);
        }

        socket.send(cmd);
      })
      .catch((error: Error) => {
        console.error("Could not send command to xtracfg", error.message || error);
      });
};

const listen = (ensureOpen: Socket) => {
  return (successHandler: (response: Response) => void, errorHandler: (error: Error) => void) =>
    ensureOpen()
      .then((socket) => {
        socket.addEventListener("message", (event) => {
          const response = JSON.parse(event.data);

          if (DEV) {
            console.log("received from xtracfg", response);
          }

          const error = parseError(response);

          if (!error) {
            successHandler(response);
          } else {
            errorHandler(error);
          }
        });
      })
      .catch((error: Error) => {
        console.error("Could not listen to xtracfg", error.message || error);
      });
};

*/

const parseError = (response: Response): Error | undefined => {
  const error = response.error || "";
  const status = response.results && response.results.length > 0 ? response.results[0].status : "";
  const message =
    response.results && response.results.length > 0 ? response.results[0].message : "";

  if (error.length === 0 && status !== "ERROR") {
    return undefined;
  }

  if (error === "No 'command' given: {}") {
    return { notification: "Empty Fields" };
  }

  if (message.includes("host") && !message.includes("refused")) {
    return { fields: { host: message.split(",")[0] } };
  } else if (error.includes("Host") && !message.includes("refused")) {
    return { fields: { host: error } };
  } else if (message.includes("database")) {
    return { fields: { database: message } };
  } else if (message.includes("user name")) {
    return { fields: { user: message } };
  } else if (message.includes("password")) {
    return { fields: { user: message, password: message } };
  } else if (error.includes("No id given")) {
    return { fields: { id: error } };
  } else if (error.includes("Id has to")) {
    return { fields: { id: error } };
  } else if (error.includes("with id")) {
    return { fields: { id: error } };
  } else if (message.includes("url")) {
    return { fields: { url: message } };
  }

  if (
    (!message.includes("host") &&
      !message.includes("url") &&
      !message.includes("database") &&
      !message.includes("user") &&
      !message.includes("password")) ||
    message.includes("refused")
  ) {
    return { notification: error.length > 0 ? error : message };
  }

  return { error, status, message };
};
/*
const mutex = new Mutex();
let _socket: WebSocket;

const socket = (): Socket => {
  return async (): Promise<WebSocket> => {
    const release = await mutex.acquire();

    if (_socket && _socket.readyState === _socket.OPEN) {
      release();

      return Promise.resolve(_socket);
    }

    if (
      !_socket ||
      _socket.readyState === _socket.CLOSED ||
      _socket.readyState === _socket.CLOSING
    ) {
      if (DEV) {
        console.log("CONNECTING to websocket", "ws://localhost:8081/sock");
        _socket = new WebSocket("ws://localhost:8081/sock");
      } else {
        //console.log("CONNECTING to websocket", `ws://${self.location.host}/proxy/8081/`);
        const protocol = self.location.protocol === "https:" ? "wss" : "ws";
        _socket = new WebSocket(`${protocol}://${self.location.host}/proxy/8081/`);
      }
    }

    return new Promise((resolve, reject) => {
      _socket.addEventListener("open", () => {
        resolve(_socket);
        release();
      });
      _socket.addEventListener("error", () => {
        reject("websocket error");
        release();
      });
      _socket.addEventListener("close", (event) => {
        if (DEV && event.wasClean) {
          console.log("websocket was closed", event.code, event.reason);
        } else if (!event.wasClean) {
          console.error("websocket was closed unexpectedly", event.code, event.reason);
        }
      });
    });
  };
};
*/
