import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FiPlus, FiUsers } from "react-icons/fi";
import * as grantService from "../../services/grantService.js";
import * as applicationService from "../../services/applicationService.js";

const STATUS_STYLES = {
  applied: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  under_review: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  accepted: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  rejected: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  withdrawn: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500",
};

const GovernmentPortal = () => {
  const [grants, setGrants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expandedGrant, setExpandedGrant] = useState(null);
  const [applications, setApplications] = useState([]);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const loadGrants = () => {
    setLoading(true);
    grantService.getMyGrants().then(({ data }) => setGrants(data.grants)).finally(() => setLoading(false));
  };

  useEffect(loadGrants, []);

  const onPublish = async (formData) => {
    try {
      await grantService.createGrant({
        ...formData,
        industryFocus: formData.industryFocus ? formData.industryFocus.split(",").map((s) => s.trim()) : [],
        eligibility: formData.eligibility ? formData.eligibility.split(",").map((s) => s.trim()) : [],
        amount: Number(formData.amount) || 0,
      });
      toast.success("Scheme published");
      reset();
      setShowForm(false);
      loadGrants();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to publish scheme");
    }
  };

  const viewApplications = async (grantId) => {
    if (expandedGrant === grantId) {
      setExpandedGrant(null);
      return;
    }
    setExpandedGrant(grantId);
    const { data } = await grantService.getGrantApplications(grantId);
    setApplications(data.applications);
  };

  const decide = async (applicationId, status) => {
    try {
      await applicationService.updateApplicationStatus(applicationId, { status });
      toast.success(`Application marked ${status.replace("_", " ")}`);
      setApplications((prev) => prev.map((a) => (a._id === applicationId ? { ...a, status } : a)));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Government Portal</h1>
          <p className="text-sm text-gray-500 mt-1">Publish schemes and manage funding applications.</p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 transition"
        >
          <FiPlus size={16} /> Publish scheme
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onPublish)} className="mb-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <input placeholder="Scheme name" className="rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm" {...register("name", { required: true })} />
            <input placeholder="Issuing body / department" className="rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm" {...register("issuingBody", { required: true })} />
          </div>
          <textarea placeholder="Description" rows={3} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm" {...register("description", { required: true })} />
          <div className="grid sm:grid-cols-2 gap-4">
            <input type="number" placeholder="Grant amount (USD)" className="rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm" {...register("amount")} />
            <input type="date" className="rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm" {...register("applicationDeadline")} />
          </div>
          <input placeholder="Industry focus (comma-separated)" className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm" {...register("industryFocus")} />
          <input placeholder="Eligibility criteria (comma-separated)" className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm" {...register("eligibility")} />
          <button type="submit" disabled={isSubmitting} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition disabled:opacity-60">
            {isSubmitting ? "Publishing..." : "Publish"}
          </button>
        </form>
      )}

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse" />)}</div>
      ) : grants.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 py-16 text-center">
          <p className="text-gray-500">No schemes published yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {grants.map((g) => (
            <div key={g._id} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{g.name}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{g.issuingBody} · {g.status}</p>
                </div>
                <button
                  onClick={() => viewApplications(g._id)}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  <FiUsers size={12} /> {expandedGrant === g._id ? "Hide" : "View"} applications
                </button>
              </div>

              {expandedGrant === g._id && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
                  {applications.length === 0 ? (
                    <p className="text-sm text-gray-400">No applications yet.</p>
                  ) : (
                    applications.map((a) => (
                      <div key={a._id} className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-gray-800/50 px-3 py-2">
                        <div>
                          <p className="text-sm font-medium">{a.startup?.name}</p>
                          <p className="text-xs text-gray-500">{a.applicant?.name} · {a.applicant?.organization}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLES[a.status]}`}>{a.status.replace("_", " ")}</span>
                          {a.status === "applied" && (
                            <>
                              <button onClick={() => decide(a._id, "under_review")} className="text-xs text-brand-600 hover:underline">Review</button>
                            </>
                          )}
                          {["applied", "under_review"].includes(a.status) && (
                            <>
                              <button onClick={() => decide(a._id, "accepted")} className="text-xs text-emerald-600 hover:underline">Approve</button>
                              <button onClick={() => decide(a._id, "rejected")} className="text-xs text-red-500 hover:underline">Reject</button>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GovernmentPortal;
