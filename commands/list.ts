import fs from "fs";
import chalk from "chalk";
import prompt from "prompt";
import clipboard from "clipboardy";

import {
  lsImages,
  printTableFromObject,
  truncateString,
  filterObj,
} from "../utils/helpers.js";
import { messager } from "../utils/logger.js";
import get from "../commands/get.js";
import remove from "../commands/remove.js";
import rename from "../commands/rename.js";

const onSelectClip = {
  g: (entry: string[]) => clipboard.writeSync(entry[1]),
  c: (entry: string[]) => messager.info(entry[1]),
  rm: (entry: string[], args: CommonArgs) => remove({ ...args, key: entry[0] }),
  mv: async (entry: string[], args: CommonArgs) => {
    prompt.start();
    const { dest } = await prompt.get([
      { name: "dest", description: `rename ${entry[0]} to what?` },
    ]);
    if (typeof dest === "string") {
      rename({ ...args, key: entry[0], dest });
    }
  },
};

const onSelectImage = {
  g: (entry: string[], args: CommonArgs): void => {
    get({ ...args, key: entry[0] });
  },
};

/**
 * Calculate number of entries to display, based on available space.
 *
 * @param {number} rows - number of rows displayed in stdout.
 * @param {number} min - minimum number of entries to display.
 * @param {number} multiplier - factor to multiply with rows. Usually this should be between 0 and 1.
 * @returns an integer value indicated the number of entries to display.
 */
function numberEntries(rows: number, multiplier: number = 1, min: number = 0) {
  return Math.max(Math.floor(multiplier * rows), min);
}

type ListTextFunction = (
  data: [string, string][],
  args: CommonArgs,
  start?: number,
  count?: number,
  columns?: number,
) => void;

type ListImageFunction = (
  data: [string, string][],
  args: CommonArgs,
  start?: number,
  count?: number,
) => void;

async function promptForCommand() {
  prompt.start();
  return prompt.get([
    {
      name: `command`,
      description: `Enter a command.\n (g) get\t (c) cat\t (mv) rename\t (rm) delete\t (q) quit`,
      default: "g",
      message: "Please enter a valid command",
      pattern: /q|quit|g|c|mv|rm/i,
      required: true,
    },
  ]);
}

function promptUser(
  data: [string, string][],
  onNext: ListTextFunction | ListImageFunction,
  onSelect: {
    [commandName: string]: (entry: string[], args: CommonArgs) => unknown;
  },
  start = 0,
  count = 10,
  args: CommonArgs,
) {
  if (data.length === 0) {
    messager.error("No matching entries found.");
    return;
  }

  const showing = Math.min(Math.min(count, data.length), data.length - start);
  const moreMatches = data.length > start + count;

  let description = `Showing ${showing} of ${data.length} matches. Enter a number to select a clip. Type 'q' to quit`;
  description += moreMatches ? " or 'n' to show more matches." : ".";

  prompt.start();
  prompt.get(
    [
      {
        name: `entry`,
        description,
        message: `Please enter a number. Type 'q' to quit or 'n' to show the next ${count} clips.`,
        pattern: /[0-9]{1,}|q|quit|n/i,
        required: true,
      },
    ],
    async (err, result) => {
      if (err) {
        if (err.message.match("canceled|cancelled")) {
          // handle sigint
          messager.info("\nAction cancelled by user.");
        } else {
          console.error(err); // messager fails to log the stack
        }
        process.exit(1);
      }

      const shouldQuit = ["q", "quit"];
      if (typeof result.entry !== "string") {
        messager.error("Unexpected result.entry type received. Exiting.");
        process.exit(1);
      }
      if (shouldQuit.includes(result.entry.toLowerCase())) {
        process.exit(0);
      } else if (result.entry === "n") {
        onNext(data, args, start + count, count);
      } else {
        const { command } = await promptForCommand();
        if (typeof command === "string") {
          onSelect[command](data[Number(result.entry) - 1], args);
        }
      }
    },
  );
}

function listVerbosely(
  data: [string, string][],
  args: CommonArgs,
  start = 0,
  count = 0,
  columns = 80,
) {
  let res = `\n`;
  data.slice(start, start + count).forEach(([k, v], i) => {
    const key = truncateString(k, (3 * columns) / 4, {
      ellipsis: false,
    });
    let val = v.replace(/\n/g, "\\n").trim();
    val = columns
      ? truncateString(val, (3 * columns) / 4, { ellipsis: false })
      : val;
    res += `(${chalk.blue.bold(
      i + start + 1,
    )})\tKEY:   ${key}\n\tVALUE: ${chalk.blue(val)}\n\n`;
  });
  messager.info(res + `\n`);
  promptUser(data, listVerbosely, onSelectClip, start, count, args);
}
listVerbosely;

function listKeys(
  data: [string, string][],
  args: CommonArgs,
  start = 0,
  count = 0,
) {
  data.slice(start, start + count).forEach(([k, v], i) => {
    messager.info(`(${chalk.blue.bold(i + start + 1)}) ${k}`);
  });
  promptUser(data, listKeys, onSelectClip, start, count, args);
}

function listImages(
  data: [string, string][],
  args: CommonArgs,
  start = 0,
  count = 0,
) {
  data.slice(start, start + count).forEach((entry, i) => {
    messager.info(`(${chalk.blue.bold(i + start + 1)}) ${entry[0]}`);
  });
  promptUser(data, listImages, onSelectImage, start, count, args);
}

/**
 * Lists all key/value pairs in clips file. Can be ugly or less ugly.
 * The ugly version supports pipes better.
 * @param {args} args - command line arguments
 * @param {path|string} args.file - path to the file
 * @param {path|string} args.imagesPath - path to images directory
 * @param {boolean} args.pretty - whether to kind of print prettily -p|--pretty
 * @param {boolean} args.verbose - whether to print verbosely -v|--verbose
 * @param {boolean} args.img - whether content is an image --img
 * @param {string} args.pattern - pattern to match (defaults to empty string)
 *
 */
function list(args: ListArgs) {
  const { file, pretty, verbose, imagesPath, pattern = "" } = args;

  const { columns, rows } = process.stdout;

  // List images
  if (args.img) {
    const entries: [string, string][] = lsImages(imagesPath, pattern).map(
      (item) => [item, ""],
    );
    listImages(entries, args, 0, numberEntries(rows, 0.85, 10));
    return;
  }

  // Pattern matching
  const data = filterObj(
    JSON.parse(fs.readFileSync(file).toString()),
    (k: string, v: string) => {
      if (args.verbose) {
        return k.match(pattern) || v.match(pattern);
      }
      return k.match(pattern);
    },
  );

  const maxKeyLength = Math.max(...Object.keys(data).map((k) => k.length));
  const entries = Object.entries(data) as [string, string][];

  // List clips
  if (pretty) {
    printTableFromObject(data, columns, { key: maxKeyLength });
  } else if (verbose) {
    listVerbosely(entries, args, 0, numberEntries(rows, 0.25, 5), columns);
  } else {
    listKeys(entries, args, 0, numberEntries(rows, 0.85, 10));
  }
}

export default list;
