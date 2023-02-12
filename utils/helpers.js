import fs from 'fs';
import { spawn } from 'child_process';

export function openFileInEditor(editor, file) {
  spawn(editor, [file], { stdio: 'inherit' });
}

export function parseJSON(file) {
  return JSON.parse(fs.readFileSync(file));
}

/**
 *
 * @param {string} s - a string that may or may be too long
 * @param {number} length - length to truncate string to
 * @param {Object} [options] - options object
 * @param {boolean} [options.ellipsis=true] - whether to append an ellipsis
 * @returns the truncated string
 */
export function truncateString(s, length, { ellipsis = true }) {
  if (ellipsis) {
    return s.length < length ? s : s.substring(0, length - 3) + '...';
  }
  return s.length < length ? s : s.substring(0, length);
}

/**
 * Prints an object as a table with console.table. The columns will almost
 * be aligned. Assumes that values are probably bigger than keys.
 *
 * @param {Object} obj - an object to print a table from from
 * @param {*} width - for use in determining the size of the value column
 * @param {{ key: String, val: String }} padding - a hack to justify the columns. Has not proven useful with the value column.
 *
 */
export function printTableFromObject(obj, width, padding) {
  const columns = Object.fromEntries(
    Object.entries(obj).map(([k, v]) => {
      const key = padding.key ? k.padStart(padding.key, ' ') : k;
      let newVal = v.trim();
      newVal = truncateString(newVal, width / 2, {});
      newVal = padding.val ? newVal.padStart(padding.val, ' ') : newVal;
      return [key, newVal];
    }),
  );
  console.table(columns);
}
