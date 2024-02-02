import _yargs, { Arguments } from "yargs";
import { appLogger } from "../utils/logger.js";

/**
 * Sets the filepath for use in command handlers. There are the following
 * cases:
 *
 *  - If args.config is true, then args.file will be the configFile path
 *  - If args.img is true, then args.file will be the imagesPath directory
 *  - Otherwise, args.file will be the clipsFile.
 *
 * @param args - an object with CLI args and user settings.
 */
export const setFilePath = (args: Arguments) => {
  if (args.config) {
    args.file = args.configFile;
  } else if (args.img) {
    args.file = args.imagesPath;
  } else {
    args.file = args.clipsFile;
  }
};

export const debug = (args: Arguments) => {
  if (args.debug) {
    appLogger.debug();
  }
};
