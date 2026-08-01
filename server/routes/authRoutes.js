import express from "express";
import { body } from "express-validator";
import {
  register,
  login,
  refresh,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import validateRequest from "../middleware/validateRequest.js";
import { ROLES } from "../models/User.js";

const router = express.Router();

router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("A valid email is required").normalizeEmail(),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters")
      .matches(/\d/)
      .withMessage("Password must contain a number"),
    body("role").optional().isIn(ROLES).withMessage("Invalid role"),
  ],
  validateRequest,
  register
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("A valid email is required").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validateRequest,
  login
);

router.post("/refresh", refresh);
router.post("/logout", protect, logout);
router.get("/verify-email/:token", verifyEmail);

router.post(
  "/forgot-password",
  [body("email").isEmail().withMessage("A valid email is required").normalizeEmail()],
  validateRequest,
  forgotPassword
);

router.post(
  "/reset-password/:token",
  [
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters")
      .matches(/\d/)
      .withMessage("Password must contain a number"),
  ],
  validateRequest,
  resetPassword
);

router.get("/me", protect, getMe);
router.patch("/profile", protect, updateProfile);

export default router;
