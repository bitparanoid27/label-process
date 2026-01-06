class AppError extends Error {
  constructor(message) {
    this.message = message;
    this.isOperational = true;
  }
}

module.exports = AppError;
