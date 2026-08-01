import express from "express";
import { body } from "express-validator";
import {
  upsertInvestorProfile,
  getMyInvestorProfile,
  getRankedStartups,
  compareStartups,
  submitReview,
  getStartupReviews,
} from "../controllers/investorController.js";
import { protect } from "../middleware/auth.js";
import authorize from "../middleware/roleCheck.js";
import validateRequest from "../middleware/validateRequest.js";

const router = express.Router();

const INVESTOR_ROLES = ["investor", "venture_capital", "angel_investor"];

router.get("/profile", protect, authorize(...INVESTOR_ROLES), getMyInvestorProfile);
router.post("/profile", protect, authorize(...INVESTOR_ROLES), upsertInvestorProfile);

router.get("/startups", protect, authorize(...INVESTOR_ROLES), getRankedStartups);
router.get("/compare", protect, authorize(...INVESTOR_ROLES), compareStartups);

router.post(
  "/review",
  protect,
  authorize(...INVESTOR_ROLES),
  [
    body("startup").notEmpty().withMessage("Startup id is required"),
    body("decision")
      .isIn(["accepted", "rejected", "meeting_requested", "feedback_only"])
      .withMessage("Invalid decision"),
    body("feedback").trim().notEmpty().withMessage("Feedback is required"),
  ],
  validateRequest,
  submitReview
);

router.get("/reviews/:startupId", protect, getStartupReviews);

export default router;
