import Startup from "../models/Startup.js";
import Analytics from "../models/Analytics.js";
import asyncHandler from "../middleware/asyncHandler.js";
import AppError from "../utils/AppError.js";
import { uploadBufferToCloudinary, deleteFromCloudinary } from "../utils/cloudinaryUpload.js";

// @route   POST /api/startups
export const createStartup = asyncHandler(async (req, res) => {
  const startup = await Startup.create({ ...req.body, owner: req.user._id });
  res.status(201).json({ success: true, startup });
});

// @route   GET /api/startups/mine
export const getMyStartups = asyncHandler(async (req, res) => {
  const startups = await Startup.find({ owner: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: startups.length, startups });
});

// @route   GET /api/startups  (public browse, with filters)
export const getStartups = asyncHandler(async (req, res) => {
  const { industry, stage, location, technology, q, page = 1, limit = 12 } = req.query;
  const filter = { status: "published" };

  if (industry) filter.industry = industry;
  if (stage) filter.stage = stage;
  if (location) filter.location = new RegExp(location, "i");
  if (technology) filter.technology = technology;
  if (q) filter.$text = { $search: q };

  const skip = (Number(page) - 1) * Number(limit);
  const [startups, total] = await Promise.all([
    Startup.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
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

// @route   GET /api/startups/:id
export const getStartupById = asyncHandler(async (req, res, next) => {
  const startup = await Startup.findById(req.params.id).populate("owner", "name email organization");
  if (!startup) return next(new AppError("Startup not found", 404));

  // Only bump the public view counter for viewers who aren't the owner.
  if (!req.user || String(startup.owner._id) !== String(req.user._id)) {
    startup.viewCount += 1;
    await startup.save({ validateBeforeSave: false });
  }

  res.status(200).json({ success: true, startup });
});

const assertOwnership = (startup, userId) => {
  if (String(startup.owner) !== String(userId)) {
    throw new AppError("You do not have permission to modify this startup", 403);
  }
};

// @route   PATCH /api/startups/:id
export const updateStartup = asyncHandler(async (req, res, next) => {
  const startup = await Startup.findById(req.params.id);
  if (!startup) return next(new AppError("Startup not found", 404));
  assertOwnership(startup, req.user._id);

  const editableFields = [
    "name", "tagline", "description", "industry", "technology", "stage", "location",
    "foundedYear", "teamSize", "website", "fundingSought", "fundingRaisedToDate",
    "problemStatement", "marketSize", "status",
  ];
  editableFields.forEach((field) => {
    if (req.body[field] !== undefined) startup[field] = req.body[field];
  });

  await startup.save();
  res.status(200).json({ success: true, startup });
});

// @route   DELETE /api/startups/:id
export const deleteStartup = asyncHandler(async (req, res, next) => {
  const startup = await Startup.findById(req.params.id);
  if (!startup) return next(new AppError("Startup not found", 404));
  assertOwnership(startup, req.user._id);

  await Promise.all([
    deleteFromCloudinary(startup.logo?.publicId, "image"),
    deleteFromCloudinary(startup.pitchDeck?.publicId, "raw"),
    deleteFromCloudinary(startup.businessPlan?.publicId, "raw"),
  ]);
  await startup.deleteOne();

  res.status(200).json({ success: true, message: "Startup deleted" });
});

// @route   POST /api/startups/:id/logo
export const uploadLogo = asyncHandler(async (req, res, next) => {
  const startup = await Startup.findById(req.params.id);
  if (!startup) return next(new AppError("Startup not found", 404));
  assertOwnership(startup, req.user._id);
  if (!req.file) return next(new AppError("No file uploaded", 400));

  await deleteFromCloudinary(startup.logo?.publicId, "image");
  const { url, publicId } = await uploadBufferToCloudinary(req.file.buffer, "startups/logos", "image");
  startup.logo = { url, publicId };
  await startup.save({ validateBeforeSave: false });

  res.status(200).json({ success: true, logo: startup.logo });
});

const uploadDocField = (field, folder) =>
  asyncHandler(async (req, res, next) => {
    const startup = await Startup.findById(req.params.id);
    if (!startup) return next(new AppError("Startup not found", 404));
    assertOwnership(startup, req.user._id);
    if (!req.file) return next(new AppError("No file uploaded", 400));

    await deleteFromCloudinary(startup[field]?.publicId, "raw");
    const { url, publicId } = await uploadBufferToCloudinary(req.file.buffer, folder, "raw");
    startup[field] = { url, publicId, originalName: req.file.originalname };
    await startup.save({ validateBeforeSave: false });

    res.status(200).json({ success: true, [field]: startup[field] });
  });

// @route   POST /api/startups/:id/pitch-deck
export const uploadPitchDeck = uploadDocField("pitchDeck", "startups/pitch-decks");

// @route   POST /api/startups/:id/business-plan
export const uploadBusinessPlan = uploadDocField("businessPlan", "startups/business-plans");

// @route   POST /api/startups/:id/timeline
export const addTimelineEvent = asyncHandler(async (req, res, next) => {
  const startup = await Startup.findById(req.params.id);
  if (!startup) return next(new AppError("Startup not found", 404));
  assertOwnership(startup, req.user._id);

  const { title, description, date } = req.body;
  startup.timeline.push({ title, description, date });
  await startup.save();

  res.status(201).json({ success: true, timeline: startup.timeline });
});
