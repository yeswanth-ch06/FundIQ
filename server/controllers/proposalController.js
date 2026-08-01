import Proposal from "../models/Proposal.js";
import Startup from "../models/Startup.js";
import Notification from "../models/Notification.js";
import asyncHandler from "../middleware/asyncHandler.js";
import AppError from "../utils/AppError.js";
import { evaluateProposal } from "../services/geminiService.js";
import { extractPdfText } from "../utils/extractPdfText.js";
import { uploadBufferToCloudinary } from "../utils/cloudinaryUpload.js";

const assertOwnership = (proposal, userId) => {
  if (String(proposal.submittedBy) !== String(userId)) {
    throw new AppError("You do not have permission to access this proposal", 403);
  }
};

// @route   POST /api/proposals
// Accepts either written `content` in the body, or a PDF upload (field
// name "proposalFile") whose text is extracted automatically.
export const createProposal = asyncHandler(async (req, res, next) => {
  const { startup: startupId, title } = req.body;
  let { content } = req.body;

  const startup = await Startup.findById(startupId);
  if (!startup) return next(new AppError("Startup not found", 404));
  if (String(startup.owner) !== String(req.user._id)) {
    return next(new AppError("You can only submit proposals for your own startups", 403));
  }

  let sourceFile;
  if (req.file) {
    content = await extractPdfText(req.file.buffer);
    const { url, publicId } = await uploadBufferToCloudinary(req.file.buffer, "proposals", "raw");
    sourceFile = { url, publicId, originalName: req.file.originalname };
  }

  if (!content || !content.trim()) {
    return next(new AppError("Proposal must include written content or a readable PDF", 400));
  }

  const proposal = await Proposal.create({
    startup: startupId,
    submittedBy: req.user._id,
    title: title || startup.name,
    content,
    sourceFile,
    status: "submitted",
  });

  res.status(201).json({ success: true, proposal });
});

// @route   GET /api/proposals/mine
export const getMyProposals = asyncHandler(async (req, res) => {
  const proposals = await Proposal.find({ submittedBy: req.user._id })
    .populate("startup", "name industry stage")
    .sort({ createdAt: -1 });
  res.status(200).json({ success: true, proposals });
});

// @route   GET /api/proposals/:id
export const getProposalById = asyncHandler(async (req, res, next) => {
  const proposal = await Proposal.findById(req.params.id).populate("startup", "name industry stage owner");
  if (!proposal) return next(new AppError("Proposal not found", 404));
  res.status(200).json({ success: true, proposal });
});

// @route   POST /api/proposals/:id/evaluate
// Runs (or re-runs) the AI evaluation on an existing proposal.
export const runEvaluation = asyncHandler(async (req, res, next) => {
  const proposal = await Proposal.findById(req.params.id).populate("startup", "industry stage");
  if (!proposal) return next(new AppError("Proposal not found", 404));
  assertOwnership(proposal, req.user._id);

  const evaluation = await evaluateProposal({
    title: proposal.title,
    content: proposal.content,
    industry: proposal.startup?.industry,
    stage: proposal.startup?.stage,
  });

  proposal.aiEvaluation = evaluation;
  proposal.status = "evaluated";
  await proposal.save();

  await Notification.create({
    user: req.user._id,
    type: "ai_evaluation",
    title: "AI evaluation complete",
    message: `Your proposal "${proposal.title}" scored ${evaluation.overallFundingReadiness}/100 for funding readiness.`,
    link: `/dashboard/proposals/${proposal._id}`,
  });

  res.status(200).json({ success: true, proposal });
});

// @route   DELETE /api/proposals/:id
export const deleteProposal = asyncHandler(async (req, res, next) => {
  const proposal = await Proposal.findById(req.params.id);
  if (!proposal) return next(new AppError("Proposal not found", 404));
  assertOwnership(proposal, req.user._id);
  await proposal.deleteOne();
  res.status(200).json({ success: true, message: "Proposal deleted" });
});
