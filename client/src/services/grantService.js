import api from "./api.js";

export const getMyGrants = () => api.get("/grants/mine");
export const createGrant = (payload) => api.post("/grants", payload);
export const updateGrant = (id, payload) => api.patch(`/grants/${id}`, payload);
export const deleteGrant = (id) => api.delete(`/grants/${id}`);
export const getGrantApplications = (id) => api.get(`/grants/${id}/applications`);
