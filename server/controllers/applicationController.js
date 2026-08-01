import Application from "../models/Application.js";
import FundingOpportunity from "../models/FundingOpportunity.js";
import Grant from "../models/Grant.js";
import Incubator from "../models/Incubator.js";
import Notification from "../models/Notification.js";
import asyncHandler from "../middleware/asyncHandler.js";
import AppError from "../utils/AppError.js";

const OPPORTUNITY_MODELS = {
  funding_opportunity: { Model: FundingOpportunity, modelName: "FundingOpportunity" },
  grant: { Model: Grant, modelName: "Grant" },
  incubator: { Model: Incubator, modelName: "Incubator" },
};

// @route   POST /api/applications
export const createApplication = asyncHandler(async (req, res, next) => {
  const { startup, opportunityType, opportunity, proposal } = req.body;

  const config = OPPORTUNITY_MODELS[opportunityType];
  if (!config) return next(new AppError("Invalid opportunity type", 400));

  const opportunityDoc = await config.Model.findById(opportunity);
  if (!opportunityDoc) return next(new AppError("Opportunity not found", 404));

  const existing = await Application.findOne({ startup, opportunity, applicant: req.user._id });
  if (existing) return next(new AppError("You've already applied to this opportunity", 409));

  const application = await Application.create({
    startup,
    applicant: req.user._id,
    opportunityType,
    opportunity,
    opportunityModelName: config.modelName,
    proposal,
    statusHistory: [{ status: "applied", changedBy: req.user._id }],
  });

  res.status(201).json({ success: true, application });
});

// @route   GET /api/applications/mine
export const getMyApplications = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = { applicant: req.user._id };
  if (status) filter.status = status;

  const applications = await Application.find(filter)
    .populate("startup", "name industry stage")
    .populate("opportunity")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: applications.length, applications });
});

// @route   GET /api/applications/:id
export const getApplicationById = asyncHandler(async (req, res, next) => {
  const application = await Application.findById(req.params.id)
    .populate("startup", "name industry stage owner")
    .populate("opportunity")
    .populate("proposal");
  if (!application) return next(new AppError("Application not found", 404));

  const isOwner = String(application.applicant) === String(req.user._id);
  const isStartupOwner = String(application.startup?.owner) === String(req.user._id);
  if (!isOwner && !isStartupOwner && req.user.role !== "admin") {
    return next(new AppError("You do not have permission to view this application", 403));
  }

  res.status(200).json({ success: true, application });
});

// @route   GET /api/applications/received
// Applications submitted to opportunities *this user posted* — what a
// government body, incubator, or investor needs to review their pipeline.
export const getReceivedApplications = asyncHandler(async (req, res) => {
  const { status } = req.query;

  const [opportunities, grants, incubators] = await Promise.all([
    FundingOpportunity.find({ postedBy: req.user._id }).select("_id"),
    Grant.find({ postedBy: req.user._id }).select("_id"),
    Incubator.find({ user: req.user._id }).select("_id"),
  ]);
  const opportunityIds = [
    ...opportunities.map((o) => o._id),
    ...grants.map((g) => g._id),
    ...incubators.map((i) => i._id),
  ];

  const filter = { opportunity: { $in: opportunityIds } };
  if (status) filter.status = status;

  const applications = await Application.find(filter)
    .populate("startup", "name industry stage")
    .populate("applicant", "name organization")
    .populate("opportunity")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: applications.length, applications });
});

const assertCanReviewApplication = async (application, user) => {
  if (user.role === "admin") return;

  const config = OPPORTUNITY_MODELS[application.opportunityType];
  const opportunityDoc = await config.Model.findById(application.opportunity);
  if (!opportunityDoc) throw new AppError("Opportunity not found", 404);

  const posterId = opportunityDoc.postedBy || opportunityDoc.user; // Incubator uses `user`, others use `postedBy`
  if (String(posterId) !== String(user._id)) {
    throw new AppError("You can only review applications submitted to your own opportunities", 403);
  }
};

// @route   PATCH /api/applications/:id/status
// Used by whoever posted the opportunity (investor/govt/incubator/admin) to
// move an application through the pipeline.
export const updateApplicationStatus = asyncHandler(async (req, res, next) => {
  const { status, reviewerNotes } = req.body;
  const VALID = ["applied", "under_review", "accepted", "rejected", "withdrawn"];
  if (!VALID.includes(status)) return next(new AppError("Invalid status", 400));

  const application = await Application.findById(req.params.id);
  if (!application) return next(new AppError("Application not found", 404));

  await assertCanReviewApplication(application, req.user);

  application.status = status;
  if (reviewerNotes !== undefined) application.reviewerNotes = reviewerNotes;
  application.statusHistory.push({ status, changedBy: req.user._id });
  await application.save();

  await Notification.create({
    user: application.applicant,
    type: "application_status",
    title: "Application status updated",
    message: `Your application is now "${status.replace("_", " ")}".`,
    link: `/dashboard/applications/${application._id}`,
  });

  res.status(200).json({ success: true, application });
});

// @route   DELETE /api/applications/:id  (withdraw)
export const withdrawApplication = asyncHandler(async (req, res, next) => {
  const application = await Application.findById(req.params.id);
  if (!application) return next(new AppError("Application not found", 404));
  if (String(application.applicant) !== String(req.user._id)) {
    return next(new AppError("You can only withdraw your own applications", 403));
  }

  application.status = "withdrawn";
  application.statusHistory.push({ status: "withdrawn", changedBy: req.user._id });
  await application.save();

  res.status(200).json({ success: true, application });
});
