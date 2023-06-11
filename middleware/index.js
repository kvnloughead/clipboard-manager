export const setFilePath = (argv) => {
  argv.file = argv.config ? argv.configPath : argv.clipsPath;
  argv.imagesPath = argv.config ? argv.imagesPath : argv.imagesPath;
};
