import fs from "fs";
import chalk from "chalk";
import prompt from "prompt";
import clipboard from "clipboardy";

import {
  listImages,
  printTableFromObject,
  truncateString,
  filterObj,
} from "../utils/helpers.js";
import { messager } from "../utils/logger.js";

function listVerbosely(data, columns) {
  let res = `\n`;
  Object.entries(data).forEach(([k, v], i) => {
    const key = truncateString(k, (4 * columns) / 5, {
      ellipsis: false,
    });
    let val = v.replace(/\n/g, "\\n").trim();
    val = columns
      ? truncateString(val, (4 * columns) / 5, { ellipsis: false })
      : val;
    res += `(${chalk.blue.bold(i)})\tKEY:   ${key}\n\tVALUE: ${chalk.blue(
      val,
    )}\n\n`;
  });
  messager.info(res + `\n`);
}

function promptUser(data, callback, start = 0, count = 10) {
  prompt.start();
  prompt.get(
    [
      {
        name: `entry`,
        description: `Enter a number to load the clip to clipboard. Type 'q' to quit or 'n' to show the next ${count} clips.`,
        message: `Please enter a number. Type 'q' to quit or 'n' to show the next ${count} clips.`,
        pattern: /[0-9]{1,}|q|quit|n/i,
        required: true,
      },
    ],
    (err, result) => {
      const shouldQuit = ["q", "quit"];
      if (shouldQuit.includes(result.entry.toLowerCase())) {
        process.exit(0);
      } else if (result.entry === "n") {
        callback(data, start + count, count);
      } else {
        clipboard.writeSync(data[result.entry][1]);
      }
    },
  );
}

function listKeys(data, start, count) {
  data.slice(start, start + count).forEach(([k, v], i) => {
    messager.info(`(${chalk.blue.bold(i + start)}) ${k}`);
  });
  promptUser(data, listKeys, start, count);
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
function list(args) {
  const { file, pretty, verbose, imagesPath, pattern } = args;

  // List images
  if (args.img) {
    listImages(imagesPath, pattern).forEach((entry, i) => {
      messager.info(`(${chalk.blue.bold(i)}) ${entry}`);
    });
    return;
  }

  // Pattern matching
  const data = filterObj(JSON.parse(fs.readFileSync(file)), (k, v) => {
    if (args.verbose) {
      return k.match(pattern) || v.match(pattern);
    }
    return k.match(pattern);
  });

  const maxKeyLength = Math.max(...Object.keys(data).map((k) => k.length));

  // When piping, this will be undefined
  const { columns, rows } = process.stdout;

  // List clips
  if (pretty) {
    printTableFromObject(data, columns, { key: maxKeyLength });
  } else if (verbose) {
    listVerbosely(data, columns, maxKeyLength);
  } else {
    const entries = Object.entries(data);
    listKeys(entries, 0, Math.floor(((2 / 3) * rows) / 10) * 10);
  }
}

export default list;
