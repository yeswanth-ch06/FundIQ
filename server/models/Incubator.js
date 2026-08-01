import mongoose from "mongoose";

const incubatorSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    name: { type: String, required: true },
    type: { type: String, enum: ["incubator", "accelerator"], required: true },
    focusIndustries: [{ type: String }],
    location: { type: String },
    programDuration: { type: String }, // e.g. "12 weeks"
    equityTaken: { type: String }, // e.g. "6%"
    benefits: [String],
    applicationOpen: { type: Boolean, default: true },
    website: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Incubator", incubatorSchema);
