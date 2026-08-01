import mongoose from "mongoose";

// Aggregated/event-level analytics records (e.g. daily platform snapshots,
// or per-entity event logs) used to power dashboard charts.
const analyticsSchema = new mongoose.Schema(
  {
    scope: { type: String, enum: ["platform", "startup", "investor", "user"], required: true },
    refId: { type: mongoose.Schema.Types.ObjectId }, // optional entity this record is about
    metric: { type: String, required: true }, // e.g. "profile_views", "applications_count"
    value: { type: Number, required: true },
    date: { type: Date, default: Date.now, index: true },
    meta: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

export default mongoose.model("Analytics", analyticsSchema);
