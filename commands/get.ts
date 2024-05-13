import fs from "fs";
import clipboard from "clipboardy";
import { exec } from "node:child_process";
import path from "path";

import { parseJSON } from "../utils/helpers.js";
import { MissingKeyError, NotFoundError } from "../utils/errors.js";
import { MESSAGES } from "../utils/messages.js";
import { messager } from "../utils/logger.js";

function get(args: GetArgs, pipe: boolean) {
  const { file, imagesPath, key, config } = args;

  if (!args.img) {
    const data = parseJSON(file);
    const fname = config ? "config" : "clips";
    if (!data[key]) {
      messager.error(MESSAGES.MISSING_KEY(key, fname, config));
      throw new MissingKeyError(`Key ${key} is not found in ${fname}`);
    } else {
      // If the cat command is run instead of get, pipe the output to
      // the terminal.
      pipe ? messager.info(data[key]) : clipboard.writeSync(data[key]);
    }
  } else {
    const file = path.join(imagesPath, key.toString() + ".png");
    if (fs.existsSync(file)) {
      // TODO - figure out why oh why this kludge is necessary. I can either
      // get the process to exit, or get it to work. Both at the same time
      // escapes me. So I log this helpful note instead.
      messager.info(`Image loaded to clipboard. Hit Ctrl+C to continue.`);
      exec(
        `cat ${file} | xclip -selection clipboard -t image/png &`,
        (error, stdout, stderr) => {
          if (error || stderr) {
            messager.error({ error });
            messager.error({ stderr });
          }
        },
      );
    } else {
      messager.error("Image not found");
      throw new NotFoundError("Image not found");
    }
  }
}

export default get;
