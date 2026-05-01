class AppError2 extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    // by default if error code is ever provided, it's assumed that the service failed i.e.
    this.message = message;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError2;
