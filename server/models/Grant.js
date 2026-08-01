import mongoose from "mongoose";

const grantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    issuingBody: { type: String, required: true }, // e.g. government department
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    description: { type: String, required: true },
    amount: { type: Number },
    industryFocus: [{ type: String }],
    eligibility: [String],
    applicationDeadline: { type: Date },
    documentsRequired: [String],
    status: { type: String, enum: ["open", "closed", "upcoming"], default: "open" },
  },
  { timestamps: true }
);

export default mongoose.model("Grant", grantSchema);
