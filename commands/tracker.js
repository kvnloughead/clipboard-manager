import { spawn } from "child_process";
import fs from "fs";
import path from "path";

function tracker(args) {
  const trackerPidPath = path.join(args.logsPath, "tracker.pid");

  function start() {
    const trackerPath = new URL("../utils/tracker.js", import.meta.url)
      .pathname;

    // prevent duplicate processes from running
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

    // save process pid to file for easy stopping
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

  if (args.action === "start") {
    start();
  } else if (args.action === "stop") {
    stop();
  } else if (args.action === "restart") {
    restart();
  }
}

export default tracker;
