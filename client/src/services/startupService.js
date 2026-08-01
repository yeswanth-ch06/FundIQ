import api from "./api.js";

export const createStartup = (payload) => api.post("/startups", payload);
export const getMyStartups = () => api.get("/startups/mine");
export const getStartups = (params) => api.get("/startups", { params });
export const getStartupById = (id) => api.get(`/startups/${id}`);
export const updateStartup = (id, payload) => api.patch(`/startups/${id}`, payload);
export const deleteStartup = (id) => api.delete(`/startups/${id}`);

export const uploadLogo = (id, file) => {
  const form = new FormData();
  form.append("logo", file);
  return api.post(`/startups/${id}/logo`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const uploadPitchDeck = (id, file) => {
  const form = new FormData();
  form.append("pitchDeck", file);
  return api.post(`/startups/${id}/pitch-deck`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const uploadBusinessPlan = (id, file) => {
  const form = new FormData();
  form.append("businessPlan", file);
  return api.post(`/startups/${id}/business-plan`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
