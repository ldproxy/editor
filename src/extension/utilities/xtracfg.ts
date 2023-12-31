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
  error: string;
  status: string;
  message: string;
};

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
      .catch((error) => {
        console.error("Could not send command to xtracfg", error);
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
      .catch((error) => {
        console.error("Could not listen to xtracfg", error);
      });
};

const parseError = (response: Response): Error | undefined => {
  const error = response.error || "";
  const status = response.results && response.results.length > 0 ? response.results[0].status : "";
  const message =
    response.results && response.results.length > 0 ? response.results[0].message : "";

  if (error.length === 0 && status !== "ERROR") {
    return undefined;
  }

  return { error, status, message };
};

const mutex = new Mutex();

const socket = (): Socket => {
  let _socket: WebSocket;

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
        console.log("CONNECTING to websocket", `ws://${window.location.host}/proxy/8081/`);
        _socket = new WebSocket(`ws://${window.location.host}/proxy/8081/`);
      }
    }

    release();

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
};
