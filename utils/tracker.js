import clipboardy from "clipboardy";
import fs from "fs";

import { trackerLogger } from "./logger.js";
import { parseJSON } from "./helpers.js";

const config = JSON.parse(process.argv[2]);
const HISTORY_PATH = config.historyFile;
let clipboardHistory = parseJSON(config.historyFile) || [];

process.on("uncaughtException", (err) => {
  trackerLogger.error("Uncaught Exception:", err);
});

process.on("uncaughtRejection", (reason, promise) => {
  trackerLogger.error("Uncaught Rejection at:", promise, reason);
});

function trackClipboard() {
  let lastClipboardContent = clipboardy.readSync();

  setInterval(() => {
    let currentClipboardContent = clipboardy.readSync();
    if (currentClipboardContent !== lastClipboardContent) {
      clipboardHistory.push(currentClipboardContent);
      trackerLogger.info(
        `Clipboard updated: ${currentClipboardContent.substring(0, 100)}...`,
      );

      if (clipboardHistory.length > (config.maxClipHistory || 50)) {
        clipboardHistory.shift();
      }
      try {
        fs.writeFileSync(
          HISTORY_PATH,
          JSON.stringify(clipboardHistory, undefined, 2),
        );
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
