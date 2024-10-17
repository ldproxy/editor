declare module "xtracfg" {
  export function xtracfg(command: string): any;
  export function subscribe(callback: (progress: string) => void): void;
}
