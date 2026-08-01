import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as notificationService from "../../services/notificationService.js";
import * as analyticsService from "../../services/analyticsService.js";

export const fetchNotificationsThunk = createAsyncThunk(
  "notifications/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await notificationService.getNotifications();
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

export const markAllReadThunk = createAsyncThunk("notifications/markAllRead", async () => {
  await notificationService.markAllNotificationsRead();
});

export const fetchDashboardThunk = createAsyncThunk(
  "notifications/fetchDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await analyticsService.getDashboardSummary();
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    items: [],
    unreadCount: 0,
    dashboard: null,
    status: "idle",
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotificationsThunk.fulfilled, (state, action) => {
        state.items = action.payload.notifications;
        state.unreadCount = action.payload.unreadCount;
      })
      .addCase(markAllReadThunk.fulfilled, (state) => {
        state.items = state.items.map((n) => ({ ...n, isRead: true }));
        state.unreadCount = 0;
      })
      .addCase(fetchDashboardThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchDashboardThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.dashboard = action.payload;
      })
      .addCase(fetchDashboardThunk.rejected, (state) => {
        state.status = "failed";
      });
  },
});

export default notificationSlice.reducer;
