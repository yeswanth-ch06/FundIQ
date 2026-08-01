import AppError from "../utils/AppError.js";

// Usage: router.post('/schemes', protect, authorize('government', 'admin'), handler)
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Not authorized", 401));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(`Role '${req.user.role}' is not permitted to perform this action`, 403)
      );
    }
    next();
  };
};

export default authorize;
