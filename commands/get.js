import clipboard from 'clipboardy';

import { parseJSON } from '../utils/helpers.js';
import { ERRORS } from '../utils/errors.js';

function get({ key, file, config }) {
  const data = parseJSON(file);
  const fname = config ? 'config' : 'clips';
  if (!data[key]) {
    console.error(ERRORS.MISSING_KEY(key, fname, config));
  } else {
    clipboard.writeSync(data[key]);
  }
}

export default get;
