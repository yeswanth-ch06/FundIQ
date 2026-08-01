import Message from "../models/Message.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import asyncHandler from "../middleware/asyncHandler.js";
import AppError from "../utils/AppError.js";

// A conversation id is just the two user ids sorted and joined, so both
// participants always compute the same id independently.
const conversationId = (a, b) => [String(a), String(b)].sort().join("_");

// @route   GET /api/messages/conversations
// Lists every conversation the user is part of, with the latest message
// and an unread count for each — what a message inbox needs.
export const getConversations = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const conversations = await Message.aggregate([
    { $match: { $or: [{ sender: userId }, { recipient: userId }] } },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: "$conversationId",
        lastMessage: { $first: "$$ROOT" },
        unreadCount: {
          $sum: {
            $cond: [{ $and: [{ $eq: ["$recipient", userId] }, { $eq: ["$isRead", false] }] }, 1, 0],
          },
        },
      },
    },
    { $sort: { "lastMessage.createdAt": -1 } },
  ]);

  // Attach the other participant's basic profile info for display.
  const otherUserIds = conversations.map((c) => {
    const { sender, recipient } = c.lastMessage;
    return String(sender) === String(userId) ? recipient : sender;
  });
  const users = await User.find({ _id: { $in: otherUserIds } }).select("name organization role avatar");
  const userMap = new Map(users.map((u) => [String(u._id), u]));

  const result = conversations.map((c) => {
    const { sender, recipient } = c.lastMessage;
    const otherId = String(sender) === String(userId) ? recipient : sender;
    return {
      conversationId: c._id,
      otherUser: userMap.get(String(otherId)) || null,
      lastMessage: c.lastMessage,
      unreadCount: c.unreadCount,
    };
  });

  res.status(200).json({ success: true, conversations: result });
});

// @route   GET /api/messages/:userId
// Message history with a specific user, marking their messages as read.
export const getMessagesWithUser = asyncHandler(async (req, res, next) => {
  const otherUserId = req.params.userId;
  const otherUser = await User.findById(otherUserId).select("name organization role avatar");
  if (!otherUser) return next(new AppError("User not found", 404));

  const convId = conversationId(req.user._id, otherUserId);
  const messages = await Message.find({ conversationId: convId }).sort({ createdAt: 1 });

  await Message.updateMany(
    { conversationId: convId, recipient: req.user._id, isRead: false },
    { isRead: true }
  );

  res.status(200).json({ success: true, otherUser, messages });
});

// @route   POST /api/messages
export const sendMessage = asyncHandler(async (req, res, next) => {
  const { recipient, content } = req.body;
  if (String(recipient) === String(req.user._id)) {
    return next(new AppError("You cannot message yourself", 400));
  }

  const recipientUser = await User.findById(recipient);
  if (!recipientUser) return next(new AppError("Recipient not found", 404));

  const message = await Message.create({
    conversationId: conversationId(req.user._id, recipient),
    sender: req.user._id,
    recipient,
    content,
  });

  await Notification.create({
    user: recipient,
    type: "message",
    title: "New message",
    message: `${req.user.name} sent you a message.`,
    link: `/dashboard/messages/${req.user._id}`,
  });

  res.status(201).json({ success: true, message });
});

// @route   GET /api/messages/unread-count
export const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Message.countDocuments({ recipient: req.user._id, isRead: false });
  res.status(200).json({ success: true, unreadCount: count });
});
