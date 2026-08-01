import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { FiSend } from "react-icons/fi";
import * as messageService from "../services/messageService.js";

const POLL_MS = 5000;

const Messages = () => {
  const { userId } = useParams(); // active conversation partner, if any
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [conversations, setConversations] = useState([]);
  const [thread, setThread] = useState(null); // { otherUser, messages }
  const [draft, setDraft] = useState("");
  const [loadingList, setLoadingList] = useState(true);
  const bottomRef = useRef(null);

  const loadConversations = () => {
    messageService.getConversations()
      .then(({ data }) => setConversations(data.conversations))
      .finally(() => setLoadingList(false));
  };

  const loadThread = () => {
    if (!userId) return;
    messageService.getMessagesWithUser(userId).then(({ data }) => {
      setThread({ otherUser: data.otherUser, messages: data.messages });
    });
  };

  useEffect(loadConversations, []);
  useEffect(() => {
    setThread(null);
    loadThread();
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Lightweight polling stands in for a WebSocket connection here — good
  // enough for a dashboard inbox without adding Socket.io infrastructure.
  useEffect(() => {
    const interval = setInterval(() => {
      loadThread();
      loadConversations();
    }, POLL_MS);
    return () => clearInterval(interval);
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread?.messages?.length]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!draft.trim() || !userId) return;
    const content = draft;
    setDraft("");
    await messageService.sendMessage(userId, content);
    loadThread();
    loadConversations();
  };

  return (
    <div className="flex h-[calc(100vh-57px)]">
      {/* Conversation list */}
      <div className="w-72 border-r border-gray-200 dark:border-gray-800 overflow-y-auto">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <h1 className="font-semibold">Messages</h1>
        </div>
        {loadingList ? (
          <div className="p-4 space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-12 rounded-lg bg-gray-200 dark:bg-gray-800 animate-pulse" />)}
          </div>
        ) : conversations.length === 0 ? (
          <p className="p-4 text-sm text-gray-400">No conversations yet.</p>
        ) : (
          conversations.map((c) => (
            <button
              key={c.conversationId}
              onClick={() => navigate(`/dashboard/messages/${c.otherUser?._id}`)}
              className={`w-full text-left px-4 py-3 border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition ${
                userId === c.otherUser?._id ? "bg-brand-50 dark:bg-brand-900/20" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{c.otherUser?.name || "Unknown"}</span>
                {c.unreadCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[10px] font-medium text-white">
                    {c.unreadCount}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 truncate mt-0.5">{c.lastMessage?.content}</p>
            </button>
          ))
        )}
      </div>

      {/* Thread */}
      <div className="flex-1 flex flex-col">
        {!userId ? (
          <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
            Select a conversation to start messaging.
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-gray-100 dark:border-gray-800">
              <p className="font-medium text-sm">{thread?.otherUser?.name}</p>
              <p className="text-xs text-gray-500">{thread?.otherUser?.organization}</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {thread?.messages?.map((m) => (
                <MessageBubble key={m._id} message={m} currentUserId={user?._id} />
              ))}
              <div ref={bottomRef} />
            </div>
            <form onSubmit={handleSend} className="p-4 border-t border-gray-100 dark:border-gray-800 flex gap-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button
                type="submit"
                className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition"
              >
                <FiSend size={14} /> Send
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

const MessageBubble = ({ message, currentUserId }) => {
  const isOwn = String(message.sender) === String(currentUserId);
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-xs rounded-2xl px-4 py-2 text-sm ${
          isOwn
            ? "bg-brand-600 text-white"
            : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
};

export default Messages;
