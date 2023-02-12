import fs from 'fs';

import { printTableFromObject, truncateString } from '../utils/helpers.js';

/**
 * Lists all key/value pairs in clips file. Can be ugly or less ugly.
 * The ugly version supports pipes better.
 * @param {argv} argv - command line arguments
 * @param {path|string} argv.file - path to the file
 * @param {string} argv.pretty - option for kind of pretty printing -p|--pretty
 *
 */
function list({ file, pretty }) {
  const data = JSON.parse(fs.readFileSync(file));
  const maxKeyLength = Math.max(...Object.keys(data).map((k) => k.length));
  const { columns } = process.stdout; // when piping, this will be undefined
  if (pretty) {
    printTableFromObject(data, columns, { key: maxKeyLength });
  } else {
    let res = `\n`;
    Object.entries(data).forEach(([k, v]) => {
      const key = k.padStart(maxKeyLength, ' ');
      let val = v.replace(/\s{2,}/g, '\n').trim();
      // TODO - figure out how to determine terminal width when piping
      val = columns
        ? truncateString(val, columns / 2, { ellipsis: false })
        : val;
      res += `${key}\t${val}\n`;
    });
    console.log(res + `\n`);
  }
}

export default list;
