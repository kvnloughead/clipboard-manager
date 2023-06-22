import fs from 'fs';

import {
  listImages,
  printTableFromObject,
  truncateString,
  filterObj,
} from '../utils/helpers.js';

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
  if (args.img) {
    console.log(listImages(imagesPath, pattern).join('\n'));
    return;
  }
  const data = filterObj(JSON.parse(fs.readFileSync(file)), (k, v) => {
    return k.match(pattern);
  });
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
