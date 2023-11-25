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

  type Option = keyof Options;

  interface OptionDetails {
    describe: string;
    type: string;
    alias?: string | string[];
    type: string;
    default?: any;
  }

  type BasicCommand =
    | "get"
    | "set"
    | "remove"
    | "list"
    | "open"
    | "rename"
    | "main"
    | "tracker";

  type CommandDescriptions = {
    [K in BasicCommand]?: string;
  } & { default: string };

  interface LogCommandArgs {
    [key: string]: any;
    verbose: boolean;
  }

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
    debug?: boolean;
    imagesPath: string;
    "images-path": string;
    historyFile: string;
    logsPath: string;
    configPath: string;
    file: string;
  }

  interface GetArgs extends CommonArgs {
    key: number | string;
  }

  interface SetArgs extends GetArgs {
    content: string;
  }

  interface RenameArgs extends GetArgs {
    dest: string;
  }

  interface ListArgs extends CommonArgs {
    pretty?: boolean;
    pattern?: string | RegExp;
  }
}

export {};
