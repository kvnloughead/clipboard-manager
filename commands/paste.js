import { parseJSON } from "../utils/helpers.js";
import { ERRORS } from "../utils/errors.js";

function paste(args) {
  const { file, key, config } = args;

  const data = parseJSON(file);
  const fname = config ? "config" : "clips";
  if (!data[key]) {
    console.error(ERRORS.MISSING_KEY(key, fname, config));
  } else {
    console.log(data[key]);
  }
}

export default paste;
