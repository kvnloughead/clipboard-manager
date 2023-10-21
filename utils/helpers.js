import fs from "fs";
import fsPromises from "fs.promises";
import path from "path";
import { spawn } from "child_process";
import prompt from "prompt";

export function openFileInEditor(editor, file) {
  spawn(editor, [file], { stdio: "inherit" });
}

export function parseJSON(file, defaultContent = {}) {
  // Check if the file path is valid
  if (typeof file !== "string" || path.isAbsolute(file) === false) {
    throw new Error("Invalid file path provided");
  }

  // If the file doesn't exist, create it with an empty object
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify(defaultContent));
  } else {
    // If the file exists but is empty, add an empty object to it
    const fileContents = fs.readFileSync(file, "utf8");
    if (!fileContents.trim()) {
      fs.writeFileSync(file, JSON.stringify({}));
    }
  }

  // Return the parsed JSON
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function parseYes(str) {
  return str && ["yes", "y"].includes(str.toLowerCase());
}

export function filterObj(obj, onConfirm) {
  return Object.fromEntries(
    Object.entries(obj).filter(([k, v]) => onConfirm(k, v)),
  );
}

export async function promptForConfirmation(
  args,
  { userPrompt, onExit = "Operation was canceled by the user.", onConfirm },
) {
  return new Promise((resolve, reject) => {
    prompt.start();

    prompt.get(
      [{ name: "confirmation", message: userPrompt }],
      (err, result) => {
        if (err) {
          if (err.message !== "canceled" || args.verbose) {
            console.error("An error occurred:", err);
          }
          // ensure sigint logs newline before message
          if (!result) console.log();
          console.log(onExit);
          reject(err);
          return;
        }

        if (result && parseYes(result.confirmation)) {
          onConfirm();
          resolve();
        } else {
          console.error(onExit);
          reject(new Error(onExit));
        }
      },
    );
  });
}

/**
 *
 * @param {string} s - a string that may or may be too long
 * @param {number} length - length to truncate string to
 * @param {Object} [options] - options object
 * @param {boolean} [options.ellipsis=true] - whether to append an ellipsis
 * @returns the truncated string
 */
export function truncateString(s, length, { ellipsis = true }) {
  if (ellipsis) {
    return s.length < length ? s : s.substring(0, length - 3) + "...";
  }
  return s.length < length ? s : s.substring(0, length);
}

/**
 * Prints an object as a table with console.table. The columns will almost
 * be aligned. Assumes that values are probably bigger than keys.
 *
 * @param {Object} obj - an object to print a table from from
 * @param {*} width - for use in determining the size of the value column
 * @param {{ key: String, val: String }} padding - a hack to justify the columns. Has not proven useful with the value column.
 *
 */
export function printTableFromObject(obj, width, padding) {
  const columns = Object.fromEntries(
    Object.entries(obj).map(([k, v]) => {
      const key = padding.key ? k.padStart(padding.key, " ") : k;
      let newVal = v.trim();
      newVal = truncateString(newVal, width / 2, {});
      newVal = padding.val ? newVal.padStart(padding.val, " ") : newVal;
      return [key, newVal];
    }),
  );
  console.table(columns);
}

/**
 * Writes to a file, creating it if necessary.
 *
 * @param {string | path} file
 * @param {string} contents
 * @param {object} options
 * @param {boolean} options.recursive - if true, create necessary directories
 */
export async function createAndWriteToFile(file, contents, options = {}) {
  const { recursive = false } = options;

  try {
    if (recursive) {
      await fsPromises.mkdir(path.dirname(file), { recursive: true });
    }
    await fsPromises.writeFile(file, contents);
  } catch (error) {
    console.error(
      `Failed to create and write to file ${file}: ${error.message}`,
    );
    throw error;
  }
}

// Returns an array of files that match pattern in dirpath
export function ls(dirpath, pattern = "") {
  return fs
    .readdirSync(dirpath, { withFileTypes: true })
    .filter((item) => !item.isDirectory())
    .filter((item) => item.name.match(pattern))
    .map((item) => item.name);
}

export function listImages(dirpath, pattern = "") {
  return ls(dirpath, pattern).map((fname) => path.parse(fname).name);
}
