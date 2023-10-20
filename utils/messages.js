export const MESSAGES = {
  DELETED: (key, val, fname) =>
    `\nDeleted key value pair from ${fname}:\n  key: "${String(
      key,
    ).trim()}"\n  value: "${val.trim()}"\n`,
  MISSING_KEY: (key, fname, config) =>
    `\n${key}: no such key in ${fname} file. \nRun \`cb list ${
      config ? "-c" : ""
    }\` to see available keys.\n`,
};
