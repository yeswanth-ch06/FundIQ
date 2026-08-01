import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export const ROLES = [
  "student",
  "entrepreneur",
  "startup_founder",
  "researcher",
  "investor",
  "venture_capital",
  "angel_investor",
  "incubator",
  "accelerator",
  "government",
  "university",
  "admin",
];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ROLES, default: "entrepreneur", required: true },
    avatar: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    organization: { type: String, trim: true },
    location: { type: String, trim: true },
    bio: { type: String, maxlength: 1000 },
    phone: { type: String, trim: true },

    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },

    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },

    refreshTokens: [{ type: String, select: false }],

    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },

    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Bookmark" }],
  },
  { timestamps: true }
);

userSchema.index({ role: 1 });

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.createEmailVerificationToken = function () {
  const token = crypto.randomBytes(32).toString("hex");
  this.emailVerificationToken = crypto.createHash("sha256").update(token).digest("hex");
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24h
  return token;
};

userSchema.methods.createPasswordResetToken = function () {
  const token = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto.createHash("sha256").update(token).digest("hex");
  this.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1h
  return token;
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshTokens;
  delete obj.emailVerificationToken;
  delete obj.passwordResetToken;
  return obj;
};

export default mongoose.model("User", userSchema);
