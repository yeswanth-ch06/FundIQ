import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FiPlus, FiEdit2, FiTrash2, FiEye } from "react-icons/fi";
import { fetchMyStartupsThunk, deleteStartupThunk } from "../../redux/slices/startupSlice.js";

const STAGE_LABELS = {
  idea: "Idea",
  prototype: "Prototype",
  mvp: "MVP",
  early_traction: "Early Traction",
  growth: "Growth",
  scale: "Scale",
};

const StartupList = () => {
  const dispatch = useDispatch();
  const { items, status } = useSelector((state) => state.startups);
  const [confirmId, setConfirmId] = useState(null);

  useEffect(() => {
    dispatch(fetchMyStartupsThunk());
  }, [dispatch]);

  const handleDelete = (id) => {
    dispatch(deleteStartupThunk(id));
    setConfirmId(null);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My Startups</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your startup profiles and track their status.</p>
        </div>
        <Link
          to="/dashboard/startups/new"
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 transition"
        >
          <FiPlus size={16} /> New startup
        </Link>
      </div>

      {status === "loading" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 py-16 text-center">
          <p className="text-gray-500">You haven't created a startup profile yet.</p>
          <Link to="/dashboard/startups/new" className="mt-3 inline-block text-sm font-medium text-brand-600 hover:underline">
            Create your first startup
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((s) => (
            <div key={s._id} className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 flex flex-col">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{s.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{s.industry}</p>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${
                    s.status === "published"
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                  }`}
                >
                  {s.status}
                </span>
              </div>

              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 line-clamp-2 flex-1">
                {s.tagline || s.description}
              </p>

              <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                <span>{STAGE_LABELS[s.stage] || s.stage}</span>
                <span>{s.viewCount || 0} views</span>
              </div>

              <div className="mt-4 flex gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                <Link
                  to={`/dashboard/startups/${s._id}/edit`}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  <FiEdit2 size={12} /> Edit
                </Link>
                <Link
                  to={`/startups/${s._id}`}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  <FiEye size={12} /> View
                </Link>
                {confirmId === s._id ? (
                  <button
                    onClick={() => handleDelete(s._id)}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 ml-auto"
                  >
                    Confirm delete?
                  </button>
                ) : (
                  <button
                    onClick={() => setConfirmId(s._id)}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition ml-auto"
                  >
                    <FiTrash2 size={12} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StartupList;
