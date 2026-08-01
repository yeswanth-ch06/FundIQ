import express from "express";
import { body } from "express-validator";
import {
  getConversations,
  getMessagesWithUser,
  sendMessage,
  getUnreadCount,
} from "../controllers/messageController.js";
import { protect } from "../middleware/auth.js";
import validateRequest from "../middleware/validateRequest.js";

const router = express.Router();

router.get("/conversations", protect, getConversations);
router.get("/unread-count", protect, getUnreadCount);
router.get("/:userId", protect, getMessagesWithUser);

router.post(
  "/",
  protect,
  [
    body("recipient").notEmpty().withMessage("Recipient is required"),
    body("content").trim().notEmpty().withMessage("Message content is required"),
  ],
  validateRequest,
  sendMessage
);

export default router;
