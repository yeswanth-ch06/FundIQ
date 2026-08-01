import express from "express";
import { body } from "express-validator";
import {
  createProposal,
  getMyProposals,
  getProposalById,
  runEvaluation,
  deleteProposal,
} from "../controllers/proposalController.js";
import { protect } from "../middleware/auth.js";
import validateRequest from "../middleware/validateRequest.js";
import { uploadDocument } from "../middleware/upload.js";

const router = express.Router();

router.get("/mine", protect, getMyProposals);
router.get("/:id", protect, getProposalById);

router.post(
  "/",
  protect,
  uploadDocument.single("proposalFile"),
  [
    body("startup").notEmpty().withMessage("Startup id is required"),
    body("title").optional().trim(),
  ],
  validateRequest,
  createProposal
);

router.post("/:id/evaluate", protect, runEvaluation);
router.delete("/:id", protect, deleteProposal);

export default router;
