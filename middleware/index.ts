import _yargs, { Arguments } from "yargs";
import { appLogger } from "../utils/logger.js";

export const setFilePath = (argv: Arguments) => {
  // If argv.config, then commands should be run on the config file instead of
  // clips file. Not fully implemented.
  argv.file = argv.config ? argv.configFile : argv.clipsFile;
};

export const debug = (argv: Arguments) => {
  if (argv.debug) {
    appLogger.debug();
  }
};
