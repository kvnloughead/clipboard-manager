#!/usr/bin/env node
import { spawn } from "child_process";
import path from "path";
import fs from "fs";

import _yargs from "yargs";
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

function parseConfig() {
  const defaults = parseJSON(
    `/home/${process.env.USER}/.config/cb/defaults.json`,
  );
  const configPath = defaults.configPath;
  return { ...defaults, ...parseJSON(configPath) };
}
const config = parseConfig();

yargs
  .env("CB")
  .option("verbose", options.verbose.details("main"))
  .option("img", options.img.details("main"))
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
  .requiresArg("e")
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
      yargs.option("img", options.img.details("set"));
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
      yargs.option("img", options.img.details("get"));
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
    ({ configPath, option, ...rest }) => {
      option
        ? set({ ...rest, file: configPath, key: option })
        : openFileInEditor(rest.editor, configPath);
    },
  )
  .option("verbose", {
    type: "boolean",
    describe: options.verbose.details("main"),
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
        describe: options.verbose.details("list"),
      });
      yargs.option("img", {
        type: "boolean",
        describe: options.img.details("list"),
      });
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
      yargs.option("img", options.img.details("open"));
    },
    open,
  )

  .command(["track"], "Start tracking clipboard history in background.", () => {
    const trackerPath = new URL("./tracker.js", import.meta.url).pathname;

    const logPath = path.join(path.dirname(trackerPath), "tracker.log");
    console.log(config);
    const child = spawn("node", [trackerPath, JSON.stringify(config)], {
      detached: true,
      stdio: ["ignore", fs.openSync(logPath, "a"), fs.openSync(logPath, "a")],
    });

    child.unref();
    console.log("Started tracking clipboard in background.");
  })

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
          : Object.keys(parseJSON(argv.clipsPath));
        done(keys);
      });
    } else if (argv._.includes("c") || argv._.includes("cfg")) {
      completionFilter((_err, _defaultCompletions) => {
        const configKeys = Object.keys(parseJSON(argv.configPath));
        done(configKeys);
      });
    } else {
      completionFilter();
    }
  })

  .config(config).argv;
