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

/**
 * Creates and returns a logger instance based on provided data.
 *
 * @param {Object} data - Configuration for creating the logger.
 * @param {string} data.name - Name used to determine the log filename.
 * @param {Object} data.options - Additional logger options.
 * @param {boolean} [data.options.console=false] - Whether to also log to the console.
 *
 * @returns {Object} Logger instance configured based on the provided data.
 */
const loggerTemplate = (data) => {
  const { name, options } = data;
  const logTransports = [
    new transports.File({ filename: path.join(logDirectory, `${name}.log`) }),
  ];
  options.console && logTransports.push(new transports.Console());
  return createLogger({
    format: format.combine(
      format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss",
      }),
      format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`,
      ),
    ),
    transports: logTransports,
  });
};

const loggers = {};
const loggerConfig = {
  appLogger: { name: "app", options: { console: true } },
  trackerLogger: { name: "tracker", options: { console: false } },
};

for (const [loggerName, data] of Object.entries(loggerConfig)) {
  loggers[loggerName] = loggerTemplate(data);
}

export default loggers;
