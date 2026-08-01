import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { updateProfile as updateProfileApi } from "../services/authService.js";
import { fetchMeThunk } from "../redux/slices/authSlice.js";

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({ defaultValues: user });

  const onSubmit = async (data) => {
    try {
      await updateProfileApi(data);
      toast.success("Profile updated");
      dispatch(fetchMeThunk());
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    }
  };

  return (
    <div className="p-8 max-w-xl">
      <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
      <p className="text-sm text-gray-500 mt-1">Update how you appear across the platform.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div>
          <label className="text-sm font-medium">Full name</label>
          <input
            className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            {...register("name")}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Organization</label>
          <input
            className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            {...register("organization")}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Location</label>
          <input
            className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            {...register("location")}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Bio</label>
          <textarea
            rows={4}
            className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            {...register("bio")}
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700 transition disabled:opacity-60"
        >
          {isSubmitting ? "Saving..." : "Save changes"}
        </button>
      </form>
    </div>
  );
};

export default Profile;
