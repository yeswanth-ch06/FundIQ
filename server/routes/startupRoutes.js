import express from "express";
import { body } from "express-validator";
import {
  createStartup,
  getMyStartups,
  getStartups,
  getStartupById,
  updateStartup,
  deleteStartup,
  uploadLogo,
  uploadPitchDeck,
  uploadBusinessPlan,
  addTimelineEvent,
} from "../controllers/startupController.js";
import { protect, optionalAuth } from "../middleware/auth.js";
import validateRequest from "../middleware/validateRequest.js";
import { uploadImage, uploadDocument } from "../middleware/upload.js";

const router = express.Router();

router.get("/", getStartups);
router.get("/mine", protect, getMyStartups);
router.get("/:id", optionalAuth, getStartupById);

router.post(
  "/",
  protect,
  [
    body("name").trim().notEmpty().withMessage("Startup name is required"),
    body("description").trim().notEmpty().withMessage("Description is required"),
    body("industry").trim().notEmpty().withMessage("Industry is required"),
  ],
  validateRequest,
  createStartup
);

router.patch("/:id", protect, updateStartup);
router.delete("/:id", protect, deleteStartup);

router.post("/:id/logo", protect, uploadImage.single("logo"), uploadLogo);
router.post("/:id/pitch-deck", protect, uploadDocument.single("pitchDeck"), uploadPitchDeck);
router.post("/:id/business-plan", protect, uploadDocument.single("businessPlan"), uploadBusinessPlan);
router.post("/:id/timeline", protect, addTimelineEvent);

export default router;
