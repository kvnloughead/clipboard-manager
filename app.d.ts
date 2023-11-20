declare global {
  interface BasicMap {
    [key: string]: string | undefined;
  }

  interface Options {
    verbose?: boolean;
    img?: boolean;
    editor?: boolean;
    force?: boolean;
    config?: boolean;
    defaultsFile: string;
    configFile: string;
    clipsFile: string;
    imagesPath: string;
    historyFile: string;
    logsPath: string;
  }

  interface LogCommandArgs {
    [key: string]: any;
    verbose: boolean;
  }

  type BasicCommand =
    | "get"
    | "set"
    | "remove"
    | "list"
    | "open"
    | "main"
    | "tracker";

  interface CommonArgs {
    _: string[];
    verbose: boolean;
    v: boolean;
    img: boolean;
    i: boolean;
    editor: string;
    force: boolean;
    config: boolean;
    cfg: boolean;
    c: boolean;
    defaultsFile: string;
    "defaults-file": string;
    configFile: string;
    "config-file": string;
    clipsFile: string;
    "clips-file": string;
    imagesPath: string;
    "images-path": string;
    historyFile: string;
    logsPath: string;
    configPath: string;
  }

  interface GetArgs extends CommonArgs {
    key: number | string;
    $0: string;
    file: string;
  }
}

export {};
