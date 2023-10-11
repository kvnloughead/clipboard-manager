import clipboardy from "clipboardy";
import fs from "fs";

import loggers from "../utils/logger.js";
const { trackerLogger } = loggers;

const config = JSON.parse(process.argv[2]);
const HISTORY_PATH = config.historyPath;
console.log(HISTORY_PATH);
let clipboardHistory = [];

function trackClipboard() {
  let lastClipboardContent = clipboardy.readSync();

  setInterval(() => {
    console.log("here");
    let currentClipboardContent = clipboardy.readSync();
    if (currentClipboardContent !== lastClipboardContent) {
      clipboardHistory.push(currentClipboardContent);
      trackerLogger.info(
        `New clipboard content detected: ${currentClipboardContent.substring(
          0,
          100,
        )}...`,
      );
      if (clipboardHistory.length > 10) {
        clipboardHistory.shift();
      }

      try {
        fs.writeFileSync(HISTORY_PATH, JSON.stringify(clipboardHistory));
        trackerLogger.info("Updated clipboard history file.");
      } catch (err) {
        trackerLogger.error(
          `Failed to write to history file. Error: ${err.message}`,
        );
      }

      lastClipboardContent = currentClipboardContent;
    }
  }, 1000);
}

trackClipboard();
