import express from "express";
import {
  getRecommendations,
  getFundingOpportunities,
  createFundingOpportunity,
} from "../controllers/fundingController.js";
import { protect } from "../middleware/auth.js";
import authorize from "../middleware/roleCheck.js";

const router = express.Router();

router.get("/opportunities", getFundingOpportunities);
router.post(
  "/opportunities",
  protect,
  authorize("investor", "venture_capital", "angel_investor", "government", "incubator", "accelerator", "admin"),
  createFundingOpportunity
);
router.get("/recommendations/:startupId", protect, getRecommendations);

export default router;
