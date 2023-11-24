#!/usr/bin/env node

import _yargs, {
  FallbackCompletionFunction,
  CompletionCallback,
  Arguments,
} from "yargs";
import clipboard from "clipboardy";
import { hideBin } from "yargs/helpers";
import * as dotenv from "dotenv";
const yargs = _yargs(hideBin(process.argv));
dotenv.config();

import { setFilePath, debug } from "../middleware/index.js";

import set from "../commands/set.js";
import get from "../commands/get.js";
import remove from "../commands/remove.js";
import list from "../commands/list.js";
import open from "../commands/open.js";
import rename from "../commands/rename.js";
import { parseJSON, lsImages } from "../utils/helpers.js";
import { options } from "../help/index.js";
import Tracker from "../commands/tracker.js";
import { appLogger } from "../utils/logger.js";
import ConfigParser from "../utils/config.js";
import { handleError } from "../utils/errors.js";

// Gather default settings
const defaults: Options = Object.fromEntries(
  Object.entries(options).map(([name, option]) => {
    return [name, option.getDetails("default").default];
  }),
) as unknown as Options;

// Merge user config with defaults
const configParser = new ConfigParser(defaults);
const config = configParser.parseConfig();

// Log user config periodically, and whenever it changes
const configHasChanged = configParser.configHasChanged(config);
if (configHasChanged) {
  appLogger.info(configHasChanged.message);
} else {
  const intervalHasElapsed = configParser.intervalHasElapsed(config);
  if (intervalHasElapsed) appLogger.info(intervalHasElapsed.message);
}

/**
 * A completion function for command line argument processing with yargs.
 * Pass this funtion to yargs.completions.
 *
 * @param _current - the current input string at the command line
 * @param argv - the parsed command line arguments
 * @param completionFilter - a function that filters the available completions
 * @param done - a function that can be called with the final completion options
 */
const completionFunction: FallbackCompletionFunction = (
  _current: string,
  argv: CommonArgs,
  completionFilter: (onCompleted?: CompletionCallback) => any,
  done: (completions: string[]) => any,
) => {
  if (
    ["g", "get", "s", "set", "rm", "remove", "d", "del", "r"].some((val) =>
      argv._.includes(val),
    )
  ) {
    completionFilter((_err, _defaultCompletions) => {
      const keys = argv.img
        ? lsImages(argv.imagesPath)
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
};

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
    async (argv) => {
      appLogger.logCommand(argv as LogCommandArgs);
      const args = { ...argv, content: clipboard.readSync() };
      try {
        await set(args as unknown as SetArgs);
        appLogger.info(
          `${argv.img ? "Image saved" : "Data set"} successfully for key: ${
            argv.key
          }`,
        );
      } catch (err) {
        handleError(err, argv, `Failed to set clip (key: ${argv.key}).`);
      }
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
    (argv) => {
      appLogger.logCommand(argv as LogCommandArgs);
      try {
        get(argv as unknown as GetArgs);
        appLogger.info(`Data retrieved successfully for key: ${argv.key}`);
      } catch (err) {
        handleError(
          err,
          argv,
          `Failed to retrieve data for (key: ${argv.key}).`,
        );
      }
    },
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
    async (argv) => {
      appLogger.logCommand(argv as LogCommandArgs);
      try {
        await remove(argv as unknown as GetArgs);
        appLogger.info(`Clip deleted (key: ${argv.key}).`);
      } catch (err) {
        handleError(err, argv, `Failed to delete clip (key: ${argv.key}).`);
      }
    },
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
    (argv) => {
      appLogger.logCommand(argv as LogCommandArgs);
      try {
        list(argv as unknown as ListArgs);
        appLogger.info(`${argv.img ? "Images" : "Clips"} listed.`);
      } catch (err) {
        handleError(
          err,
          argv,
          `Failed to list ${argv.img ? "images" : "clips"}`,
        );
      }
    },
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
    (argv) => {
      appLogger.logCommand(argv as LogCommandArgs);
      try {
        open(argv as unknown as CommonArgs);
        appLogger.info(
          `Opened ${argv.img ? "images directory" : "clips file"} in ${
            argv.editor
          }`,
        );
      } catch (err) {
        handleError(
          err,
          argv,
          `Failed to open ${argv.img ? "images directory" : "clips file"} in ${
            argv.editor
          }`,
        );
      }
    },
  )

  .command(
    ["rename <key> <dest>", "mv <key> <dest>"],
    "Renames clip or image file.",
    (yargs) => {
      yargs.positional("key", {
        describe: "the key of the clip or image file to be renamed",
        type: "string",
      });
      yargs.positional("dest", {
        describe: "new name for clip or image file",
        type: "string",
      });
      yargs.option("img", options.img.getDetails("rename"));
      yargs.option("force", options.force.getDetails("rename"));
      yargs.option("config", options.config.getDetails("rename"));
      yargs.option("imagesPath", options.imagesPath.getDetails("rename"));
    },
    (argv) => {
      appLogger.logCommand(argv as LogCommandArgs);
      try {
        rename(argv as unknown as RenameArgs);
        appLogger.info(`Renamed ${argv.img ? "image" : "clip"}: SRC -> DEST`);
      } catch (err) {
        handleError(
          err,
          argv,
          `Failed to rename ${argv.img ? "image" : "clip"}: SRC -> DEST`,
        );
      }
    },
  )

  .command(
    ["tracker"],
    "Start, stop, restart, or interact with clipboard history tracker.",
    (yargs) => {
      const tracker = new Tracker(yargs.argv as unknown as CommonArgs);
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
        default: 100,
      });
      yargs.option("historyFile", options.historyFile.getDetails("tracker"));
      yargs.option("logsPath", options.logsPath.getDetails("tracker"));
    },
  )

  .demandCommand()
  .showHelpOnFail(true)
  .help("h")
  .alias("h", "help")
  .completion("completion", completionFunction)

  .config(config).argv;
