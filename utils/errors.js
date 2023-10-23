import { messager, appLogger } from "./logger.js";

class MissingKeyError extends Error {
  constructor(message = "Key not found", expected = true) {
    super();
    this.message = message;
    this.name = "MissingKeyError";
    this.expected = expected;
  }
}

class NotFoundError extends Error {
  constructor(message = "Resource not found", expected = true) {
    super();
    this.message = message;
    this.name = "NotFoundError";
    this.expected = expected;
  }
}

const handleError = (err, args, message) => {
  appLogger.error(
    `${message}. \nError: ${err.expected ? err.message : err.stack}`,
  );
  if (!err.expected && !args.debug) {
    messager.error(
      `An unexpected error has occurred. For details, check ${args.logsPath}/app.log or run the command again with the --debug flag set.`,
    );
  }
};

export { MissingKeyError, NotFoundError, handleError };
