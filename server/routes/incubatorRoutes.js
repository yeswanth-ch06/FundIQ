import express from "express";
import {
  getIncubators,
  getMyIncubatorProfile,
  upsertIncubatorProfile,
  getIncubatorById,
} from "../controllers/incubatorController.js";
import { protect } from "../middleware/auth.js";
import authorize from "../middleware/roleCheck.js";

const router = express.Router();
const INCUBATOR_ROLES = ["incubator", "accelerator"];

router.get("/", getIncubators);
router.get("/profile", protect, authorize(...INCUBATOR_ROLES), getMyIncubatorProfile);
router.post("/profile", protect, authorize(...INCUBATOR_ROLES), upsertIncubatorProfile);
router.get("/:id", getIncubatorById);

export default router;
