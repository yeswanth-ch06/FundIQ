import Grant from "../models/Grant.js";
import Application from "../models/Application.js";
import asyncHandler from "../middleware/asyncHandler.js";
import AppError from "../utils/AppError.js";

const assertOwnership = (grant, userId) => {
  if (String(grant.postedBy) !== String(userId)) {
    throw new AppError("You do not have permission to modify this grant", 403);
  }
};

// @route   GET /api/grants  (public browse)
export const getGrants = asyncHandler(async (req, res) => {
  const { status = "open", industry, page = 1, limit = 12 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (industry) filter.industryFocus = industry;

  const skip = (Number(page) - 1) * Number(limit);
  const [grants, total] = await Promise.all([
    Grant.find(filter).sort({ applicationDeadline: 1 }).skip(skip).limit(Number(limit)),
    Grant.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count: grants.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    grants,
  });
});

// @route   GET /api/grants/mine  (government's own published schemes)
export const getMyGrants = asyncHandler(async (req, res) => {
  const grants = await Grant.find({ postedBy: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, grants });
});

// @route   GET /api/grants/:id
export const getGrantById = asyncHandler(async (req, res, next) => {
  const grant = await Grant.findById(req.params.id);
  if (!grant) return next(new AppError("Grant not found", 404));
  res.status(200).json({ success: true, grant });
});

// @route   POST /api/grants
export const createGrant = asyncHandler(async (req, res) => {
  const grant = await Grant.create({ ...req.body, postedBy: req.user._id });
  res.status(201).json({ success: true, grant });
});

// @route   PATCH /api/grants/:id
export const updateGrant = asyncHandler(async (req, res, next) => {
  const grant = await Grant.findById(req.params.id);
  if (!grant) return next(new AppError("Grant not found", 404));
  assertOwnership(grant, req.user._id);

  const editable = [
    "name", "issuingBody", "description", "amount", "industryFocus",
    "eligibility", "applicationDeadline", "documentsRequired", "status",
  ];
  editable.forEach((f) => {
    if (req.body[f] !== undefined) grant[f] = req.body[f];
  });
  await grant.save();

  res.status(200).json({ success: true, grant });
});

// @route   DELETE /api/grants/:id
export const deleteGrant = asyncHandler(async (req, res, next) => {
  const grant = await Grant.findById(req.params.id);
  if (!grant) return next(new AppError("Grant not found", 404));
  assertOwnership(grant, req.user._id);
  await grant.deleteOne();
  res.status(200).json({ success: true, message: "Grant deleted" });
});

// @route   GET /api/grants/:id/applications
// Applications submitted against one of this government user's grants.
export const getGrantApplications = asyncHandler(async (req, res, next) => {
  const grant = await Grant.findById(req.params.id);
  if (!grant) return next(new AppError("Grant not found", 404));
  assertOwnership(grant, req.user._id);

  const applications = await Application.find({ opportunity: req.params.id, opportunityModelName: "Grant" })
    .populate("startup", "name industry stage")
    .populate("applicant", "name organization")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, applications });
});
