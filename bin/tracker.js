import clipboardy from "clipboardy";
import fs from "fs";
import { fileURLToPath } from "url";
import { join, dirname } from "path";

const config = JSON.parse(process.argv[2]);
console.log(config);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// const HISTORY_PATH = join(__dirname, "clipboardHistory.json");
const HISTORY_PATH = config.historyPath;

let clipboardHistory = [];

function trackClipboard() {
  let lastClipboardContent = clipboardy.readSync();

  setInterval(() => {
    let currentClipboardContent = clipboardy.readSync();
    if (currentClipboardContent !== lastClipboardContent) {
      clipboardHistory.push(currentClipboardContent);
      if (clipboardHistory.length > 10) {
        clipboardHistory.shift();
      }
      fs.writeFileSync(HISTORY_PATH, JSON.stringify(clipboardHistory));
      lastClipboardContent = currentClipboardContent;
    }
  }, 1000);
}

trackClipboard();
