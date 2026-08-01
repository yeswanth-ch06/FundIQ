import api from "./api.js";

export const getDashboardSummary = () => api.get("/analytics/dashboard");
export const getRecentActivity = () => api.get("/analytics/recent-activity");
