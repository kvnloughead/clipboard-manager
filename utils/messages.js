export const VERBOSE_MESSAGES = {
  DELETED: (key, val, fname) =>
    `\nDeleted key value pair from ${fname}:\n  key: "${String(
      key,
    ).trim()}"\n  value: "${val.trim()}"\n`,
};
