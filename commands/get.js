import fs from "fs";
import clipboard from "clipboardy";
import { exec } from "node:child_process";
import path from "path";

import { parseJSON } from "../utils/helpers.js";
import { ERRORS } from "../utils/errors.js";

function get(args) {
  const { file, imagesPath, key, config } = args;
  const isTTY = Boolean(process.stdout.isTTY);

  if (!args.img) {
    const data = parseJSON(file);
    const fname = config ? "config" : "clips";
    if (!data[key]) {
      console.error(ERRORS.MISSING_KEY(key, fname, config));
    } else {
      isTTY ? clipboard.writeSync(data[key]) : console.log(data[key]);
    }
  } else {
    const file = path.join(imagesPath, key.toString() + ".png");
    if (fs.existsSync(file)) {
      // TODO - figure out why oh why this kludge is necessary. I can either
      // get the process to exit, or get it to work. Both at the same time
      // escapes me. So I log this helpful note instead.
      console.log(`Image loaded to clipboard. Hit Ctrl+C to continue.`);
      exec(
        `cat ${file} | xclip -selection clipboard -t image/png &`,
        (error, stdout, stderr) => {
          if (error || stderr) {
            console.error({ error });
            console.error({ stderr });
          }
        },
      );
    } else {
      console.log("Image not found");
    }
  }
}

export default get;
