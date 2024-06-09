import fs from "fs";

import { MESSAGES } from "../utils/messages.js";
import { messager } from "../utils/logger.js";
import { promptForUpdate } from "../utils/helpers.js";
import { MissingKeyError } from "../utils/errors.js";
import set from "./set.js";
import remove from "./remove.js";

async function rename(args: RenameArgs) {
  const { file, key, config } = args;
  const data = JSON.parse(fs.readFileSync(file).toString());
  const fname = config ? "config" : "clips";
  if (!data[key]) {
    messager.error(MESSAGES.MISSING_KEY(key, fname, config, false));
    throw new MissingKeyError();
  }
  const value = data[key];

  const dest = await promptForUpdate(String(key), "Rename key:");
  if (typeof dest === "string") {
    set({ ...args, key: String(dest), content: value, force: true });
    remove({ ...args, key, force: true, quiet: true });
  }
  messager.info(`\nRenamed ${key} to ${dest}`);
}

export default rename;
