import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import prompt from "prompt";
import clipboard from "clipboardy";

import { parseJSON, openFileInEditor } from "../utils/helpers.js";

function tracker(args) {
  // Create directory and file if they don't exist.
  const trackerPidPath = path.join(args.logsPath, "tracker.pid");
  if (!fs.existsSync(trackerPidPath)) {
    fs.mkdirSync(args.logsPath, { recursive: true });
    fs.writeFileSync(trackerPidPath, "");
  }

  function start() {
    const trackerPath = new URL("../utils/tracker.js", import.meta.url)
      .pathname;

    // Prevent duplicate processes from running.
    const pid = parseInt(fs.readFileSync(trackerPidPath, "utf-8"));
    if (Number.isInteger(pid)) {
      console.log(
        `Process with id ${pid} is already running. \nTry running \`cb tracker stop\` or \`cb tracker restart\` instead.`,
      );
      return;
    }

    const child = spawn("node", [trackerPath, JSON.stringify(args)], {
      detached: true,
      setsid: true,
      stdio: ["ignore", "inherit", "inherit"],
    });

    // Save process pid to file for easy stopping.
    fs.writeFileSync(trackerPidPath, child.pid.toString());

    console.log("Started tracking clipboard in background.");
    child.unref();
    process.exit(0);
  }

  function stop() {
    try {
      const pid = parseInt(fs.readFileSync(trackerPidPath, "utf-8"));
      process.kill(pid);
      fs.writeFileSync(trackerPidPath, "");
      console.log("Stopped tracking clipboard.");
    } catch (err) {
      console.error(`Can't stop tracking clipboard, no process found.`);
      (args.verbose || args.debug) && console.error(err);
    }
  }

  function restart() {
    const pid = parseInt(fs.readFileSync(trackerPidPath, "utf-8"));
    if (Number.isInteger(pid)) {
      stop();
    }
    start();
  }

  function status() {
    const pid = parseInt(fs.readFileSync(trackerPidPath, "utf-8"));
    if (Number.isInteger(pid)) {
      console.log(`Tracker is running with process id ${pid}.`);
    } else {
      console.log(`No process is running.`);
    }
  }

  function open() {
    openFileInEditor(args.editor, args.historyFile);
  }

  function list(start = 0) {
    const history = parseJSON(args.historyFile);
    history.slice(start, start + 10).forEach((item, i) => {
      console.log(i + start, item);
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
          list(start + 10);
        } else {
          clipboard.writeSync(history[result.entry]);
        }
      },
    );
  }

  const actions = { start, stop, restart, status, open, list };
  actions[args.action]();
}

export default tracker;
