import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { fetchMyStartupsThunk } from "../../redux/slices/startupSlice.js";
import * as proposalService from "../../services/proposalService.js";

const ProposalForm = () => {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { mode: "write" },
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: startups } = useSelector((state) => state.startups);
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (!startups.length) dispatch(fetchMyStartupsThunk());
  }, [dispatch, startups.length]);

  const mode = watch("mode");

  const onSubmit = async (formData) => {
    if (mode === "upload" && !file) {
      toast.error("Please choose a PDF to upload");
      return;
    }

    try {
      const { data } = await proposalService.createProposal({
        startup: formData.startup,
        title: formData.title,
        content: mode === "write" ? formData.content : undefined,
        file: mode === "upload" ? file : undefined,
      });
      toast.success("Proposal submitted");
      navigate(`/dashboard/proposals/${data.proposal._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit proposal");
    }
  };

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight">Submit a proposal</h1>
      <p className="text-sm text-gray-500 mt-1">
        Write your proposal directly or upload a PDF — either way, AI will evaluate it for funding readiness.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
        <div>
          <label className="text-sm font-medium">Startup</label>
          <select
            className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            {...register("startup", { required: "Please select a startup" })}
            defaultValue=""
          >
            <option value="" disabled>Select a startup</option>
            {startups.map((s) => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
          {errors.startup && <p className="mt-1 text-xs text-red-500">{errors.startup.message}</p>}
          {startups.length === 0 && (
            <p className="mt-1 text-xs text-amber-600">You need to create a startup first.</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium">Proposal title</label>
          <input
            className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="Optional — defaults to startup name"
            {...register("title")}
          />
        </div>

        <div className="flex gap-2 rounded-lg border border-gray-200 dark:border-gray-800 p-1 w-fit">
          <label className={`px-4 py-1.5 rounded-md text-sm cursor-pointer ${mode === "write" ? "bg-brand-600 text-white" : "text-gray-500"}`}>
            <input type="radio" value="write" className="hidden" {...register("mode")} /> Write proposal
          </label>
          <label className={`px-4 py-1.5 rounded-md text-sm cursor-pointer ${mode === "upload" ? "bg-brand-600 text-white" : "text-gray-500"}`}>
            <input type="radio" value="upload" className="hidden" {...register("mode")} /> Upload PDF
          </label>
        </div>

        {mode === "write" ? (
          <div>
            <label className="text-sm font-medium">Proposal content</label>
            <textarea
              rows={10}
              className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Describe the problem, your solution, market, business model, traction, and team..."
              {...register("content", {
                validate: (v) => mode !== "write" || (v && v.trim().length >= 100) || "Write at least 100 characters for a meaningful evaluation",
              })}
            />
            {errors.content && <p className="mt-1 text-xs text-red-500">{errors.content.message}</p>}
          </div>
        ) : (
          <div>
            <label className="text-sm font-medium">Proposal PDF</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="mt-1 w-full text-sm"
            />
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting || startups.length === 0}
            className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700 transition disabled:opacity-60"
          >
            {isSubmitting ? "Submitting..." : "Submit for evaluation"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/dashboard/proposals")}
            className="rounded-lg border border-gray-300 dark:border-gray-700 px-5 py-2.5 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProposalForm;
