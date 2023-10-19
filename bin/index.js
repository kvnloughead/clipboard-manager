#!/usr/bin/env node

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
import { parseJSON, listImages } from "../utils/helpers.js";
import { options } from "../help/index.js";
import Tracker from "../commands/tracker.js";

let defaults = {};
for (const [name, option] of Object.entries(options)) {
  defaults[name] = option.getDetails().default;
}

function parseConfig() {
  // Grab user specified defaults from file.
  const userDefaults = parseJSON(defaults.defaultsFile);

  // If a different config file is specified in the defaults, grab that.
  const configFile = userDefaults.configFile || defaults.configFile;

  // Merge initial config and return. Doesn't include argv.
  return { ...defaults, ...userDefaults, ...parseJSON(configFile) };
}
const config = parseConfig();

const tracker = new Tracker(config);

yargs
  .env("CB")
  .option("verbose", options.verbose.getDetails("main"))
  .option("defaultsFile", options.defaultsFile.getDetails("main"))
  .option("configFile", options.configFile.getDetails("main"))
  .option("clipsFile", options.clipsFile.getDetails("main"))
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
      yargs.option("force", options.force.getDetails("set"));
      yargs.option("config", options.config.getDetails("set"));
      yargs.option("imagesPath", options.imagesPath.getDetails("set"));
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
      yargs.option("config", options.config.getDetails("get"));
      yargs.option("imagesPath", options.imagesPath.getDetails("get"));
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
      yargs.option("config", options.config.getDetails("paste"));
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
      yargs.option("force", options.force.getDetails("remove"));
      yargs.option("config", options.config.getDetails("remove"));
    },
    remove,
  )

  .command(
    ["list [pattern]", "l"],
    "Outputs list of current clips to the terminal. If the verbose flag is set, pattern matching checks values as well as keys.",
    (yargs) => {
      yargs.positional("pattern", {
        describe: "pattern to match",
        default: "",
        type: "string",
      });
      yargs.option("verbose", options.verbose.getDetails("list"));
      yargs.option("config", options.config.getDetails("list"));
      yargs.option("img", options.img.getDetails("list"));
      yargs.option("imagesPath", options.imagesPath.getDetails("list"));
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
    (yargs) => {
      yargs.option("img", options.img.getDetails("open"));
      yargs.option("editor", options.editor.getDetails("open"));
      yargs.option("config", options.config.getDetails("open"));
      yargs.option("imagesPath", options.imagesPath.getDetails("open"));
    },
    open,
  )

  .command(
    ["tracker"],
    "Start, stop, restart, or interact with clipboard history tracker.",
    (yargs) => {
      yargs
        .command(
          "start",
          "Starts the clipboard tracking process in the background.",
          () => tracker.start(),
        )
        .command(
          "stop",
          "Stops the clipboard tracking background process.",
          () => tracker.stop(),
        )
        .command(
          "restart",
          "Restarts the clipboard tracking background process.",
          () => tracker.restart(),
        )
        .command(
          "status",
          "Checks status of clipboard tracking background process.",
          () => tracker.status(),
        )
        .command(
          "open",
          "Opens the clipboard history file in your chosen editor.",
          () => tracker.open(),
        )
        .command(
          "list",
          "Lists recent clipboard history and provides an interface for selecting entries.",
          () => tracker.list(),
        );
      yargs.option("maxClipHistory", {
        type: "number",
        describe: "Maximum number of clips to store",
        default: 50,
      });
      yargs.option("historyFile", options.historyFile.getDetails("tracker"));
      yargs.option("logsPath", options.logsPath.getDetails("tracker"));
    },
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
