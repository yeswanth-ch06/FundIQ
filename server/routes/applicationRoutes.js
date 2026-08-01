import express from "express";
import { body } from "express-validator";
import {
  createApplication,
  getMyApplications,
  getReceivedApplications,
  getApplicationById,
  updateApplicationStatus,
  withdrawApplication,
} from "../controllers/applicationController.js";
import { protect } from "../middleware/auth.js";
import authorize from "../middleware/roleCheck.js";
import validateRequest from "../middleware/validateRequest.js";

const router = express.Router();
const REVIEWER_ROLES = ["investor", "venture_capital", "angel_investor", "government", "incubator", "accelerator", "admin"];

router.get("/mine", protect, getMyApplications);
router.get("/received", protect, authorize(...REVIEWER_ROLES), getReceivedApplications);
router.get("/:id", protect, getApplicationById);

router.post(
  "/",
  protect,
  [
    body("startup").notEmpty().withMessage("Startup id is required"),
    body("opportunityType")
      .isIn(["funding_opportunity", "grant", "incubator"])
      .withMessage("Invalid opportunity type"),
    body("opportunity").notEmpty().withMessage("Opportunity id is required"),
  ],
  validateRequest,
  createApplication
);

router.patch("/:id/status", protect, authorize(...REVIEWER_ROLES), updateApplicationStatus);
router.delete("/:id", protect, withdrawApplication);

export default router;
