#!/usr/bin/env node

import _yargs from "yargs";
import path from "path";
import clipboard from "clipboardy";
import { hideBin } from "yargs/helpers";
import * as dotenv from "dotenv";
const yargs = _yargs(hideBin(process.argv));
dotenv.config();

import { setFilePath, debug } from "../middleware/index.js";

import set from "../commands/set.js";
import get from "../commands/get.js";
import paste from "../commands/paste.js";
import remove from "../commands/remove.js";
import list from "../commands/list.js";
import open from "../commands/open.js";
import { openFileInEditor, parseJSON, listImages } from "../utils/helpers.js";
import { options } from "../help/index.js";
import tracker from "../commands/tracker.js";

// OS agnostic home directory
const userDir = process.env.HOME || process.env.USERPROFILE;
const defaultPath = path.join(userDir, ".config", "cb");

const defaults = {
  configPath: defaultPath,
  dataPath: defaultPath,
  defaultsFile: path.join(defaultPath, "defaults.json"),
  configFile: path.join(defaultPath, "settings.json"),
  clipsFile: path.join(defaultPath, "clips.json"),
  historyFile: path.join(defaultPath, "history.json"),
  imagesPath: path.join(defaultPath, "images"),
  logsPath: path.join(defaultPath, "logs"),
};

function parseConfig() {
  // Grab user specified defaults from file.
  const userDefaults = parseJSON(defaults.defaultsFile);

  // If a different config file is specified in the defaults, grab that.
  const configFile = userDefaults.configFile || defaults.configFile;

  // Merge initial config and return. Doesn't include argv.
  return { ...defaults, ...userDefaults, ...parseJSON(configFile) };
}
const config = parseConfig();

yargs
  .env("CB")
  .option("verbose", options.verbose.getDetails("main"))
  .option("img", options.img.getDetails("main"))
  .options({
    e: {
      alias: "editor",
      default: process.env.EDITOR || "nano",
      describe: "Editor to use to open config or data files",
      type: "string",
    },
    c: {
      alias: ["cfg", "config"],
      default: false,
      describe: "Run commands on config file instead of clips.",
      type: "boolean",
    },
    f: {
      alias: "force",
      default: false,
      describe: "Force action",
      type: "boolean",
    },
  })

  .middleware(setFilePath)
  .middleware(debug)

  .command(
    ["set [key]", "s"],
    "assigns clipboard contents to data[key]",
    (yargs) => {
      yargs.positional("key", {
        describe: "key to associate with clipboard contents",
        default: 0,
      });
      yargs.option("img", options.img.getDetails("set"));
    },
    (argv) => {
      set({ ...argv, content: clipboard.readSync() });
    },
  )

  .command(
    ["get [key]", "g"],
    "loads the value cb[key] to the clipboard",
    (yargs) => {
      yargs.positional("key", {
        describe: "key to access from data file",
        default: 0,
      });
      yargs.option("img", options.img.getDetails("get"));
    },
    get,
  )

  .command(
    ["paste [key]", "p"],
    "outputs the value cb[key] to stdout. Images aren't",
    (yargs) => {
      yargs.positional("key", {
        describe: "key to access from data file",
        default: 0,
      });
    },
    paste,
  )

  .command(
    ["remove <key>", "rm <key>", "r <key>", "del <key>", "d <key>"],
    "deletes the key:value pair",
    (yargs) => {
      yargs.positional("key", {
        describe: "key to remove from data",
      });
    },
    remove,
  )

  .command(
    ["config [option]", "cfg"],
    "Sets a configuration option, or opens configuration file if no option is provided",
    (yargs) => {
      yargs.positional("option", {
        describe: "the option to configure",
      });
    },
    ({ configFile, option, ...rest }) => {
      option
        ? set({ ...rest, file: configFile, key: option })
        : openFileInEditor(rest.editor, configFile);
    },
  )
  .option("verbose", {
    type: "boolean",
    describe: options.verbose.getDetails("main"),
  })

  .command(
    ["list [pattern]", "l"],
    "Outputs list of current clips to the terminal. If the verbose flag is set, pattern matching checks values as well as keys.",
    (yargs) => {
      yargs.positional("pattern", {
        describe: "pattern to match",
        default: "",
        type: "string",
      });
      yargs.option("verbose", {
        type: "boolean",
        describe: options.verbose.getDetails("list"),
      });
      yargs.option("img", options.img.getDetails("list"));
      yargs.option("pretty", {
        type: "boolean",
        description: "Makes output look nicer, arguably.",
        alias: "p",
      });
    },
    list,
  )

  .command(
    ["open", "o"],
    "Opens clips file in editor.",
    () => {
      yargs.option("img", options.img.getDetails("open"));
    },
    open,
  )

  .command(
    ["tracker <action>"],
    "Check status, start, stop, or restart tracking clipboard history in background.",
    (yargs) => {
      yargs.positional("action", {
        describe: "Action to take",
        type: "string",
        choices: ["start", "status", "stop", "restart"],
      });
      yargs.option("maxClipHistory", {
        type: "number",
        describe: "Maximum number of clips to store",
        default: 50,
      });
    },
    tracker,
  )

  .demandCommand()
  .showHelpOnFail(true)
  .help("h")
  .alias("h", "help")
  .completion("completion", function (_current, argv, completionFilter, done) {
    if (
      [
        "g",
        "get",
        "p",
        "paste",
        "s",
        "set",
        "rm",
        "remove",
        "d",
        "del",
        "r",
      ].some((val) => argv._.includes(val))
    ) {
      completionFilter((_err, _defaultCompletions) => {
        const keys = argv.img
          ? listImages(argv.imagesPath)
          : Object.keys(parseJSON(argv.clipsFile));
        done(keys);
      });
    } else if (argv._.includes("c") || argv._.includes("cfg")) {
      completionFilter((_err, _defaultCompletions) => {
        const configKeys = Object.keys(parseJSON(argv.configFile));
        done(configKeys);
      });
    } else {
      completionFilter();
    }
  })

  .config(config).argv;
