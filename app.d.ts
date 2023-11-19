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

  type BasicCommand = "get" | "set" | "remove" | "list" | "open" | "main";
}

export {};
