import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FiTrendingUp, FiMessageSquare } from "react-icons/fi";
import * as investorService from "../../services/investorService.js";

const DECISIONS = [
  { value: "meeting_requested", label: "Request meeting" },
  { value: "accepted", label: "Accept" },
  { value: "rejected", label: "Pass" },
  { value: "feedback_only", label: "Feedback only" },
];

const InvestorPortal = () => {
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeReview, setActiveReview] = useState(null); // startup id being reviewed
  const [feedback, setFeedback] = useState("");
  const [decision, setDecision] = useState("meeting_requested");
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    investorService.getRankedStartups()
      .then(({ data }) => setStartups(data.startups))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openReview = (id) => {
    setActiveReview(id);
    setFeedback("");
    setDecision("meeting_requested");
  };

  const submitReview = async () => {
    if (!feedback.trim()) {
      toast.error("Please add feedback before submitting");
      return;
    }
    setSubmitting(true);
    try {
      await investorService.submitReview({ startup: activeReview, decision, feedback });
      toast.success("Review submitted");
      setActiveReview(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Investor Portal</h1>
        <p className="text-sm text-gray-500 mt-1">Startups ranked by AI funding-readiness score.</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse" />)}
        </div>
      ) : startups.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 py-16 text-center">
          <p className="text-gray-500">No published startups match your view yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {startups.map((s) => (
            <div key={s._id} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{s.name}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{s.industry} · {s.stage?.replace("_", " ")} · {s.location}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">{s.tagline || s.description}</p>
                </div>
                {s.aiScore != null && (
                  <div className="flex items-center gap-1.5 rounded-lg bg-brand-50 dark:bg-brand-900/30 px-3 py-1.5 text-brand-700 dark:text-brand-400 flex-shrink-0">
                    <FiTrendingUp size={14} />
                    <span className="text-sm font-semibold">{s.aiScore}/100</span>
                  </div>
                )}
              </div>

              <div className="mt-4 flex gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                <Link
                  to={`/startups/${s._id}`}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  View profile
                </Link>
                <button
                  onClick={() => openReview(s._id)}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  <FiMessageSquare size={12} /> Review
                </button>
              </div>

              {activeReview === s._id && (
                <div className="mt-4 rounded-lg border border-gray-200 dark:border-gray-800 p-4 space-y-3">
                  <select
                    value={decision}
                    onChange={(e) => setDecision(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                  >
                    {DECISIONS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </select>
                  <textarea
                    rows={3}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Feedback for the founder..."
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={submitReview}
                      disabled={submitting}
                      className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition disabled:opacity-60"
                    >
                      {submitting ? "Sending..." : "Send review"}
                    </button>
                    <button
                      onClick={() => setActiveReview(null)}
                      className="rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InvestorPortal;
