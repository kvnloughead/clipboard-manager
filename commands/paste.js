import { parseJSON } from "../utils/helpers.js";
import { MESSAGES } from "../utils/messages.js";

function paste(args) {
  const { file, key, config } = args;

  const data = parseJSON(file);
  const fname = config ? "config" : "clips";
  if (!data[key]) {
    console.error(MESSAGES.MISSING_KEY(key, fname, config));
  } else {
    console.log(data[key]);
  }
}

export default paste;
