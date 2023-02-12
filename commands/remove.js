import fs from 'fs';

import { ERRORS } from '../utils/errors.js';
import { VERBOSE_MESSAGES } from '../utils/messages.js';

function remove({ key, file, config, verbose }) {
  const data = JSON.parse(fs.readFileSync(file));
  const fname = config ? 'config' : 'clips';
  if (!data[key]) {
    console.error(ERRORS.MISSING_KEY(key, fname, config));
    return;
  }
  const val = data[key];
  delete data[key];
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  if (verbose) console.log(VERBOSE_MESSAGES.DELETED(key, val, fname));
}

export default remove;
