import express from "express";
import { body } from "express-validator";
import {
  getGrants,
  getMyGrants,
  getGrantById,
  createGrant,
  updateGrant,
  deleteGrant,
  getGrantApplications,
} from "../controllers/grantController.js";
import { protect } from "../middleware/auth.js";
import authorize from "../middleware/roleCheck.js";
import validateRequest from "../middleware/validateRequest.js";

const router = express.Router();
const GOV_ROLES = ["government", "admin"];

router.get("/", getGrants);
router.get("/mine", protect, authorize(...GOV_ROLES), getMyGrants);
router.get("/:id", getGrantById);
router.get("/:id/applications", protect, authorize(...GOV_ROLES), getGrantApplications);

router.post(
  "/",
  protect,
  authorize(...GOV_ROLES),
  [
    body("name").trim().notEmpty().withMessage("Grant name is required"),
    body("issuingBody").trim().notEmpty().withMessage("Issuing body is required"),
    body("description").trim().notEmpty().withMessage("Description is required"),
  ],
  validateRequest,
  createGrant
);

router.patch("/:id", protect, authorize(...GOV_ROLES), updateGrant);
router.delete("/:id", protect, authorize(...GOV_ROLES), deleteGrant);

export default router;
