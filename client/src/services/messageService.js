import api from "./api.js";

export const getConversations = () => api.get("/messages/conversations");
export const getMessagesWithUser = (userId) => api.get(`/messages/${userId}`);
export const sendMessage = (recipient, content) => api.post("/messages", { recipient, content });
export const getUnreadMessageCount = () => api.get("/messages/unread-count");
