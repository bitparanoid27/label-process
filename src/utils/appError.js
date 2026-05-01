class AppError extends Error {
  constructor(message) {
    super(message);
    this.message = message;
    this.isOperational = true;
  }
}

module.exports = AppError;
