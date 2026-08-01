import Startup from "../models/Startup.js";
import FundingOpportunity from "../models/FundingOpportunity.js";
import Grant from "../models/Grant.js";
import Incubator from "../models/Incubator.js";
import asyncHandler from "../middleware/asyncHandler.js";
import AppError from "../utils/AppError.js";

// Scores how well a funding source matches a startup on the criteria the
// spec calls out: industry, location, stage, technology, funding amount.
// Weighted sum out of 100 — kept simple and explainable rather than a
// black box, since founders should be able to see *why* something matched.
const scoreMatch = (startup, opportunity) => {
  let score = 0;
  const reasons = [];

  const oppIndustries = opportunity.industry || opportunity.industryFocus || [];
  if (oppIndustries.length === 0 || oppIndustries.includes(startup.industry)) {
    score += 35;
    if (oppIndustries.includes(startup.industry)) reasons.push(`Matches your industry (${startup.industry})`);
  }

  const oppStages = opportunity.fundingStage || [];
  if (oppStages.length === 0 || oppStages.includes(startup.stage)) {
    score += 25;
    if (oppStages.includes(startup.stage)) reasons.push(`Funds startups at the ${startup.stage.replace("_", " ")} stage`);
  }

  if (opportunity.location && startup.location && opportunity.location.toLowerCase() === startup.location.toLowerCase()) {
    score += 15;
    reasons.push(`Based in your location (${startup.location})`);
  } else if (!opportunity.location) {
    score += 10; // location-agnostic opportunities still count as broadly eligible
  }

  const min = opportunity.amountMin ?? opportunity.amount ?? 0;
  const max = opportunity.amountMax ?? opportunity.amount ?? Infinity;
  if (!startup.fundingSought || (startup.fundingSought >= min && startup.fundingSought <= max)) {
    score += 25;
    if (startup.fundingSought) reasons.push("Funding range fits what you're seeking");
  }

  return { score: Math.min(100, score), reasons };
};

// @route   GET /api/funding/recommendations/:startupId
export const getRecommendations = asyncHandler(async (req, res, next) => {
  const startup = await Startup.findById(req.params.startupId);
  if (!startup) return next(new AppError("Startup not found", 404));
  if (String(startup.owner) !== String(req.user._id)) {
    return next(new AppError("You can only view recommendations for your own startups", 403));
  }

  const [opportunities, grants, incubators] = await Promise.all([
    FundingOpportunity.find({ isActive: true }),
    Grant.find({ status: "open" }),
    Incubator.find({ applicationOpen: true }),
  ]);

  const rank = (items, typeLabel) =>
    items
      .map((item) => {
        const { score, reasons } = scoreMatch(startup, item);
        return { item, type: typeLabel, score, reasons };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score);

  const results = [
    ...rank(opportunities, "funding_opportunity"),
    ...rank(grants, "grant"),
    ...rank(incubators, "incubator"),
  ].sort((a, b) => b.score - a.score);

  res.status(200).json({ success: true, count: results.length, recommendations: results.slice(0, 25) });
});

// @route   GET /api/funding/opportunities  (browse/search, with filters)
export const getFundingOpportunities = asyncHandler(async (req, res) => {
  const { industry, stage, location, type, page = 1, limit = 12 } = req.query;
  const filter = { isActive: true };
  if (industry) filter.industry = industry;
  if (stage) filter.fundingStage = stage;
  if (location) filter.location = new RegExp(location, "i");
  if (type) filter.type = type;

  const skip = (Number(page) - 1) * Number(limit);
  const [opportunities, total] = await Promise.all([
    FundingOpportunity.find(filter).sort({ deadline: 1 }).skip(skip).limit(Number(limit)),
    FundingOpportunity.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count: opportunities.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    opportunities,
  });
});

// @route   POST /api/funding/opportunities  (post a new opportunity — investor/govt/incubator/accelerator only)
export const createFundingOpportunity = asyncHandler(async (req, res) => {
  const opportunity = await FundingOpportunity.create({ ...req.body, postedBy: req.user._id });
  res.status(201).json({ success: true, opportunity });
});
