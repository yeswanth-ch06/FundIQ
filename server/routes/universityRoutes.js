import express from "express";
import { body } from "express-validator";
import {
  getStudentStartups,
  submitMentorshipFeedback,
  getUniversityAnalytics,
} from "../controllers/universityController.js";
import { protect } from "../middleware/auth.js";
import authorize from "../middleware/roleCheck.js";
import validateRequest from "../middleware/validateRequest.js";

const router = express.Router();
const UNI_ROLES = ["university", "admin"];

router.get("/student-startups", protect, authorize(...UNI_ROLES), getStudentStartups);
router.get("/analytics", protect, authorize(...UNI_ROLES), getUniversityAnalytics);
router.post(
  "/mentorship",
  protect,
  authorize(...UNI_ROLES),
  [
    body("startup").notEmpty().withMessage("Startup id is required"),
    body("feedback").trim().notEmpty().withMessage("Feedback is required"),
  ],
  validateRequest,
  submitMentorshipFeedback
);

export default router;
