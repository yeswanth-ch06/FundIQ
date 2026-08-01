import Incubator from "../models/Incubator.js";
import asyncHandler from "../middleware/asyncHandler.js";
import AppError from "../utils/AppError.js";

// @route   GET /api/incubators  (public browse)
export const getIncubators = asyncHandler(async (req, res) => {
  const { type, industry, location, page = 1, limit = 12 } = req.query;
  const filter = { applicationOpen: true };
  if (type) filter.type = type;
  if (industry) filter.focusIndustries = industry;
  if (location) filter.location = new RegExp(location, "i");

  const skip = (Number(page) - 1) * Number(limit);
  const [incubators, total] = await Promise.all([
    Incubator.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Incubator.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count: incubators.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    incubators,
  });
});

// @route   GET /api/incubators/profile  (the logged-in incubator/accelerator's own listing)
export const getMyIncubatorProfile = asyncHandler(async (req, res) => {
  const incubator = await Incubator.findOne({ user: req.user._id });
  res.status(200).json({ success: true, incubator });
});

// @route   POST /api/incubators/profile  (create or update)
export const upsertIncubatorProfile = asyncHandler(async (req, res) => {
  const allowed = [
    "name", "type", "focusIndustries", "location", "programDuration",
    "equityTaken", "benefits", "applicationOpen", "website",
  ];
  const payload = {};
  allowed.forEach((f) => {
    if (req.body[f] !== undefined) payload[f] = req.body[f];
  });

  const incubator = await Incubator.findOneAndUpdate(
    { user: req.user._id },
    { ...payload, user: req.user._id, type: payload.type || req.user.role },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );

  res.status(200).json({ success: true, incubator });
});

// @route   GET /api/incubators/:id
export const getIncubatorById = asyncHandler(async (req, res, next) => {
  const incubator = await Incubator.findById(req.params.id);
  if (!incubator) return next(new AppError("Incubator not found", 404));
  res.status(200).json({ success: true, incubator });
});
