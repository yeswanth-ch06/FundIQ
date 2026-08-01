import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiBell, FiLogOut, FiChevronDown } from "react-icons/fi";
import { logoutThunk } from "../../redux/slices/authSlice.js";
import { fetchNotificationsThunk, markAllReadThunk } from "../../redux/slices/notificationSlice.js";

const Navbar = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { items, unreadCount } = useSelector((state) => state.notifications);
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    dispatch(fetchNotificationsThunk());
  }, [dispatch]);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <header className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 py-3">
      <div className="text-sm text-gray-500 capitalize">{user?.role?.replace("_", " ")}</div>

      <div ref={panelRef} className="flex items-center gap-4">
        <div className="relative">
          <button
            onClick={() => setOpen((o) => !o)}
            className="relative rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            aria-label="Notifications"
          >
            <FiBell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg z-20">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <span className="text-sm font-semibold">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={() => dispatch(markAllReadThunk())}
                    className="text-xs text-brand-600 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {items.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-gray-400">
                    You're all caught up.
                  </p>
                ) : (
                  items.map((n) => (
                    <div
                      key={n._id}
                      className={`px-4 py-3 text-sm border-b border-gray-50 dark:border-gray-800 last:border-0 ${
                        !n.isRead ? "bg-brand-50/50 dark:bg-brand-900/10" : ""
                      }`}
                    >
                      <p className="font-medium">{n.title}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <div className="h-8 w-8 rounded-full bg-brand-600 text-white flex items-center justify-center text-sm font-medium">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <span className="text-sm font-medium hidden sm:block">{user?.name}</span>
            <FiChevronDown size={14} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-44 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg z-20 py-1">
              <button
                onClick={() => dispatch(logoutThunk())}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <FiLogOut size={14} /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
