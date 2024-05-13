import fs from "fs";
import { exec } from "node:child_process";
import path from "path";

import { lsImages, promptForConfirmation } from "../utils/helpers.js";
import { messager } from "../utils/logger.js";

async function setClip(args: SetArgs) {
  return new Promise<void>((resolve, reject) => {
    const { file, imagesPath, key, content } = args;
    if (!args.img) {
      const data = JSON.parse(fs.readFileSync(file).toString());
      data[key] = content;
      fs.writeFileSync(file, JSON.stringify(data, null, 2));
      resolve();
    } else {
      const tempPath = path.join(imagesPath, `${key.toString()}_temp.png`);
      const finalPath = path.join(imagesPath, `${key.toString()}.png`);
      exec(
        `xclip -selection clipboard -t image/png -o > ${tempPath}`,
        (error, stdout, stderr) => {
          if (error || stderr) {
            fs.unlinkSync(tempPath); // Delete file if image can't be saved.
            messager.error(`Failed to save image to key ${key}.`);
            reject(
              new Error(
                `Failed to save image to key ${key}.\n${error}\n${stderr}`
              )
            );
          } else {
            fs.renameSync(tempPath, finalPath);
            messager.info(`Image saved successfully`);
            resolve();
          }
        }
      );
    }
  });
}

async function set(args: SetArgs) {
  const { file, key, force, imagesPath } = args;
  const data = args.img
    ? lsImages(imagesPath)
    : JSON.parse(fs.readFileSync(file).toString());
  if (
    force ||
    key === 0 ||
    (!args.img && !data[key]) ||
    (args.img && !data.includes(key))
  ) {
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
