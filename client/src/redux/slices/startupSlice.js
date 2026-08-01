import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import * as startupService from "../../services/startupService.js";

export const fetchMyStartupsThunk = createAsyncThunk(
  "startups/fetchMine",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await startupService.getMyStartups();
      return data.startups;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load startups");
    }
  }
);

export const createStartupThunk = createAsyncThunk(
  "startups/create",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await startupService.createStartup(payload);
      toast.success("Startup created");
      return data.startup;
    } catch (err) {
      const message = err.response?.data?.message || "Failed to create startup";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateStartupThunk = createAsyncThunk(
  "startups/update",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const { data } = await startupService.updateStartup(id, payload);
      toast.success("Startup updated");
      return data.startup;
    } catch (err) {
      const message = err.response?.data?.message || "Failed to update startup";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deleteStartupThunk = createAsyncThunk(
  "startups/delete",
  async (id, { rejectWithValue }) => {
    try {
      await startupService.deleteStartup(id);
      toast.success("Startup deleted");
      return id;
    } catch (err) {
      const message = err.response?.data?.message || "Failed to delete startup";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const startupSlice = createSlice({
  name: "startups",
  initialState: {
    items: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyStartupsThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMyStartupsThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchMyStartupsThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(createStartupThunk.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateStartupThunk.fulfilled, (state, action) => {
        const idx = state.items.findIndex((s) => s._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteStartupThunk.fulfilled, (state, action) => {
        state.items = state.items.filter((s) => s._id !== action.payload);
      });
  },
});

export default startupSlice.reducer;
