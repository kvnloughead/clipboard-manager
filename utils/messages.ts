export const MESSAGES = {
  DELETED: (key: string | number, val: string, fname: string) =>
    `\nDeleted key value pair from ${fname}:\n  key: "${String(
      key
    ).trim()}"\n  value: "${val.trim()}"\n`,

  MISSING_KEY: (
    key: string | number,
    fname: string,
    config: boolean,
    img: boolean
  ) => {
    const cmd = "`cb list" + (img ? " --img`" : config ? " -c`" : "`");
    return `\n${key}: no such key in ${fname}. \nRun ${cmd} to see available keys.\n`;
  },

  RENAMED: (key: string | number, dest: string) =>
    `\nRenamed clip: ${key} -> ${dest}\n`,
};
