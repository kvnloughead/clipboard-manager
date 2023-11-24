import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import prompt from "prompt";
import clipboard from "clipboardy";
import chalk from "chalk";

import { messager, trackerLogger } from "../utils/logger.js";
import { parseJSON, openFileInEditor } from "../utils/helpers.js";

class Tracker {
  private logsPath: string;
  private verbose: boolean;
  private debug?: boolean;
  private editor: string;
  private historyFile: string;
  private args: CommonArgs;
  private trackerPidPath: string;
  private trackerPath: string;

  constructor(args: CommonArgs) {
    this.logsPath = args.logsPath;
    this.verbose = args.verbose;
    this.debug = args.debug;
    this.editor = args.editor;
    this.historyFile = args.historyFile;
    this.args = args;

    // Create directory and file if they don't exist.
    this.trackerPidPath = path.join(this.logsPath, "tracker.pid");
    if (!fs.existsSync(this.trackerPidPath)) {
      fs.mkdirSync(this.logsPath, { recursive: true });
      fs.writeFileSync(this.trackerPidPath, "");
    }

    // Path to tracker module.
    this.trackerPath = new URL("../utils/tracker.js", import.meta.url).pathname;
  }

  start() {
    // Prevent duplicate processes from running.
    const pid = parseInt(fs.readFileSync(this.trackerPidPath, "utf-8"));
    if (Number.isInteger(pid)) {
      messager.info(
        `Process with id ${pid} is already running. \nTry running \`cb tracker stop\` or \`cb tracker restart\` instead.`,
      );
      return;
    }

    // Start a new tracker process.
    const child = spawn("node", [this.trackerPath, JSON.stringify(this.args)], {
      detached: true,
      stdio: ["ignore", "inherit", "inherit"],
    });

    // Save process pid to file for easy stopping.
    if (child.pid === undefined) {
      messager.error("Failed to start child process: PID is undefined.");
      return;
    }
    fs.writeFileSync(this.trackerPidPath, child.pid.toString());

    messager.info("Started tracking clipboard in background.");
    child.unref();
    process.exit(0);
  }

  stop() {
    try {
      const pid = parseInt(fs.readFileSync(this.trackerPidPath, "utf-8"));
      process.kill(pid);
      fs.writeFileSync(this.trackerPidPath, "");
      messager.info(`Stopped tracking clipboard.`);
    } catch (err) {
      messager.error(`Can't stop tracking clipboard, no process found.`);
      (this.verbose || this.debug) && messager.error(err);
    }
  }

  restart() {
    const pid = parseInt(fs.readFileSync(this.trackerPidPath, "utf-8"));
    if (Number.isInteger(pid)) {
      this.stop();
    }
    this.start();
  }

  status() {
    const pid = parseInt(fs.readFileSync(this.trackerPidPath, "utf-8"));
    if (Number.isInteger(pid)) {
      messager.info(`Tracker is running with process id ${pid}.`);
    } else {
      messager.info(`No process is running.`);
    }
  }

  open() {
    openFileInEditor(this.editor, this.historyFile);
  }

  list(start = 0) {
    const history = parseJSON(this.historyFile);
    history.slice(start, start + 10).forEach((item: string, i: number) => {
      messager.info(
        `(${chalk.blue.bold(`${i + start + 1}`)})\t ${item.slice(0, 100)}`,
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
        if (err) {
          if (err.message.match("canceled|cancelled")) {
            // handle sigint
            messager.info("\nAction cancelled by user.");
          } else {
            console.error(err); // messager fails to log the stack
          }
          process.exit(1);
        }

        if (typeof result.entry !== "string") {
          messager.info("An unexpected error occurred: result is invalid.");
          return;
        }

        const shouldQuit = ["q", "quit"];
        if (shouldQuit.includes(result.entry.toLowerCase())) {
          messager.info("Action cancelled.");
          process.exit(0);
        } else if (result.entry === "n") {
          this.list(start + 10);
        } else {
          clipboard.writeSync(history[Number(result.entry) - 1]);
        }
      },
    );
  }
}

export default Tracker;
