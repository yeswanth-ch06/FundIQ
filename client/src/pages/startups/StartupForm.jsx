import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  createStartupThunk,
  updateStartupThunk,
  fetchMyStartupsThunk,
} from "../../redux/slices/startupSlice.js";
import * as startupService from "../../services/startupService.js";

const INDUSTRIES = [
  "FinTech", "HealthTech", "EdTech", "AgriTech", "CleanTech", "AI/ML",
  "E-commerce", "SaaS", "Biotech", "Logistics", "Other",
];
const STAGES = [
  { value: "idea", label: "Idea" },
  { value: "prototype", label: "Prototype" },
  { value: "mvp", label: "MVP" },
  { value: "early_traction", label: "Early Traction" },
  { value: "growth", label: "Growth" },
  { value: "scale", label: "Scale" },
];

const StartupForm = () => {
  const { id } = useParams(); // present when editing
  const isEdit = Boolean(id);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items } = useSelector((state) => state.startups);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const [logoFile, setLogoFile] = useState(null);
  const [pitchDeckFile, setPitchDeckFile] = useState(null);

  useEffect(() => {
    if (!items.length) dispatch(fetchMyStartupsThunk());
  }, [dispatch, items.length]);

  useEffect(() => {
    if (isEdit && items.length) {
      const existing = items.find((s) => s._id === id);
      if (existing) {
        reset({
          ...existing,
          technology: Array.isArray(existing.technology) ? existing.technology.join(", ") : existing.technology || "",
        });
      }
    }
  }, [isEdit, id, items, reset]);

  const onSubmit = async (formData) => {
    const payload = {
      ...formData,
      technology: Array.isArray(formData.technology)
        ? formData.technology
        : (formData.technology || "").split(",").map((t) => t.trim()).filter(Boolean),
      fundingSought: Number(formData.fundingSought) || 0,
      teamSize: Number(formData.teamSize) || 1,
    };

    let startupId = id;
    if (isEdit) {
      const result = await dispatch(updateStartupThunk({ id, payload }));
      if (!updateStartupThunk.fulfilled.match(result)) return;
    } else {
      const result = await dispatch(createStartupThunk(payload));
      if (!createStartupThunk.fulfilled.match(result)) return;
      startupId = result.payload._id;
    }

    // Uploads run after the startup record exists, since they attach to its id.
    try {
      if (logoFile) await startupService.uploadLogo(startupId, logoFile);
      if (pitchDeckFile) await startupService.uploadPitchDeck(startupId, pitchDeckFile);
    } catch (err) {
      toast.error("Startup saved, but a file upload failed. You can retry from the edit page.");
    }

    navigate("/dashboard/startups");
  };

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight">
        {isEdit ? "Edit startup" : "Create a new startup"}
      </h1>
      <p className="text-sm text-gray-500 mt-1">
        This profile is what investors, incubators, and government schemes will see.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
        <div>
          <label className="text-sm font-medium">Startup name</label>
          <input
            className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            {...register("name", { required: "Name is required" })}
          />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
        </div>

        <div>
          <label className="text-sm font-medium">Tagline</label>
          <input
            className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="One line describing what you do"
            {...register("tagline")}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Description</label>
          <textarea
            rows={4}
            className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            {...register("description", { required: "Description is required" })}
          />
          {errors.description && (
            <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Industry</label>
            <select
              className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              {...register("industry", { required: "Industry is required" })}
              defaultValue=""
            >
              <option value="" disabled>Select industry</option>
              {INDUSTRIES.map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
            {errors.industry && <p className="mt-1 text-xs text-red-500">{errors.industry.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium">Stage</label>
            <select
              className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              {...register("stage")}
              defaultValue="idea"
            >
              {STAGES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Location</label>
            <input
              className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              {...register("location")}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Team size</label>
            <input
              type="number"
              min={1}
              className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              {...register("teamSize")}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Technology (comma-separated)</label>
          <input
            className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="React, TensorFlow, Blockchain"
            {...register("technology")}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Funding sought (USD)</label>
          <input
            type="number"
            min={0}
            className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            {...register("fundingSought")}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Logo</label>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
              className="mt-1 w-full text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Pitch deck (PDF)</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setPitchDeckFile(e.target.files?.[0] || null)}
              className="mt-1 w-full text-sm"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700 transition disabled:opacity-60"
          >
            {isSubmitting ? "Saving..." : isEdit ? "Save changes" : "Create startup"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/dashboard/startups")}
            className="rounded-lg border border-gray-300 dark:border-gray-700 px-5 py-2.5 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default StartupForm;
