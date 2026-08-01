import User from "../models/User.js";
import Startup from "../models/Startup.js";
import Grant from "../models/Grant.js";
import Application from "../models/Application.js";
import AdminLog from "../models/Admin.js";
import asyncHandler from "../middleware/asyncHandler.js";
import AppError from "../utils/AppError.js";

const logAction = (adminId, action, targetType, targetId, details) =>
  AdminLog.create({ admin: adminId, action, targetType, targetId, details });

// @route   GET /api/admin/users
export const getUsers = asyncHandler(async (req, res) => {
  const { role, q, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (q) filter.$or = [{ name: new RegExp(q, "i") }, { email: new RegExp(q, "i") }];

  const skip = (Number(page) - 1) * Number(limit);
  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    User.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    users,
  });
});

// @route   PATCH /api/admin/users/:id/status
export const setUserStatus = asyncHandler(async (req, res, next) => {
  const { isActive } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError("User not found", 404));
  if (String(user._id) === String(req.user._id)) {
    return next(new AppError("You cannot change your own account status", 400));
  }

  user.isActive = isActive;
  await user.save({ validateBeforeSave: false });
  await logAction(req.user._id, isActive ? "user_activated" : "user_suspended", "User", user._id);

  res.status(200).json({ success: true, user: user.toSafeObject() });
});

// @route   PATCH /api/admin/users/:id/role
export const setUserRole = asyncHandler(async (req, res, next) => {
  const { role } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError("User not found", 404));

  const previousRole = user.role;
  user.role = role;
  await user.save();
  await logAction(req.user._id, "user_role_changed", "User", user._id, `${previousRole} -> ${role}`);

  res.status(200).json({ success: true, user: user.toSafeObject() });
});

// @route   GET /api/admin/startups
export const getAllStartups = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [startups, total] = await Promise.all([
    Startup.find(filter).populate("owner", "name email role").sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Startup.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count: startups.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    startups,
  });
});

// @route   DELETE /api/admin/startups/:id
export const deleteStartupAsAdmin = asyncHandler(async (req, res, next) => {
  const startup = await Startup.findById(req.params.id);
  if (!startup) return next(new AppError("Startup not found", 404));

  await startup.deleteOne();
  await logAction(req.user._id, "startup_removed", "Startup", startup._id, startup.name);

  res.status(200).json({ success: true, message: "Startup removed" });
});

// @route   GET /api/admin/grants
export const getAllGrants = asyncHandler(async (req, res) => {
  const grants = await Grant.find().populate("postedBy", "name organization").sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: grants.length, grants });
});

// @route   GET /api/admin/applications
export const getAllApplications = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 25 } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [applications, total] = await Promise.all([
    Application.find(filter)
      .populate("startup", "name")
      .populate("applicant", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Application.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count: applications.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    applications,
  });
});

// @route   GET /api/admin/reports
// High-level platform report — separate from the dashboard summary so it
// can grow richer (exports, date ranges) without touching the dashboard.
export const getReports = asyncHandler(async (req, res) => {
  const [usersByRole, startupsByStage, startupsByIndustry, applicationsByStatus] = await Promise.all([
    User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
    Startup.aggregate([{ $group: { _id: "$stage", count: { $sum: 1 } } }]),
    Startup.aggregate([{ $group: { _id: "$industry", count: { $sum: 1 } } }]),
    Application.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
  ]);

  res.status(200).json({
    success: true,
    usersByRole,
    startupsByStage,
    startupsByIndustry,
    applicationsByStatus,
  });
});

// @route   GET /api/admin/logs
export const getLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 30 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const [logs, total] = await Promise.all([
    AdminLog.find().populate("admin", "name email").sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    AdminLog.countDocuments(),
  ]);

  res.status(200).json({
    success: true,
    count: logs.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    logs,
  });
});
