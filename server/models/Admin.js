import mongoose from "mongoose";

// Admin actions are performed by Users with role="admin". This model is an
// audit log of sensitive admin actions (user bans, approvals, deletions, etc.)
// rather than a duplicate identity table.
const adminLogSchema = new mongoose.Schema(
  {
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true }, // e.g. "user_suspended", "grant_approved"
    targetType: { type: String }, // e.g. "User", "Startup", "Grant"
    targetId: { type: mongoose.Schema.Types.ObjectId },
    details: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("AdminLog", adminLogSchema);
