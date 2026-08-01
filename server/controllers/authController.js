import crypto from "crypto";
import User, { ROLES } from "../models/User.js";
import asyncHandler from "../middleware/asyncHandler.js";
import AppError from "../utils/AppError.js";
import { generateAccessToken, generateRefreshToken } from "../utils/generateTokens.js";
import sendEmail from "../utils/sendEmail.js";
import { verificationEmailTemplate, resetPasswordEmailTemplate } from "../utils/emailTemplates.js";
import jwt from "jsonwebtoken";

// In development frontend and backend share an origin (via the Vite proxy),
// so "strict" works. In production, Vercel (frontend) and Render (backend)
// are different domains, so the cookie needs sameSite:"none" + secure:true
// to survive the cross-site request at all.
const isProd = process.env.NODE_ENV === "production";
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

const issueTokens = async (res, user) => {
  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  // Keep only the latest 5 refresh tokens per user (multi-device support
  // with a bound on unbounded growth).
  user.refreshTokens = [...(user.refreshTokens || []), refreshToken].slice(-5);
  await user.save({ validateBeforeSave: false });

  res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);
  return accessToken;
};

// @route   POST /api/auth/register
export const register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role, organization, location } = req.body;

  if (role && !ROLES.includes(role)) {
    return next(new AppError("Invalid role selected", 400));
  }
  if (role === "admin") {
    return next(new AppError("Cannot self-register as admin", 403));
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return next(new AppError("An account with this email already exists", 409));
  }

  const user = new User({ name, email, password, role, organization, location });
  const verifyToken = user.createEmailVerificationToken();
  await user.save();

  const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verifyToken}`;
  try {
    await sendEmail({
      to: user.email,
      subject: "Verify your email",
      html: verificationEmailTemplate(user.name, verifyUrl),
    });
  } catch (err) {
    // Registration still succeeds even if the email fails to send —
    // the user can request a new verification link later.
    console.error("Failed to send verification email:", err.message);
  }

  const accessToken = await issueTokens(res, user);

  res.status(201).json({
    success: true,
    message: "Registered successfully. Please check your email to verify your account.",
    accessToken,
    user: user.toSafeObject(),
  });
});

// @route   POST /api/auth/login
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password +refreshTokens");
  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError("Invalid email or password", 401));
  }

  if (!user.isActive) {
    return next(new AppError("This account has been deactivated. Contact support.", 403));
  }

  user.lastLogin = new Date();
  const accessToken = await issueTokens(res, user);

  res.status(200).json({
    success: true,
    accessToken,
    user: user.toSafeObject(),
  });
});

// @route   POST /api/auth/refresh
export const refresh = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.refreshToken;
  if (!token) return next(new AppError("No refresh token provided", 401));

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    return next(new AppError("Invalid or expired refresh token", 401));
  }

  const user = await User.findById(decoded.id).select("+refreshTokens");
  if (!user || !user.refreshTokens.includes(token)) {
    return next(new AppError("Refresh token not recognized — please log in again", 401));
  }

  // Rotate: remove used token, issue a new pair.
  user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
  const accessToken = await issueTokens(res, user);

  res.status(200).json({ success: true, accessToken });
});

// @route   POST /api/auth/logout
export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (token && req.user) {
    req.user.refreshTokens = (req.user.refreshTokens || []).filter((t) => t !== token);
    await req.user.save({ validateBeforeSave: false });
  }
  res.clearCookie("refreshToken", REFRESH_COOKIE_OPTIONS);
  res.status(200).json({ success: true, message: "Logged out" });
});

// @route   GET /api/auth/verify-email/:token
export const verifyEmail = asyncHandler(async (req, res, next) => {
  const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  }).select("+emailVerificationToken +emailVerificationExpires");

  if (!user) {
    return next(new AppError("Verification link is invalid or has expired", 400));
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({ success: true, message: "Email verified successfully" });
});

// @route   POST /api/auth/forgot-password
export const forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  // Always return 200 to avoid leaking which emails are registered.
  if (!user) {
    return res.status(200).json({
      success: true,
      message: "If that email is registered, a reset link has been sent.",
    });
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  try {
    await sendEmail({
      to: user.email,
      subject: "Reset your password",
      html: resetPasswordEmailTemplate(user.name, resetUrl),
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError("Failed to send reset email. Please try again later.", 500));
  }

  res.status(200).json({
    success: true,
    message: "If that email is registered, a reset link has been sent.",
  });
});

// @route   POST /api/auth/reset-password/:token
export const resetPassword = asyncHandler(async (req, res, next) => {
  const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select("+passwordResetToken +passwordResetExpires");

  if (!user) {
    return next(new AppError("Reset link is invalid or has expired", 400));
  }

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.refreshTokens = []; // force re-login everywhere after a password reset
  await user.save();

  res.status(200).json({ success: true, message: "Password reset successful. Please log in." });
});

// @route   GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, user: req.user.toSafeObject() });
});

// @route   PATCH /api/auth/profile
export const updateProfile = asyncHandler(async (req, res, next) => {
  const allowedFields = ["name", "organization", "location", "bio", "phone"];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, user: user.toSafeObject() });
});
