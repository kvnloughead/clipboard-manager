import { spawn, execSync } from "child_process";
import fs from "fs";
import path from "path";
import prompt from "prompt";
import clipboard from "clipboardy";
import chalk from "chalk";
import os from "os";

import { messager } from "../utils/logger.js";
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
        `Process with id ${pid} is already running. \nTry running \`cb tracker stop\` or \`cb tracker restart\` instead.`
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
    // fs.writeFileSync(this.trackerPidPath, child.pid.toString());

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
        `(${chalk.blue.bold(`${i + start + 1}`)})\t ${item.slice(0, 100)}`
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
      }
    );
  }

  /**
   * @private
   * Returns the path to the provided CLI command. Intended for internal use by
   * the enable method, to embed the correct command in the service file when
   * enabling on startup. This function supports Windows, although the enable
   * method that calls it does not.
   *
   * @param {string} command - a command line command.
   * @returns {string|null} - the path the installed command or null.
   *
   */
  private getCommandPath(command: string = "cb"): string | null {
    try {
      // Use 'which' on Unix-like systems; 'where' on Windows.
      const whichCommand = os.platform() === "win32" ? "where" : "which";
      const commandPath = execSync(`${whichCommand} ${command}`)
        .toString()
        .trim()
        .split("\n")[0]; // Get first result if there are multiple.
      return commandPath;
    } catch (err) {
      messager.error(`Failed to find path for ${command} command.\n${err}`);
      return null;
    }
  }

  /**
   * Spawns a child process to execute the given command with the specified
   * arguments.Logs an error message if the process fails to start or exits
   * with a non-zero code.
   *
   * @param {string} command - The command to execute.
   * @param {string[]} args - An array of arguments to pass to the command.
   *
   * @returns {void} This function does not return a value.
   */
  private runCommand(command: string, args: string[]): void {
    const process = spawn(command, args);

    process.on("error", (err) => {
      messager.error(`Failed to run ${command} ${args.join(" ")}`, err);
    });

    process.on("exit", (code) => {
      if (code !== 0) {
        messager.error(`${command} ${args.join(" ")} exited with code ${code}`);
      }
    });
  }

  /**
   * The enable subcommand enables the cb clipboard tracker service to be
   * automatically started on system restart. The service file will be stored
   * in .config/systemd/user and does not require root privileges. Systemctl is * used to manage the process.
   */
  enable() {
    const cbPath = this.getCommandPath();
    if (typeof cbPath !== "string") {
      messager.error("Can't enable tracker: path to 'cb' command not found.");
      return;
    }
    const nodePath = path.dirname(cbPath);

    const serviceContent = `
    [Unit]
    Description=CB Clipboard Tracker Service

    [Service]
    Type=forking

    # Include the node executable used to run 'cb' in the service's path. 
    Environment="PATH=${nodePath}"
    ExecStart=/bin/bash -c '${cbPath} tracker start'
    # PIDFile=${this.args.logsPath}/tracker.pid
    
    # Restart if there's a crash
    Restart=always
    RestartSec=5
    StartLimitBurst=5
    StartLimitIntervalSec=500

    StandardOutput=journal
    StandardError=journal

    [Install]
    # Start service when normal system operation is achieved.
    WantedBy=default.target
    `;

    const servicePath = path.join(
      os.homedir(),
      `.config/systemd/user/cb-clipboard-tracker.service`
    );

    try {
      fs.mkdirSync(path.dirname(servicePath), { recursive: true });
      fs.writeFileSync(servicePath, serviceContent);

      messager.info(`Service file successfully created: ${servicePath}`);

      // Enable and start the user-level service.
      this.runCommand("systemctl", [
        "--user",
        "enable",
        "cb-clipboard-tracker.service",
      ]);
      this.runCommand("systemctl", ["--user", "daemon-reload"]);
      this.runCommand("systemctl", [
        "--user",
        "start",
        "cb-clipboard-tracker.service",
      ]);

      messager.info("Clipboard tracker enabled to start on boot.");
    } catch (err) {
      messager.error("Failed to create or enable service:", err);
    }
  }
}

export default Tracker;
