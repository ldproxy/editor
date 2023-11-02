export type SchemaTables = {
  [schema: string]: string[];
};

export type BasicData = {
  command?: string;
  subcommand?: string;
  source?: string;
  id?: string;
  verbose?: boolean;
  types?: SchemaTables;
  featureProviderType?: string;
};

//TODO: move all websocket communication to this file
