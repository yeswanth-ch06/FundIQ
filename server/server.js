import path from "path";
import { fileURLToPath } from "url";

import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import compression from "compression";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";

import connectDB from "./config/db.js";
import errorHandler, { notFound } from "./middleware/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import startupRoutes from "./routes/startupRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import proposalRoutes from "./routes/proposalRoutes.js";
import fundingRoutes from "./routes/fundingRoutes.js";
import investorRoutes from "./routes/investorRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import grantRoutes from "./routes/grantRoutes.js";
import incubatorRoutes from "./routes/incubatorRoutes.js";
import universityRoutes from "./routes/universityRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
// Additional route modules are added here in later phases:
// import userRoutes from "./routes/userRoutes.js";

await connectDB();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Security & core middleware ---
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || true,
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression());
app.use(mongoSanitize()); // strips $ and . operators from user input
app.use(xss()); // sanitizes user input against XSS

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

const isDev = process.env.NODE_ENV !== "production";
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  // Generous in development (HMR reloads, repeated manual testing) — strict
  // in production. Override either via RATE_LIMIT_MAX in .env.
  max: Number(process.env.RATE_LIMIT_MAX) || (isDev ? 2000 : 200),
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later." },
});
app.use("/api", limiter);

// --- Health check ---
app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "API is healthy", timestamp: new Date() });
});

// --- Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/startups", startupRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/proposals", proposalRoutes);
app.use("/api/funding", fundingRoutes);
app.use("/api/investors", investorRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/grants", grantRoutes);
app.use("/api/incubators", incubatorRoutes);
app.use("/api/university", universityRoutes);
app.use("/api/admin", adminRoutes);
// app.use("/api/users", userRoutes);

// Serve React app in production
if (process.env.NODE_ENV === "production") {
  const clientPath = path.join(__dirname, "../client/dist");

  app.use(express.static(clientPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(clientPath, "index.html"));
  });
}

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
});

process.on("unhandledRejection", (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
});
