import { parseJSON } from "../utils/helpers.js";
import { MESSAGES } from "../utils/messages.js";
import { messager } from "../utils/logger.js";

function paste(args) {
  const { file, key, config } = args;

  const data = parseJSON(file);
  const fname = config ? "config" : "clips";
  if (!data[key]) {
    messager.error(MESSAGES.MISSING_KEY(key, fname, config));
  } else {
    messager.info(data[key]);
  }
}

export default paste;
