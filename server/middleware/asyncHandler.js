// Wraps async route handlers so rejected promises are forwarded to
// Express's error handler instead of requiring try/catch everywhere.
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
