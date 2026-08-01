import api from "./api.js";

export const getMyInvestorProfile = () => api.get("/investors/profile");
export const upsertInvestorProfile = (payload) => api.post("/investors/profile", payload);
export const getRankedStartups = (params) => api.get("/investors/startups", { params });
export const compareStartups = (ids) => api.get("/investors/compare", { params: { ids: ids.join(",") } });
export const submitReview = (payload) => api.post("/investors/review", payload);
export const getStartupReviews = (startupId) => api.get(`/investors/reviews/${startupId}`);
