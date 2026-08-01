import express from "express";
import { getDashboardSummary, getRecentActivity } from "../controllers/analyticsController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/dashboard", protect, getDashboardSummary);
router.get("/recent-activity", protect, getRecentActivity);

export default router;
