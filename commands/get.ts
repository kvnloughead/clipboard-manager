import fs from "fs";
import clipboard from "clipboardy";
import { exec } from "node:child_process";
import path from "path";
import { platform } from 'os';

import { parseJSON } from "../utils/helpers.js";
import { MissingKeyError, NotFoundError } from "../utils/errors.js";
import { MESSAGES } from "../utils/messages.js";
import { messager } from "../utils/logger.js";

function get(args: GetArgs, pipe: boolean) {
  const { file, imagesPath, key, config } = args;

  if (!args.img) {
    const data = parseJSON(file);
    const fname = config ? "config file" : "clips file";
    if (!data[key]) {
      messager.error(MESSAGES.MISSING_KEY(key, fname, config, false));
      throw new MissingKeyError(`Key ${key} is not found in ${fname}`);
    } else {
      // If the cat command is run instead of get, pipe the output to
      // the terminal.
      pipe ? messager.info(data[key]) : clipboard.writeSync(data[key]);
    }
  } else {
    const file = path.join(imagesPath, key.toString() + ".png");
    if (fs.existsSync(file)) {
      const command = platform() === 'darwin'
        ? `osascript -e 'set the clipboard to (read (POSIX file "${file}") as «class PNGf»)'`
        : `cat ${file} | xclip -selection clipboard -t image/png &`;

      messager.info(`Loading image to clipboard...`);
      exec(command, (error, stdout, stderr) => {
        if (error || stderr) {
          messager.error(`Failed to load image to clipboard: ${error?.message || stderr}`);
          throw new Error(`Failed to load image: ${error?.message || stderr}`);
        } else {
          messager.info(`Image loaded successfully`);
        }
      });
    } else {
      const fname = "images directory";
      messager.error(MESSAGES.MISSING_KEY(key, fname, false, true));
      throw new MissingKeyError(`Key ${key} is not found in ${fname}`);
    }
  }
}

export default get;
