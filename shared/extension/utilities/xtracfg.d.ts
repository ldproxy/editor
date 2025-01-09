declare module "@xtracfg/core" {
  export function xtracfg(command: string): any;
  export function subscribe(callback: (progress: string) => void): void;
}
// Fügen Sie die Deklaration für die connect-Funktion hinzu
export function connect(transport: TransportCreator, options?: TransportOptions): Xtracfg;

// Fügen Sie die Typen hinzu, die in Ihrem Code verwendet werden
export type Xtracfg = {
  send: (request: any) => Promise<void>;
  listen: (
    successHandler: (response: any) => void,
    errorHandler: (error: Error) => void
  ) => Promise<void>;
};

export type TransportCreator = (options: TransportOptions) => TransportConnector;

export type TransportConnector = () => Promise<Transport>;

export type TransportOptions = {
  debug?: boolean;
};

export type Transport = {
  send: (request: any) => Promise<void>;
  listen: (handler: (response: any) => void) => Promise<void>;
};
