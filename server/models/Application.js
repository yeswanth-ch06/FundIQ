import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    startup: { type: mongoose.Schema.Types.ObjectId, ref: "Startup", required: true },
    applicant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    opportunityType: {
      type: String,
      enum: ["funding_opportunity", "grant", "incubator"],
      required: true,
    },
    opportunity: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: "opportunityModelName" },
    opportunityModelName: {
      type: String,
      required: true,
      enum: ["FundingOpportunity", "Grant", "Incubator"],
    },
    proposal: { type: mongoose.Schema.Types.ObjectId, ref: "Proposal" },
    status: {
      type: String,
      enum: ["applied", "under_review", "accepted", "rejected", "withdrawn"],
      default: "applied",
      index: true,
    },
    reviewerNotes: { type: String },
    statusHistory: [
      {
        status: String,
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Application", applicationSchema);
