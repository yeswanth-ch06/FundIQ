import api from "./api.js";

export const getMyProposals = () => api.get("/proposals/mine");
export const getProposalById = (id) => api.get(`/proposals/${id}`);
export const runEvaluation = (id) => api.post(`/proposals/${id}/evaluate`);
export const deleteProposal = (id) => api.delete(`/proposals/${id}`);

// Written proposal (JSON) or PDF upload (FormData) — same endpoint, the
// backend branches on whether a file is attached.
export const createProposal = (payload) => {
  if (payload.file) {
    const form = new FormData();
    form.append("startup", payload.startup);
    if (payload.title) form.append("title", payload.title);
    form.append("proposalFile", payload.file);
    return api.post("/proposals", form, { headers: { "Content-Type": "multipart/form-data" } });
  }
  return api.post("/proposals", {
    startup: payload.startup,
    title: payload.title,
    content: payload.content,
  });
};
