import { DEV } from "./constants";

export type SchemaTables = {
  [schema: string]: string[];
};

export type BasicData = {
  command?: string;
  subcommand?: string;
  source?: string;
  id?: string;
  types?: SchemaTables;
  featureProviderType?: string;
  verbose?: boolean;
  debug?: boolean;
};

export type Response = {
  error?: string;
  details?: {
    types?: SchemaTables;
    new_files?: string[];
    currentTable?: string;
    currentCount?: number;
    targetCount?: number;
    progress?: SchemaTables;
  };
  results?: Array<{ status: string; message: string }>;
};

export type Error = {
  notification?: string;
  fields?: {
    [key: string]: string;
  };
};

export const xtracfg = {
  send: sendCmd,
  listen: receiveCmd,
};

function sendCmd(data: BasicData) {
  ensureOpen()
    .then((socket) => {
      const cmd = JSON.stringify(data);

      if (DEV) {
        console.log("sending to xtracfg", cmd);
      }

      socket.send(cmd);
    })
    .catch((error) => {
      console.error("Could not send command to xtracfg", error);
    });
}

function receiveCmd(
  successHandler: (result: Response) => void,
  errorHandler: (error: Error) => void
) {
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
    .catch((error) => {
      console.error("Could not listen to xtracfg", error);
    });
}

const parseError = (response: Response): Error | undefined => {
  const error = response.error || "";
  const status = response.results && response.results.length > 0 ? response.results[0].status : "";
  const message =
    response.results && response.results.length > 0 ? response.results[0].message : "";

  if (error.length == 0 && status !== "ERROR") {
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

  if (DEV) {
    console.error("Unhandled error", error, status, message);
  }

  return undefined;
};

let _socket: WebSocket;

const ensureOpen = (): Promise<WebSocket> => {
  if (_socket && _socket.OPEN) {
    return Promise.resolve(_socket);
  }

  if (!_socket || _socket.CLOSED || _socket.CLOSING) {
    if (DEV) {
      _socket = new WebSocket("ws://localhost:8081/sock");
    } else {
      const protocol = window.location.protocol === "https:" ? "wss" : "ws";
      _socket = new WebSocket(`${protocol}://${window.location.host}/proxy/8081/`);
    }
  }

  return new Promise((resolve, reject) => {
    _socket.addEventListener("open", () => {
      resolve(_socket);
    });
    _socket.addEventListener("error", (error) => {
      reject(error);
    });
    if (DEV) {
      _socket.addEventListener("close", (event) => {
        if (event.wasClean) {
          console.log("websocket was closed", event.code, event.reason);
        } else {
          console.error("websocket was closed unexpectedly", event);
        }
      });
    }
  });
};
