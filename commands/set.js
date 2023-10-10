import fs from "fs";
import { exec } from "node:child_process";
import path from "path";

import { listImages, promptForConfirmation } from "../utils/helpers.js";

function setClip(args) {
  const { file, imagesPath, key, content } = args;
  exec(
    `xclip -selection clipboard -t image/png -o > ${path.join(
      imagesPath,
      key.toString() + ".png",
    )}`,
    (error, stdout, stderr) => {
      if (!args.img && (error || stderr)) {
        const data = JSON.parse(fs.readFileSync(file));
        data[key] = content;
        fs.writeFileSync(file, JSON.stringify(data, null, 2));
      } else if (error || stderr) {
        console.error("Failed to save image");
      } else {
        console.log(`Image saved successfully`);
      }
    },
  );
}

function set(args) {
  const { file, key, force, imagesPath } = args;
  const data = args.img
    ? listImages(imagesPath)
    : JSON.parse(fs.readFileSync(file));
  if (force || (!args.img && !data[key]) || (args.img && !data.includes(key))) {
    setClip(args);
  } else {
    promptForConfirmation(args, {
      userPrompt: `Are you sure you want to overwrite ${key} in ${file}?`,
      onExit: `Exiting without setting ${key}`,
      onConfirm: () => setClip(args),
    });
  }
}

export default set;
