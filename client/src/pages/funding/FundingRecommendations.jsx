import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { FiTarget, FiExternalLink } from "react-icons/fi";
import { fetchMyStartupsThunk } from "../../redux/slices/startupSlice.js";
import * as fundingService from "../../services/fundingService.js";
import * as applicationService from "../../services/applicationService.js";

const TYPE_LABELS = {
  funding_opportunity: "Investor",
  grant: "Grant",
  incubator: "Incubator / Accelerator",
};

const FundingRecommendations = () => {
  const dispatch = useDispatch();
  const { items: startups } = useSelector((state) => state.startups);
  const [selected, setSelected] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [applyingId, setApplyingId] = useState(null);
  const [appliedIds, setAppliedIds] = useState(new Set());

  useEffect(() => {
    if (!startups.length) dispatch(fetchMyStartupsThunk());
  }, [dispatch, startups.length]);

  useEffect(() => {
    if (startups.length && !selected) setSelected(startups[0]._id);
  }, [startups, selected]);

  useEffect(() => {
    if (!selected) return;
    setLoading(true);
    fundingService.getRecommendations(selected)
      .then(({ data }) => setRecommendations(data.recommendations))
      .finally(() => setLoading(false));
  }, [selected]);

  const handleApply = async (r) => {
    setApplyingId(r.item._id);
    try {
      await applicationService.createApplication({
        startup: selected,
        opportunityType: r.type,
        opportunity: r.item._id,
      });
      setAppliedIds((prev) => new Set(prev).add(r.item._id));
      toast.success("Application submitted — track it under Applications");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to apply");
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Funding Recommendations</h1>
          <p className="text-sm text-gray-500 mt-1">Matched investors, grants, and programs for your startup.</p>
        </div>
        {startups.length > 0 && (
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
          >
            {startups.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse" />)}
        </div>
      ) : recommendations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 py-16 text-center">
          <p className="text-gray-500">No matches yet — check back once more opportunities are posted.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recommendations.map((r, i) => (
            <div key={i} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-medium text-brand-600 uppercase tracking-wide">{TYPE_LABELS[r.type]}</span>
                  <h3 className="font-semibold mt-1">{r.item.title || r.item.name}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{r.item.description}</p>
                </div>
                <div className="flex items-center gap-1.5 rounded-lg bg-brand-50 dark:bg-brand-900/30 px-3 py-1.5 text-brand-700 dark:text-brand-400 flex-shrink-0">
                  <FiTarget size={14} />
                  <span className="text-sm font-semibold">{r.score}%</span>
                </div>
              </div>
              {r.reasons?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {r.reasons.map((reason, idx) => (
                    <span key={idx} className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                      {reason}
                    </span>
                  ))}
                </div>
              )}
              {r.item.applicationUrl && (
                <a
                  href={r.item.applicationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline"
                >
                  Apply <FiExternalLink size={12} />
                </a>
              )}
              <div className="mt-3">
                {appliedIds.has(r.item._id) ? (
                  <span className="text-xs font-medium text-emerald-600">✓ Applied</span>
                ) : (
                  <button
                    onClick={() => handleApply(r)}
                    disabled={applyingId === r.item._id}
                    className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700 transition disabled:opacity-60"
                  >
                    {applyingId === r.item._id ? "Applying..." : "Track application"}
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

export default FundingRecommendations;
