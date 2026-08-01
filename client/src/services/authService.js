import api from "./api.js";

export const registerUser = (payload) => api.post("/auth/register", payload);
export const loginUser = (payload) => api.post("/auth/login", payload);
export const logoutUser = () => api.post("/auth/logout");
export const fetchCurrentUser = () => api.get("/auth/me");
export const updateProfile = (payload) => api.patch("/auth/profile", payload);
export const forgotPassword = (email) => api.post("/auth/forgot-password", { email });
export const resetPassword = (token, password) =>
  api.post(`/auth/reset-password/${token}`, { password });
export const verifyEmail = (token) => api.get(`/auth/verify-email/${token}`);
