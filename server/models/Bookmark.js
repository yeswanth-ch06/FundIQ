import mongoose from "mongoose";

const bookmarkSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    itemType: {
      type: String,
      enum: ["FundingOpportunity", "Grant", "Incubator", "Startup"],
      required: true,
    },
    item: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: "itemType" },
  },
  { timestamps: true }
);

bookmarkSchema.index({ user: 1, itemType: 1, item: 1 }, { unique: true });

export default mongoose.model("Bookmark", bookmarkSchema);
