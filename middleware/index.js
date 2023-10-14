export const setFilePath = (argv) => {
  // If argv.config, then commands should be run on the config file instead of
  // clips file. Not fully implemented.
  argv.file = argv.config ? argv.configFile : argv.clipsFile;
};

export const debug = (argv) => {
  if (argv.verbose) {
    console.log(argv);
  }
};
