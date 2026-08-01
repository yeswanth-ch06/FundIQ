import Investor from "../models/Investor.js";
import Startup from "../models/Startup.js";
import Proposal from "../models/Proposal.js";
import Review from "../models/Review.js";
import Notification from "../models/Notification.js";
import asyncHandler from "../middleware/asyncHandler.js";
import AppError from "../utils/AppError.js";

// @route   POST /api/investors/profile
export const upsertInvestorProfile = asyncHandler(async (req, res) => {
  const allowed = [
    "firmName", "type", "industriesOfInterest", "preferredStages",
    "preferredLocations", "ticketSizeMin", "ticketSizeMax", "portfolio", "bio", "linkedIn",
  ];
  const payload = {};
  allowed.forEach((f) => {
    if (req.body[f] !== undefined) payload[f] = req.body[f];
  });

  const investor = await Investor.findOneAndUpdate(
    { user: req.user._id },
    { ...payload, user: req.user._id, type: payload.type || req.user.role },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );

  res.status(200).json({ success: true, investor });
});

// @route   GET /api/investors/profile
export const getMyInvestorProfile = asyncHandler(async (req, res) => {
  const investor = await Investor.findOne({ user: req.user._id });
  res.status(200).json({ success: true, investor });
});

// @route   GET /api/investors/startups
// Browse published startups ranked by their latest AI funding-readiness
// score — this is the "AI Ranking" feature from the spec's Investor Portal.
export const getRankedStartups = asyncHandler(async (req, res) => {
  const { industry, stage, location, page = 1, limit = 12 } = req.query;
  const filter = { status: "published" };
  if (industry) filter.industry = industry;
  if (stage) filter.stage = stage;
  if (location) filter.location = new RegExp(location, "i");

  const startups = await Startup.find(filter).lean();
  const startupIds = startups.map((s) => s._id);

  // Pull each startup's most recent evaluated proposal score in one query.
  const proposals = await Proposal.aggregate([
    { $match: { startup: { $in: startupIds }, status: "evaluated" } },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: "$startup",
        overallFundingReadiness: { $first: "$aiEvaluation.overallFundingReadiness" },
        successProbability: { $first: "$aiEvaluation.successProbability" },
      },
    },
  ]);
  const scoreMap = new Map(proposals.map((p) => [String(p._id), p]));

  const ranked = startups
    .map((s) => ({
      ...s,
      aiScore: scoreMap.get(String(s._id))?.overallFundingReadiness ?? null,
      successProbability: scoreMap.get(String(s._id))?.successProbability ?? null,
    }))
    .sort((a, b) => (b.aiScore ?? -1) - (a.aiScore ?? -1));

  const start = (Number(page) - 1) * Number(limit);
  const paged = ranked.slice(start, start + Number(limit));

  res.status(200).json({
    success: true,
    count: paged.length,
    total: ranked.length,
    page: Number(page),
    pages: Math.ceil(ranked.length / Number(limit)),
    startups: paged,
  });
});

// @route   GET /api/investors/compare?ids=id1,id2,id3
export const compareStartups = asyncHandler(async (req, res, next) => {
  const ids = (req.query.ids || "").split(",").filter(Boolean);
  if (ids.length < 2 || ids.length > 4) {
    return next(new AppError("Provide between 2 and 4 startup ids to compare", 400));
  }

  const startups = await Startup.find({ _id: { $in: ids } }).lean();
  const proposals = await Proposal.find({ startup: { $in: ids }, status: "evaluated" })
    .sort({ createdAt: -1 })
    .lean();

  const comparison = startups.map((s) => {
    const proposal = proposals.find((p) => String(p.startup) === String(s._id));
    return { startup: s, aiEvaluation: proposal?.aiEvaluation || null };
  });

  res.status(200).json({ success: true, comparison });
});

// @route   POST /api/investors/review
// Records an investor's decision on a startup: accept, reject, request a
// meeting, or leave feedback only.
export const submitReview = asyncHandler(async (req, res, next) => {
  const { startup: startupId, rating, feedback, decision } = req.body;

  const startup = await Startup.findById(startupId);
  if (!startup) return next(new AppError("Startup not found", 404));

  const review = await Review.create({
    startup: startupId,
    reviewer: req.user._id,
    rating,
    feedback,
    decision,
  });

  const DECISION_LABEL = {
    accepted: "accepted your startup",
    rejected: "passed on your startup",
    meeting_requested: "requested a meeting about your startup",
    feedback_only: "left feedback on your startup",
  };

  await Notification.create({
    user: startup.owner,
    type: "review",
    title: "New investor feedback",
    message: `An investor ${DECISION_LABEL[decision] || "reviewed"} "${startup.name}".`,
    link: `/dashboard/startups/${startup._id}`,
  });

  res.status(201).json({ success: true, review });
});

// @route   GET /api/investors/reviews/:startupId
export const getStartupReviews = asyncHandler(async (req, res, next) => {
  const startup = await Startup.findById(req.params.startupId);
  if (!startup) return next(new AppError("Startup not found", 404));
  if (String(startup.owner) !== String(req.user._id)) {
    return next(new AppError("You can only view reviews for your own startups", 403));
  }

  const reviews = await Review.find({ startup: req.params.startupId })
    .populate("reviewer", "name organization")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, reviews });
});
