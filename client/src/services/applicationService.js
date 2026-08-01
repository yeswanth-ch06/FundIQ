import api from "./api.js";

export const createApplication = (payload) => api.post("/applications", payload);
export const getMyApplications = (params) => api.get("/applications/mine", { params });
export const getApplicationById = (id) => api.get(`/applications/${id}`);
export const updateApplicationStatus = (id, payload) => api.patch(`/applications/${id}/status`, payload);
export const withdrawApplication = (id) => api.delete(`/applications/${id}`);
