import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice.js";
import startupReducer from "./slices/startupSlice.js";
import notificationReducer from "./slices/notificationSlice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    startups: startupReducer,
    notifications: notificationReducer,
    // Additional slices are added here in later phases:
    // proposals: proposalReducer,
  },
});
