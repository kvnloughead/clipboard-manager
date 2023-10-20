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

export { MissingKeyError, NotFoundError };
