declare module "express" {
  import * as core from "express-serve-static-core";
  function express(): core.Express;
  namespace express {
    export function json(options?: any): any;
  }
  export default express;
  export type Request = any;
  export type Response = any;
  export type NextFunction = any;
}

declare module "cors" {
  export default function cors(options?: any): any;
}

declare module "dotenv" {
  export function config(options?: any): any;
}

declare module "ws" {
  export class WebSocketServer {
    constructor(options?: any);
    on(event: string, cb: (...args: any[]) => void): void;
    close(): void;
  }
  export class WebSocket {
    static OPEN: number;
    readyState: number;
    send(data: any): void;
    on(event: string, cb: (...args: any[]) => void): void;
    terminate(): void;
    ping(): void;
    close(): void;
  }
}

declare module "systeminformation" {
  const si: {
    currentLoad(): Promise<{ currentLoad: number }>;
  };
  export default si;
}

declare module "chokidar" {
  export interface FSWatcher {
    on(event: string, cb: (...args: any[]) => void): this;
    close(): Promise<void>;
  }
  export function watch(paths: string | string[], options?: any): FSWatcher;
  const chokidar: {
    watch(paths: string | string[], options?: any): FSWatcher;
  };
  export default chokidar;
}

declare module "node-pty" {
  export interface IPty {
    onData(cb: (data: string) => void): void;
    onExit(cb: (e: { exitCode: number; signal?: number }) => void): void;
    write(data: string): void;
    resize(cols: number, rows: number): void;
    kill(signal?: string): void;
  }
  export function spawn(file: string, args: string[] | string, opt: any): IPty;
}

