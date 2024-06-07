import fs from "fs";

import { MESSAGES } from "../utils/messages.js";
import { messager } from "../utils/logger.js";
import { promptForUpdate } from "../utils/helpers.js";
import { MissingKeyError } from "../utils/errors.js";
import set from "./set.js";

async function update(args: GetArgs) {
  const { file, key, config } = args;
  const data = JSON.parse(fs.readFileSync(file).toString());
  const fname = config ? "config" : "clips";
  if (!data[key]) {
    messager.error(MESSAGES.MISSING_KEY(key, fname, config));
    throw new MissingKeyError();
  }

  const updated = await promptForUpdate(
    data[key],
    `Update value for key ${key}:\n\n`
  );
  set({ ...args, content: String(updated), force: true });
}

export default update;
