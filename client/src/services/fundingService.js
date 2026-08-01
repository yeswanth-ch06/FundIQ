import api from "./api.js";

export const getRecommendations = (startupId) => api.get(`/funding/recommendations/${startupId}`);
export const getFundingOpportunities = (params) => api.get("/funding/opportunities", { params });
export const createFundingOpportunity = (payload) => api.post("/funding/opportunities", payload);
