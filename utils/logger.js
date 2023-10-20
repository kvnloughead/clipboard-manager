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

const trackerLogger = createLogger({
  format: format.combine(
    format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`),
  ),
  transports: [
    new transports.File({ filename: path.join(logDirectory, `tracker.log`) }),
  ],
});

const appLogger = createLogger({
  format: format.combine(
    format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`),
  ),
  transports: [
    new transports.File({
      filename: path.join(logDirectory, `app.log`),
      handleExceptions: true,
      handleRejections: true,
    }),
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple(), // Simplified format for console transport
      ),
      handleExceptions: true,
      handleRejections: true,
    }),
  ],
  exitOnError: false,
});

appLogger.logCommand = () => {
  appLogger.info(
    `Executing command: \`cb ${process.argv.slice(2).join(" ")}\``,
  );
};

export { trackerLogger, appLogger };
