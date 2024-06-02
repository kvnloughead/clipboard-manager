import fs from "fs";

import { MESSAGES } from "../utils/messages.js";
import { messager } from "../utils/logger.js";
import { promptForConfirmation } from "../utils/helpers.js";
import { MissingKeyError } from "../utils/errors.js";

function deleteClip(data: { [x: string]: any }, args: GetArgs) {
  const { file, key, quiet, verbose } = args;
  const val = data[key];
  delete data[key];
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  if (verbose) {
    messager.info(MESSAGES.DELETED(key, val, file));
  } else if (!quiet) {
    messager.info(`Clip deleted (key: ${key})`);
  }
}

async function remove(args: GetArgs) {
  const { file, key, config, force } = args;
  const data = JSON.parse(fs.readFileSync(file).toString());
  const fname = config ? "config" : "clips";
  if (!data[key]) {
    messager.error(MESSAGES.MISSING_KEY(key, fname, config));
    throw new MissingKeyError();
  }
  if (force) {
    deleteClip(data, args);
  } else {
    await promptForConfirmation(args, {
      userPrompt: `Are you sure you want to delete ${key} in ${file}?`,
      onExit: `Exiting without deleting clip (key: ${key})`,
      onConfirm: () => deleteClip(data, args),
    });
  }
}

export default remove;
