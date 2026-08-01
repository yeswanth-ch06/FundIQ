import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    startup: { type: mongoose.Schema.Types.ObjectId, ref: "Startup", required: true },
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, min: 1, max: 5 },
    feedback: { type: String, required: true },
    decision: { type: String, enum: ["accepted", "rejected", "meeting_requested", "feedback_only"] },
  },
  { timestamps: true }
);

export default mongoose.model("Review", reviewSchema);
