import mongoose from "mongoose";

const startupSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    tagline: { type: String, maxlength: 200 },
    description: { type: String, required: true },
    industry: { type: String, required: true, index: true },
    technology: [{ type: String }],
    stage: {
      type: String,
      enum: ["idea", "prototype", "mvp", "early_traction", "growth", "scale"],
      default: "idea",
      index: true,
    },
    location: { type: String, index: true },
    foundedYear: { type: Number },
    teamSize: { type: Number, default: 1 },
    website: { type: String },

    logo: { url: String, publicId: String },
    pitchDeck: { url: String, publicId: String, originalName: String },
    businessPlan: { url: String, publicId: String, originalName: String },

    fundingSought: { type: Number, default: 0 },
    fundingRaisedToDate: { type: Number, default: 0 },
    problemStatement: { type: String },
    marketSize: { type: String },

    timeline: [
      {
        title: String,
        description: String,
        date: { type: Date, default: Date.now },
      },
    ],

    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },

    viewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

startupSchema.index({ name: "text", description: "text", tagline: "text" });

export default mongoose.model("Startup", startupSchema);
