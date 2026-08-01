import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiPlus, FiFileText } from "react-icons/fi";
import * as proposalService from "../../services/proposalService.js";

const STATUS_STYLES = {
  draft: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  submitted: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  evaluated: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  under_review: "bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400",
};

const ProposalList = () => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    proposalService.getMyProposals()
      .then(({ data }) => setProposals(data.proposals))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Proposals</h1>
          <p className="text-sm text-gray-500 mt-1">Submit proposals for AI funding-readiness evaluation.</p>
        </div>
        <Link
          to="/dashboard/proposals/new"
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 transition"
        >
          <FiPlus size={16} /> New proposal
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse" />)}
        </div>
      ) : proposals.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 py-16 text-center">
          <p className="text-gray-500">No proposals submitted yet.</p>
          <Link to="/dashboard/proposals/new" className="mt-3 inline-block text-sm font-medium text-brand-600 hover:underline">
            Submit your first proposal
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {proposals.map((p) => (
            <Link
              key={p._id}
              to={`/dashboard/proposals/${p._id}`}
              className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 hover:shadow-sm transition"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-brand-50 dark:bg-brand-900/30 p-2 text-brand-600 dark:text-brand-400">
                  <FiFileText size={18} />
                </div>
                <div>
                  <p className="font-medium text-sm">{p.title}</p>
                  <p className="text-xs text-gray-500">{p.startup?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {p.aiEvaluation?.overallFundingReadiness != null && (
                  <span className="text-sm font-semibold text-brand-600">{p.aiEvaluation.overallFundingReadiness}/100</span>
                )}
                <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLES[p.status] || STATUS_STYLES.draft}`}>
                  {p.status.replace("_", " ")}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProposalList;
