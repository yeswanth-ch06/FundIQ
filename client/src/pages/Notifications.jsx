import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchNotificationsThunk, markAllReadThunk } from "../redux/slices/notificationSlice.js";

const Notifications = () => {
  const dispatch = useDispatch();
  const { items, unreadCount } = useSelector((state) => state.notifications);

  useEffect(() => {
    dispatch(fetchNotificationsThunk());
  }, [dispatch]);

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
        {unreadCount > 0 && (
          <button
            onClick={() => dispatch(markAllReadThunk())}
            className="text-sm text-brand-600 hover:underline"
          >
            Mark all read
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-gray-400">Nothing here yet.</p>
      ) : (
        <div className="space-y-2">
          {items.map((n) => (
            <div
              key={n._id}
              className={`rounded-xl border border-gray-200 dark:border-gray-800 p-4 ${
                !n.isRead ? "bg-brand-50/50 dark:bg-brand-900/10" : "bg-white dark:bg-gray-900"
              }`}
            >
              <p className="font-medium text-sm">{n.title}</p>
              <p className="text-sm text-gray-500 mt-1">{n.message}</p>
              <p className="text-xs text-gray-400 mt-2">
                {new Date(n.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
