// Centralized error handler. Normalizes Mongoose/JWT errors into
// consistent JSON responses and hides stack traces in production.
const errorHandler = (err, req, res, next) => {
  let error = { ...err, message: err.message };
  error.statusCode = err.statusCode || 500;

  if (err.name === "CastError") {
    error.message = `Resource not found with id: ${err.value}`;
    error.statusCode = 404;
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    error.message = `Duplicate value for field: ${field}`;
    error.statusCode = 409;
  }

  if (err.name === "ValidationError") {
    error.message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    error.statusCode = 400;
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message || "Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export const notFound = (req, res, next) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
};

export default errorHandler;
