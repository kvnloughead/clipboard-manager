export const setFilePath = (argv) => {
  argv.file = argv.config ? argv.configPath : argv.clipsPath;
  argv.images = argv.config ? argv.imagesPath : argv.imagesPath;
};
