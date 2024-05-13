import fs from "fs";
import chalk from "chalk";
import prompt, { RevalidatorSchema } from "prompt";
import clipboard from "clipboardy";

import {
  lsImages,
  printTableFromObject,
  truncateString,
  filterObj,
} from "../utils/helpers.js";
import { messager } from "../utils/logger.js";
import get from "../commands/get.js";
import set from "../commands/set.js";
import remove from "../commands/remove.js";
import rename from "../commands/rename.js";
import { appLogger } from "../utils/logger.js";

/**
 * Type of function to be called when entries are selected during
 * interactive listing.
 */
interface onSelectFunction {
  (entry: string[], args: CommonArgs): unknown;
}

/**
 * Maps command initials to objects containing their full name and an
 * function to call when selected.
 */
type onSelectRecord = Record<string, { alias: string; fn: onSelectFunction }>;

/**
 * An object containing functions to be called when selecting an item
 * during interactive listing of text clips.
 */
const onSelectClip: onSelectRecord = {
  g: { alias: "get", fn: (entry) => clipboard.writeSync(entry[1]) },
  s: {
    alias: "set",
    fn: (entry, args) => {
      set({ ...args, key: entry[0], content: clipboard.readSync() });
    },
  },
  c: { alias: "cat", fn: (entry) => messager.info(entry[1]) },
  rm: {
    alias: "remove",
    fn: (entry, args) => remove({ ...args, key: entry[0] }),
  },
  mv: {
    alias: "rename",
    fn: async (entry, args) => {
      prompt.start();
      const { dest } = await prompt.get([
        { name: "dest", description: `rename ${entry[0]} to what?` },
      ]);
      if (typeof dest === "string") {
        rename({ ...args, key: entry[0], dest });
      }
    },
  },
};

/**
 * An object containing functions to be called when selecting an item
 * during interactive listing of image clips.
 */
const onSelectImage: onSelectRecord = {
  g: {
    alias: "get",
    fn: (entry, args) => {
      get({ ...args, key: entry[0] }, false);
    },
  },
  s: {
    alias: "set",
    fn: (entry, args) => {
      set({ ...args, key: entry[0], content: clipboard.readSync() });
    },
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

/**
 * Parses a given entry string to extract an item number and a command.
 * The function expects the entry to start with a number followed by alphabetic
 * characters. If the entry does not match this format, an error is thrown.
 *
 * @param entry - The entry string to be parsed.
 * @returns An object containing the extracted item number and command.
 * @throws Throws an error if the entry is in an invalid format.
 * @example
 * `parseEntry("10g");` // returns { item: "10", command: "g" }
 */
function parseEntry(entry: string) {
  const matchResult = entry.match(/^(\d+)([a-zA-Z]*$)/);
  if (!matchResult) {
    messager.error(`Invalid command '${entry}': exiting.`);
    throw new Error("Invalid command");
  }
  const [_, item, command] = matchResult;
  return { item, command };
}

/**
 * Processes a given entry string to return an item number and a command.
 * It first parses the entry using `parseEntry`. If the parsed command is found
 * in the keys of `onSelect` it returns the parsed item and command. Otherwise,
 * it prompts the user for a command. In either case, it returns the item with
 * the new command.
 *
 * @param entry - The entry string to be processed.
 * @param onSelect - An object mapping commands to their respective actions.
 * @returns A promise that resolves to an object containing 
 the item number and the resolved command, either from the original entry or obtained through a prompt.
 */
async function getCommand(
  entry: string,
  onSelect: onSelectRecord
): Promise<{ item: string; command: string | RevalidatorSchema }> {
  const parsedEntry = parseEntry(entry);
  const { item, command } = parsedEntry;

  if (Object.keys(onSelect).includes(command)) {
    return { item, command };
  } else {
    const result = await promptForCommand(onSelect);
    return { item, command: result.command };
  }
}

/**
 * Prompts the user to enter a command from a set of available commands.
 * This function generates a prompt showing the commands and their aliases from
 * the `onSelect` object. After displaying the prompt, it waits for the user's
 * input.
 *
 * The function ensures that the input matches one of the available commands or a quit command.
 *
 * @param onSelect - An object containing command keys and their respective alias and action.
 * @returns A promise that resolves to the user's input object containing the chosen command.
 * @throws Throws an error if the prompt fails or if the user input is invalid.
 */
async function promptForCommand(onSelect: onSelectRecord) {
  const commands = Object.entries(onSelect)
    .sort()
    .map(([k, v], i) => {
      return `(${k}) ${v.alias}${(i + 1) % 3 === 0 ? "\n" : "\t\t"}`;
    })
    .join("");

  prompt.start();
  return prompt.get([
    {
      name: `command`,
      description: `Enter a command.\n ${commands} (q) quit\n`,
      default: "g",
      message: "Please enter a valid command",
      pattern: /q|quit|g|s|c|mv|rm/i,
      required: true,
    },
  ]);
}

/**
 * Type of function used to list clips or images. Called when the list is
 * initially populated, as well as on (n)ext.
 */
type ListingFunction = (
  data: [string, string][],
  args: CommonArgs,
  start?: number,
  count?: number,
  columns?: number
) => void;

/**
 * Prompts user to choose an entry from a 1-indexed numbered list. The list is * generated by the ListingFunction that called promptUser. Valid commands
 * include
 *
 *  - a number corresponding to the visible items. Ex: `1`, `12`, etc...
 *  - a number followed by a valid command initial. Valid commands vary depending on what is being listed. Ex: `1g`, `5c`, etc...
 *  - `n` will show the next set of items
 *  - `q` will exit
 *
 * If a number is entered without being followed by a command, the user will be
 * prompted to enter a command. @see promptForCommand function for details.
 *
 * @param data - an array of string tuples. The first item is the key of a clip or image. The second is either the value, or an empty string (for images).
 * @param onNext - the function to call to list the next set of entries, if they don't all fit at once.
 * @param onSelect - the function to call when an item has been selected.
 * @param start - index of the first item shown in the list.
 * @param count - number of items shown in the list.
 * @param args - the command line args and settings.
 */
function promptUser(
  data: [string, string][],
  onNext: ListingFunction,
  onSelect: onSelectRecord,
  start = 0,
  count = 10,
  args: CommonArgs
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
        const { item, command } = await getCommand(result.entry, onSelect);
        if (typeof command === "string") {
          const entry = data[Number(item) - 1];
          onSelect[command].fn(entry, args);
          appLogger.info(
            `Executing command '${command}' on key: '${entry[0]}' while listing.`
          );
        }
      }
    }
  );
}

const listVerbosely: ListingFunction = (
  data,
  args,
  start = 0,
  count = 0,
  columns = 80
) => {
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
      i + start + 1
    )})\tKEY:   ${key}\n\tVALUE: ${chalk.blue(val)}\n\n`;
  });
  messager.info(res + `\n`);
  promptUser(data, listVerbosely, onSelectClip, start, count, args);
};
listVerbosely;

const listKeys: ListingFunction = (data, args, start = 0, count = 0) => {
  data.slice(start, start + count).forEach(([k, v], i) => {
    messager.info(`(${chalk.blue.bold(i + start + 1)}) ${k}`);
  });
  promptUser(data, listKeys, onSelectClip, start, count, args);
};

const listImages: ListingFunction = (data, args, start = 0, count = 0) => {
  data.slice(start, start + count).forEach((entry, i) => {
    messager.info(`(${chalk.blue.bold(i + start + 1)}) ${entry[0]}`);
  });
  promptUser(data, listImages, onSelectImage, start, count, args);
};

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
      (item) => [item, ""]
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
    }
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
