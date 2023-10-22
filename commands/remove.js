import fs from "fs";

import { MESSAGES } from "../utils/messages.js";
import { messager } from "../utils/logger.js";
import { promptForConfirmation } from "../utils/helpers.js";

function deleteClip(data, args) {
  const { file, key, verbose } = args;
  const val = data[key];
  delete data[key];
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  if (verbose) messager.info(MESSAGES.DELETED(key, val, fname));
}

function remove(args) {
  const { file, key, config, verbose, force } = args;
  const data = JSON.parse(fs.readFileSync(file));
  const fname = config ? "config" : "clips";
  if (!data[key]) {
    messager.error(MESSAGES.MISSING_KEY(key, fname, config));
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
