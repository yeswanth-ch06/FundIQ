import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiMessageSquare } from "react-icons/fi";
import * as universityService from "../../services/universityService.js";

const UniversityPortal = () => {
  const [startups, setStartups] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeMentor, setActiveMentor] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      universityService.getStudentStartups(),
      universityService.getUniversityAnalytics(),
    ])
      .then(([startupsRes, analyticsRes]) => {
        setStartups(startupsRes.data.startups);
        setAnalytics(analyticsRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const submitFeedback = async (startupId) => {
    if (!feedback.trim()) {
      toast.error("Please add feedback before submitting");
      return;
    }
    setSubmitting(true);
    try {
      await universityService.submitMentorshipFeedback({ startup: startupId, feedback });
      toast.success("Mentorship feedback sent");
      setActiveMentor(null);
      setFeedback("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send feedback");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">University Portal</h1>
        <p className="text-sm text-gray-500 mt-1">Track student startups and offer mentorship.</p>
      </div>

      {analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
            <p className="text-xs text-gray-500">Students</p>
            <p className="text-xl font-semibold mt-1">{analytics.totalStudents}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
            <p className="text-xs text-gray-500">Student startups</p>
            <p className="text-xl font-semibold mt-1">{analytics.totalStartups}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 col-span-2">
            <p className="text-xs text-gray-500 mb-2">By stage</p>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(analytics.byStage).map(([stage, count]) => (
                <span key={stage} className="text-xs px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400">
                  {stage.replace("_", " ")}: {count}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse" />)}</div>
      ) : startups.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 py-16 text-center">
          <p className="text-gray-500">No student startups found yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {startups.map((s) => (
            <div key={s._id} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{s.name}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{s.owner?.name} · {s.industry} · {s.stage?.replace("_", " ")}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">{s.tagline || s.description}</p>
                </div>
                <button
                  onClick={() => setActiveMentor(activeMentor === s._id ? null : s._id)}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition flex-shrink-0"
                >
                  <FiMessageSquare size={12} /> Mentor
                </button>
              </div>

              {activeMentor === s._id && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
                  <textarea
                    rows={3}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Mentorship feedback or guidance..."
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                  />
                  <button
                    onClick={() => submitFeedback(s._id)}
                    disabled={submitting}
                    className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition disabled:opacity-60"
                  >
                    {submitting ? "Sending..." : "Send feedback"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UniversityPortal;
