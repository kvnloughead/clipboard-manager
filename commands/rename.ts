import fs from "fs";

import { MESSAGES } from "../utils/messages.js";
import { messager } from "../utils/logger.js";
import { promptForConfirmation } from "../utils/helpers.js";
import { MissingKeyError } from "../utils/errors.js";
import set from "./set.js";

function renameClip(data: { [x: string]: any }, args: RenameArgs) {
  const { file, key, dest } = args;
  const val = data[key];
  delete data[key];
  fs.writeFileSync(file, JSON.stringify(data, null, 2));

  set({ ...args, key: dest, content: val });
  messager.info(MESSAGES.RENAMED(key, dest, file));
}

async function rename(args: RenameArgs) {
  const { file, key, dest, config, force } = args;
  const data = JSON.parse(fs.readFileSync(file).toString());
  const fname = config ? "config" : "clips";
  if (!data[key]) {
    messager.error(MESSAGES.MISSING_KEY(key, fname, config));
    throw new MissingKeyError();
  }
  if (force) {
    renameClip(data, args);
  } else {
    await promptForConfirmation(args, {
      userPrompt: `Rename ${key} to ${dest} [in ${fname}]?`,
      onExit: `Exiting without renaming clip (key: ${key})`,
      onConfirm: () => renameClip(data, args),
    });
  }
}

export default rename;
