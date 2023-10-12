import { spawn } from "child_process";
import path from "path";
import fs from "fs";

function track(args) {
  const trackerPath = new URL("../utils/tracker.js", import.meta.url).pathname;

  const stdoutLog = path.join(path.dirname(trackerPath), "tracker_stdout.log");
  const stderrLog = path.join(path.dirname(trackerPath), "tracker_stderr.log");

  const child = spawn("node", [trackerPath, JSON.stringify(args)], {
    detached: true,
    stdio: ["ignore", fs.openSync(stdoutLog, "a"), fs.openSync(stderrLog, "a")],
  });

  child.unref();
  console.log("Started tracking clipboard in background.");
}

export default track;
