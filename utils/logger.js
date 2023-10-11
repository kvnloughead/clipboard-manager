import { createLogger, format, transports } from "winston";
import os from "os";
import path from "path";
import fs from "fs";

// Determine log directory based on platform
let logDirectory;
switch (os.platform()) {
  case "win32":
    logDirectory = path.join(os.homedir(), "AppData", "cb", "logs");
    break;
  case "darwin":
  case "linux":
  default:
    logDirectory = path.join(os.homedir(), ".config", "cb", "logs");
    break;
}

// Ensure the directory exists
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}

const loggerTemplate = (file) =>
  createLogger({
    format: format.combine(
      format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss",
      }),
      format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`,
      ),
    ),
    transports: [
      new transports.Console(),
      new transports.File({ filename: path.join(logDirectory, `${file}.log`) }),
    ],
  });

const loggers = {};
const loggerNames = {
  appLogger: "app",
  trackerLogger: "tracker",
};

for (const [loggerName, fileName] of Object.entries(loggerNames)) {
  loggers[loggerName] = loggerTemplate(fileName);
}

export default loggers;
