import mongoose from "mongoose";

const proposalSchema = new mongoose.Schema(
  {
    startup: { type: mongoose.Schema.Types.ObjectId, ref: "Startup", required: true },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    title: { type: String, required: true },
    content: { type: String, required: true }, // written proposal text
    sourceFile: { url: String, publicId: String, originalName: String }, // uploaded PDF

    aiEvaluation: {
      innovationScore: { type: Number, min: 0, max: 100 },
      businessScore: { type: Number, min: 0, max: 100 },
      scalabilityScore: { type: Number, min: 0, max: 100 },
      financialReadiness: { type: Number, min: 0, max: 100 },
      technologyReadiness: { type: Number, min: 0, max: 100 },
      investmentReadiness: { type: Number, min: 0, max: 100 },
      marketPotential: { type: Number, min: 0, max: 100 },
      overallFundingReadiness: { type: Number, min: 0, max: 100 },
      successProbability: { type: Number, min: 0, max: 100 },

      swot: {
        strengths: [String],
        weaknesses: [String],
        opportunities: [String],
        threats: [String],
      },
      riskAnalysis: [String],
      suggestions: [String],
      grammarIssues: [String],
      summary: { type: String },

      evaluatedAt: { type: Date },
      modelUsed: { type: String, default: "gemini-2.5-flash" },
    },

    status: {
      type: String,
      enum: ["draft", "submitted", "evaluated", "under_review"],
      default: "draft",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Proposal", proposalSchema);
