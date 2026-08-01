import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiX } from "react-icons/fi";
import * as applicationService from "../services/applicationService.js";

const STATUS_ORDER = ["applied", "under_review", "accepted", "rejected", "withdrawn"];
const STATUS_STYLES = {
  applied: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  under_review: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  accepted: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  rejected: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  withdrawn: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500",
};

const OPPORTUNITY_LABEL = {
  funding_opportunity: "Investor",
  grant: "Grant",
  incubator: "Incubator / Accelerator",
};

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const load = () => {
    setLoading(true);
    applicationService.getMyApplications(filter ? { status: filter } : {})
      .then(({ data }) => setApplications(data.applications))
      .finally(() => setLoading(false));
  };

  useEffect(load, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleWithdraw = async (id) => {
    try {
      await applicationService.withdrawApplication(id);
      toast.success("Application withdrawn");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to withdraw");
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Applications</h1>
          <p className="text-sm text-gray-500 mt-1">Track every application from submission to decision.</p>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          {STATUS_ORDER.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse" />)}
        </div>
      ) : applications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 py-16 text-center">
          <p className="text-gray-500">No applications yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((a) => (
            <div key={a._id} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-medium text-brand-600 uppercase tracking-wide">
                    {OPPORTUNITY_LABEL[a.opportunityType]}
                  </span>
                  <h3 className="font-semibold mt-1">
                    {a.opportunity?.title || a.opportunity?.name || "Opportunity"}
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">{a.startup?.name}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full whitespace-nowrap ${STATUS_STYLES[a.status]}`}>
                  {a.status.replace("_", " ")}
                </span>
              </div>

              {/* Simple pipeline indicator */}
              <div className="mt-4 flex items-center gap-1">
                {["applied", "under_review", "accepted"].map((stage, i) => {
                  const reached =
                    STATUS_ORDER.indexOf(a.status) >= STATUS_ORDER.indexOf(stage) &&
                    !["rejected", "withdrawn"].includes(a.status);
                  return (
                    <div key={stage} className="flex-1 flex items-center">
                      <div className={`h-1.5 flex-1 rounded-full ${reached ? "bg-brand-500" : "bg-gray-100 dark:bg-gray-800"}`} />
                      {i < 2 && <div className="w-1" />}
                    </div>
                  );
                })}
              </div>

              {a.reviewerNotes && (
                <p className="mt-3 text-sm text-gray-500 italic">"{a.reviewerNotes}"</p>
              )}

              {a.status !== "withdrawn" && a.status !== "accepted" && a.status !== "rejected" && (
                <button
                  onClick={() => handleWithdraw(a._id)}
                  className="mt-4 flex items-center gap-1.5 text-xs font-medium text-red-500 hover:underline"
                >
                  <FiX size={12} /> Withdraw application
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Applications;
