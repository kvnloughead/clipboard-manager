import fs from "fs";
import chalk from "chalk";

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
  const { columns } = process.stdout; // when piping, this will be undefined

  // List clips
  if (pretty) {
    printTableFromObject(data, columns, { key: maxKeyLength });
  } else if (verbose) {
    listVerbosely(data, columns, maxKeyLength);
  } else {
    Object.entries(data).forEach(([k, v], i) => {
      messager.info(`(${chalk.blue.bold(i)}) ${k}`);
    });
  }
}

export default list;
