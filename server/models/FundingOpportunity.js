import mongoose from "mongoose";

const fundingOpportunitySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ["investor", "government_scheme", "incubator", "accelerator", "vc_firm", "angel"],
      required: true,
      index: true,
    },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    description: { type: String, required: true },
    industry: [{ type: String, index: true }],
    location: { type: String, index: true },
    fundingStage: [{ type: String }],
    amountMin: { type: Number },
    amountMax: { type: Number },
    deadline: { type: Date, index: true },
    eligibilityCriteria: [String],
    applicationUrl: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

fundingOpportunitySchema.index({ title: "text", description: "text" });

export default mongoose.model("FundingOpportunity", fundingOpportunitySchema);
