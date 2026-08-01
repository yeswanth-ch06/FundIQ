import User from "../models/User.js";
import Startup from "../models/Startup.js";
import Review from "../models/Review.js";
import Notification from "../models/Notification.js";
import asyncHandler from "../middleware/asyncHandler.js";
import AppError from "../utils/AppError.js";

// @route   GET /api/university/student-startups
export const getStudentStartups = asyncHandler(async (req, res) => {
  const { industry, page = 1, limit = 12 } = req.query;

  const studentIds = await User.find({ role: "student" }).distinct("_id");
  const filter = { owner: { $in: studentIds } };
  if (industry) filter.industry = industry;

  const skip = (Number(page) - 1) * Number(limit);
  const [startups, total] = await Promise.all([
    Startup.find(filter).populate("owner", "name organization").sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
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

// @route   POST /api/university/mentorship
// Records mentorship feedback on a student startup — reuses the Review
// model with decision "feedback_only" rather than introducing a parallel
// schema for what is functionally the same "reviewer leaves notes" shape.
export const submitMentorshipFeedback = asyncHandler(async (req, res, next) => {
  const { startup: startupId, feedback, rating } = req.body;

  const startup = await Startup.findById(startupId);
  if (!startup) return next(new AppError("Startup not found", 404));

  const review = await Review.create({
    startup: startupId,
    reviewer: req.user._id,
    rating,
    feedback,
    decision: "feedback_only",
  });

  await Notification.create({
    user: startup.owner,
    type: "review",
    title: "Mentorship feedback received",
    message: `${req.user.organization || req.user.name} left mentorship feedback on "${startup.name}".`,
    link: `/dashboard/startups/${startup._id}`,
  });

  res.status(201).json({ success: true, review });
});

// @route   GET /api/university/analytics
export const getUniversityAnalytics = asyncHandler(async (req, res) => {
  const studentIds = await User.find({ role: "student" }).distinct("_id");
  const startups = await Startup.find({ owner: { $in: studentIds } }).select("industry stage");

  const byIndustry = {};
  const byStage = {};
  startups.forEach((s) => {
    byIndustry[s.industry] = (byIndustry[s.industry] || 0) + 1;
    byStage[s.stage] = (byStage[s.stage] || 0) + 1;
  });

  res.status(200).json({
    success: true,
    totalStudents: studentIds.length,
    totalStartups: startups.length,
    byIndustry,
    byStage,
  });
});
