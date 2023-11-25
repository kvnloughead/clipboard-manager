import { createLogger, format, transports, Logger } from "winston";
import os from "os";
import path from "path";
import fs from "fs";

interface CustomLogger extends Logger {
  logCommand: (
    args: { verbose: boolean; [key: string]: any },
    message?: string,
  ) => void;
  debug: () => Logger;
}

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

const console = new transports.Console({
  format: format.combine(
    format.colorize(),
    format.simple(), // Simplified format for console transport
  ),
  handleExceptions: true,
  handleRejections: true,
});

const file = new transports.File({
  filename: path.join(logDirectory, `app.log`),
  handleExceptions: true,
  handleRejections: true,
});

const appLogger = createLogger({
  format: format.combine(
    format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`),
  ),
  transports: [file],
  exitOnError: false,
}) as CustomLogger;

/**
 * A console logger for user facing logs.
 * Sends error messages to stderr, all others to stdout.
 */
const messager = createLogger({
  format: format.simple(),
  transports: [
    new transports.Console({
      // Simple format to remove the `error: ` preface in error messages.
      format: format.printf(({ level, message }) => `${message}`),
      stderrLevels: ["error"], // Send error messages to stderr.
    }),
  ],
});

/**
 * Logs info about the command that was run, including command line arguments.
 *
 * @param {object} args - default and user specified configuration
 * @param {boolean} args.verbose - whether to log verbosely
 */
appLogger.logCommand = (
  args: LogCommandArgs,
  message = "Executing comand: ",
) => {
  appLogger.info(`${message} \`cb ${process.argv.slice(2).join(" ")}\``);
  if (args.verbose) {
    appLogger.info(
      `Current user configuration (including argv):\n${JSON.stringify(args)}`,
    );
  }
};

appLogger.debug = () => {
  appLogger.add(console);
  return appLogger;
};

export { trackerLogger, appLogger, messager };
