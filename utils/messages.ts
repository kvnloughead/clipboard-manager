export const MESSAGES = {
  DELETED: (key: string | number, val: string, fname: string) =>
    `\nDeleted key value pair from ${fname}:\n  key: "${String(
      key,
    ).trim()}"\n  value: "${val.trim()}"\n`,

  MISSING_KEY: (key: string | number, fname: string, config: boolean) =>
    `\n${key}: no such key in ${fname} file. \nRun \`cb list ${
      config ? "-c" : ""
    }\` to see available keys.\n`,

  RENAMED: (key: string | number, dest: string, fname: string) =>
    `\nRenamed clip: ${key} -> ${dest}\n`,
};
