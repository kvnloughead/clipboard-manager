export const ERRORS = {
  MISSING_KEY: (key, fname, config) =>
    `\n${key}: no such key in ${fname} file. \nRun \`cb list ${
      config ? "-c" : ""
    }\` to see available keys.\n`,
};
