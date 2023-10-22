import fs from "fs";
import { exec } from "node:child_process";
import path from "path";

import { listImages, promptForConfirmation } from "../utils/helpers.js";
import { messager } from "../utils/logger.js";

async function setClip(args) {
  return new Promise((resolve, reject) => {
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
          resolve();
        } else if (error || stderr) {
          messager.error(`Failed to save image to key ${key}.`);
          reject(
            new Error(
              `Failed to save image to key ${key}.\n${error}\n${stderr}`,
            ),
          );
        } else {
          messager.info(`Image saved successfully`);
          resolve();
        }
      },
    );
  });
}

async function set(args) {
  const { file, key, force, imagesPath } = args;
  const data = args.img
    ? listImages(imagesPath)
    : JSON.parse(fs.readFileSync(file));
  if (force || (!args.img && !data[key]) || (args.img && !data.includes(key))) {
    await setClip(args);
  } else {
    await promptForConfirmation(args, {
      userPrompt: `Are you sure you want to overwrite ${key} in ${file}?`,
      onExit: `Exiting without setting ${key}`,
      onConfirm: async () => await setClip(args),
    });
  }
}

export default set;
