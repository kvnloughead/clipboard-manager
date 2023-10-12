import { spawn } from "child_process";

function track(args) {
  const trackerPath = new URL("../utils/tracker.js", import.meta.url).pathname;

  const child = spawn("node", [trackerPath, JSON.stringify(args)], {
    detached: true,
    setsid: true,
    stdio: ["ignore", "inherit", "inherit"],
  });

  console.log("Started tracking clipboard in background.");
  child.unref();
  process.exit(0);
}

export default track;
