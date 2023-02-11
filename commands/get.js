import clipboard from 'clipboardy';

import { parseJSON } from '../utils/helpers.js';

function get({ key, file, config }) {
  const data = parseJSON(file);
  const fname = config ? 'config' : 'clips';
  if (!data[key]) {
    console.error(
      `\n${key}: no such key in ${fname} file. \nRun \`cb list ${
        config ? '-c' : ''
      }\` to see available keys.\n`,
    );
  } else {
    clipboard.writeSync(data[key]);
  }
}

export default get;
