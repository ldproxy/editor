declare module "xtracfg-lib" {
  export function xtracfgLib(command: string): any;
  export function subscribe(callback: (progress: string) => void): void;
}
