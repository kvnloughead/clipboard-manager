import fs from 'fs';

import {
  listImages,
  printTableFromObject,
  truncateString,
} from '../utils/helpers.js';

/**
 * Lists all key/value pairs in clips file. Can be ugly or less ugly.
 * The ugly version supports pipes better.
 * @param {argv} argv - command line arguments
 * @param {path|string} argv.file - path to the file
 * @param {string} argv.pretty - option for kind of pretty printing -p|--pretty
 *
 */
function list(args) {
  const { file, pretty, verbose, imagesPath } = args;
  if (args.img) {
    console.log(listImages(imagesPath).join('\n'));
    return;
  }
  const data = JSON.parse(fs.readFileSync(file));
  const maxKeyLength = Math.max(...Object.keys(data).map((k) => k.length));
  const { columns } = process.stdout; // when piping, this will be undefined
  if (pretty) {
    printTableFromObject(data, columns, { key: maxKeyLength });
  } else if (verbose) {
    let res = `\n`;
    Object.entries(data).forEach(([k, v]) => {
      const key = k.padStart(maxKeyLength, ' ');
      let val = v.replace(/\n/g, '\\n').trim();
      // TODO - figure out how to determine terminal width when piping
      val = columns
        ? truncateString(val, columns / 2, { ellipsis: false })
        : val;
      res += `${key}\t${val}\n`;
    });
    console.log(res + `\n`);
  } else {
    Object.entries(data).forEach(([k, v]) => {
      console.log(k);
    });
  }
}

export default list;
