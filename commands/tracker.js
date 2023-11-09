import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import prompt from "prompt";
import clipboard from "clipboardy";
import chalk from "chalk";

import { messager } from "../utils/logger.js";
import { parseJSON, openFileInEditor } from "../utils/helpers.js";

class Tracker {
  constructor(args) {
    this._logsPath = args.logsPath;
    this._verbose = args.verbose;
    this._debug = args.debug;
    this._editor = args.editor;
    this._historyFile = args.historyFile;
    this._args = args;

    // Create directory and file if they don't exist.
    this._trackerPidPath = path.join(this._logsPath, "tracker.pid");
    if (!fs.existsSync(this._trackerPidPath)) {
      fs.mkdirSync(this._logsPath, { recursive: true });
      fs.writeFileSync(this._trackerPidPath, "");
    }

    // Path to tracker module.
    this._trackerPath = new URL(
      "../utils/tracker.js",
      import.meta.url,
    ).pathname;
  }

  start() {
    // Prevent duplicate processes from running.
    const pid = parseInt(fs.readFileSync(this._trackerPidPath, "utf-8"));
    if (Number.isInteger(pid)) {
      messager.info(
        `Process with id ${pid} is already running. \nTry running \`cb tracker stop\` or \`cb tracker restart\` instead.`,
      );
      return;
    }

    // Start a new tracker process.
    const child = spawn(
      "node",
      [this._trackerPath, JSON.stringify(this._args)],
      {
        detached: true,
        setsid: true,
        stdio: ["ignore", "inherit", "inherit"],
      },
    );

    // Save process pid to file for easy stopping.
    fs.writeFileSync(this._trackerPidPath, child.pid.toString());

    messager.info("Started tracking clipboard in background.");
    child.unref();
    process.exit(0);
  }

  stop() {
    try {
      const pid = parseInt(fs.readFileSync(this._trackerPidPath, "utf-8"));
      process.kill(pid);
      fs.writeFileSync(this._trackerPidPath, "");
      messager.info(`Stopped tracking clipboard.`);
    } catch (err) {
      messager.error(`Can't stop tracking clipboard, no process found.`);
      (this._verbose || this._debug) && messager.error(err);
    }
  }

  restart() {
    const pid = parseInt(fs.readFileSync(this._trackerPidPath, "utf-8"));
    if (Number.isInteger(pid)) {
      this.stop();
    }
    this.start();
  }

  status() {
    const pid = parseInt(fs.readFileSync(this._trackerPidPath, "utf-8"));
    if (Number.isInteger(pid)) {
      messager.info(`Tracker is running with process id ${pid}.`);
    } else {
      messager.info(`No process is running.`);
    }
  }

  open() {
    openFileInEditor(this._editor, this._historyFile);
  }

  list(start = 0) {
    const history = parseJSON(this._historyFile);
    history.slice(start, start + 10).forEach((item, i) => {
      messager.info(
        `(${chalk.blue.bold(`${i + start}`)})\t ${item.slice(0, 100)}`,
      );
    });
    prompt.start();
    prompt.get(
      [
        {
          name: `entry`,
          description: `Enter a number to load the clip to clipboard. Type 'q' to quit or 'n' to show the next ten clips.`,
          message: `Please enter a number between 0 and ${history.length}, Type 'q' to quit or 'n' to show the next ten clips.`,
          pattern: /[0-9]{1,}|q|quit|n/i,
          required: true,
        },
      ],
      (err, result) => {
        const shouldQuit = ["q", "quit"];
        if (shouldQuit.includes(result.entry.toLowerCase())) {
          process.exit(0);
        } else if (result.entry === "n") {
          this.list(start + 10);
        } else {
          clipboard.writeSync(history[result.entry]);
        }
      },
    );
  }
}

export default Tracker;
