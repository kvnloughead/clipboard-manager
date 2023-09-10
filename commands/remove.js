import fs from 'fs';

import { ERRORS } from '../utils/errors.js';
import { VERBOSE_MESSAGES } from '../utils/messages.js';
import { promptForConfirmation } from '../utils/helpers.js';

function deleteClip(data, args) {
  const { file, key, verbose } = args;
  const val = data[key];
  delete data[key];
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  if (verbose) console.log(VERBOSE_MESSAGES.DELETED(key, val, fname));
}

function remove(args) {
  const { file, key, config, verbose, force } = args;
  const data = JSON.parse(fs.readFileSync(file));
  const fname = config ? 'config' : 'clips';
  if (!data[key]) {
    console.error(ERRORS.MISSING_KEY(key, fname, config));
    return;
  }
  if (force) {
    deleteClip(data, args);
  } else {
    promptForConfirmation(args, {
      userPrompt: `Are you sure you want to delete ${key} in ${file}?`,
      onExit: `Exiting without deleting ${key}`,
      onConfirm: () => deleteClip(data, args),
    });
  }
}

export default remove;
