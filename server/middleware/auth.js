import jwt from "jsonwebtoken";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";

// Verifies the access token on the Authorization header and attaches
// the authenticated user document to req.user.
export const protect = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      return next(new AppError("Not authorized, no token provided", 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new AppError("The user belonging to this token no longer exists", 401));
    }

    if (!user.isActive) {
      return next(new AppError("This account has been deactivated", 403));
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new AppError("Access token expired", 401));
    }
    return next(new AppError("Not authorized, invalid token", 401));
  }
};

// Optionally attaches req.user if a valid token is present, but never blocks
// the request — useful for public endpoints that personalize when logged in.
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      req.user = await User.findById(decoded.id);
    }
  } catch (_) {
    // Silently ignore — this is optional auth.
  }
  next();
};
