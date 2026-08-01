import mongoose from "mongoose";

const investorSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    firmName: { type: String, trim: true },
    type: {
      type: String,
      enum: ["angel_investor", "venture_capital", "investor"],
      required: true,
    },
    industriesOfInterest: [{ type: String, index: true }],
    preferredStages: [{ type: String }],
    preferredLocations: [{ type: String }],
    ticketSizeMin: { type: Number },
    ticketSizeMax: { type: Number },
    portfolio: [{ type: String }],
    bio: { type: String },
    linkedIn: { type: String },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Investor", investorSchema);
