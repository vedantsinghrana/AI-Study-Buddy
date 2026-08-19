export class AppError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function notFoundHandler(req, res, next) {
  next(new AppError(404, "Route not found"));
}

export function errorHandler(err, req, res, next) {
  if (err.name === "CastError") {
    return res.status(400).json({ error: "Invalid identifier" });
  }

  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? "Internal server error" : err.message;

  if (statusCode === 500) {
    console.error(err);
  }

  res.status(statusCode).json({ error: message });
}
