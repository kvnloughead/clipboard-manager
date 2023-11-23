import { Arguments } from "yargs";
import { messager, appLogger } from "./logger.js";

class CustomError extends Error {
  public expected: boolean;
  constructor(message?: string, expected = true) {
    super(message);
    this.name = "CustomError";
    Object.setPrototypeOf(this, new.target.prototype);
    this.expected = expected;
  }
}

class MissingKeyError extends CustomError {
  public expected: boolean;
  constructor(message = "Key not found", expected = true) {
    super();
    this.message = message;
    this.name = "MissingKeyError";
    this.expected = expected;
  }
}

class NotFoundError extends CustomError {
  public expected: boolean;
  constructor(message = "Resource not found", expected = true) {
    super();
    this.message = message;
    this.name = "NotFoundError";
    this.expected = expected;
  }
}

/**
 * Error to throw when canceling an action.
 */
class CancelActionError extends CustomError {
  public expected: boolean;
  constructor(message = "Action canceled", expected = true) {
    super();
    this.message = message;
    this.name = "CancelActionError";
    this.expected = expected;
  }
}

const handleError = (
  err: CustomError | unknown,
  args: Arguments,
  message: string,
) => {
  if (err instanceof CustomError) {
    appLogger.error(
      `${message}. \nError: ${err.expected ? err.message : err.stack}`,
    );
  } else if (!args.debug) {
    messager.error(
      `An unexpected error has occurred. For details, check ${args.logsPath}/app.log or run the command again with the --debug flag set.`,
    );
  } else if (err instanceof Error && args.debug) {
    appLogger.error(
      `${message}. \nError: ${err.stack ? err.message : err.stack}`,
    );
  } else if (args.debug) {
    appLogger.error(`${message}. ${err}`);
  }
};

export {
  MissingKeyError,
  NotFoundError,
  CancelActionError,
  CustomError,
  handleError,
};
