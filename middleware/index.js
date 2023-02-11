export const setFilePath = (argv) => {
  argv.file = argv.config ? argv.configPath : argv.clipsPath;
};
