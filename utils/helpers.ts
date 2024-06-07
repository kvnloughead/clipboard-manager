import fs from "fs";
import fsPromises from "promise-fs";
import path from "path";
import { spawn } from "child_process";
import * as readline from "readline";
import prompt from "prompt";
import { messager } from "../utils/logger.js";
import { CancelActionError } from "./errors.js";
import set from "../commands/set.js";

export function openFileInEditor(editor: string, file: string) {
  spawn(editor, [file], { stdio: "inherit" });
}

export function parseJSON(file: string, defaultContent = {}) {
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

function parseYes(str: string) {
  return str && ["yes", "y"].includes(str.toLowerCase());
}

export function filterObj(
  obj: { [s: string]: string },
  onConfirm: (k: string, v: string) => RegExpMatchArray | null
) {
  return Object.fromEntries(
    Object.entries(obj).filter(([k, v]) => onConfirm(k, v))
  );
}

// Prompts user to edit a string value. If the user presses Enter, the
// edit occurs and the prompt exits. The set command is forced, so there will
// be no prompt after the user hits Enter.
//
// A later version may support the final prompting, but it seems like it may
// require switching from the prompt library to native Node utilities, to
// prevent duplication of input/output.
export async function promptForUpdate(
  value: string,
  prompt: string = "Editing value:"
) {
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: `\n${prompt} `,
    });

    rl.write(value);
    rl.prompt();

    rl.on("line", (line: any) => {
      resolve(line);
      rl.close();
    })
      .on("close", () => {
        resolve(value);
      })
      .on("SIGINT", () => {
        console.log("\nExiting");
        rl.close();
        resolve(value);
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}

export async function promptForConfirmation(
  args: CommonArgs,
  {
    userPrompt,
    onExit = "Operation was canceled by the user.",
    onConfirm,
  }: { userPrompt: string; onExit: string; onConfirm: () => unknown }
) {
  return new Promise((resolve, reject) => {
    prompt.start();

    prompt.get(
      [{ name: "confirmation", message: userPrompt }],
      (err, result) => {
        if (err) {
          if (err.message !== "canceled" || args.verbose) {
            messager.error("An error occurred:", err);
          }
        }

        if (typeof result.confirmation !== "string") {
          messager.error("An unexpected error occurred: result is invalid.");
          reject(err);
          return;
        }

        if (result && parseYes(result.confirmation)) {
          onConfirm();
          resolve(null);
        } else {
          messager.error(onExit);
          reject(new CancelActionError(onExit));
        }
      }
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
export function truncateString(
  s: string,
  length: number,
  { ellipsis = true }: { ellipsis?: boolean }
) {
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
export function printTableFromObject(
  obj: { [s: string]: string },
  width: number,
  padding: { key: any; val?: any }
) {
  const columns = Object.fromEntries(
    Object.entries(obj).map(([k, v]) => {
      const key = padding.key ? k.padStart(padding.key, " ") : k;
      let newVal = v.trim();
      newVal = truncateString(newVal, width / 2, {});
      newVal = padding.val ? newVal.padStart(padding.val, " ") : newVal;
      return [key, newVal];
    })
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
export async function createAndWriteToFile(
  file: string,
  contents: string,
  options: { recursive: boolean }
) {
  const { recursive = false } = options;

  try {
    if (recursive) {
      await fsPromises.mkdir(path.dirname(file), { recursive: true });
    }
    await fsPromises.writeFile(file, contents);
  } catch (error) {
    const message = error instanceof Error ? error.message : error;
    messager.error(`Failed to create and write to file ${file}: ${message}`);

    throw error;
  }
}

// Returns an array of files that match pattern in dirpath
export function ls(dirpath: fs.PathLike, pattern: RegExp | string = "") {
  return fs
    .readdirSync(dirpath, { withFileTypes: true })
    .filter((item) => !item.isDirectory())
    .filter((item) => item.name.match(pattern))
    .map((item) => item.name);
}

export function lsImages(dirpath: fs.PathLike, pattern: RegExp | string = "") {
  return ls(dirpath, pattern).map((fname) => path.parse(fname).name);
}
