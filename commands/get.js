import clipboard from 'clipboardy';

import { parseJSON } from '../utils/helpers.js';

function get({ key, clipsPath }) {
  const data = parseJSON(clipsPath);
  if (!data[key]) {
    console.error(
      `\n${key}: no such key. \nRun \`cb list\` to see available keys.\n`,
    );
  } else {
    clipboard.writeSync(data[key]);
  }
}

export default get;
