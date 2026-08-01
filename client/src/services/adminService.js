import api from "./api.js";

export const getUsers = (params) => api.get("/admin/users", { params });
export const setUserStatus = (id, isActive) => api.patch(`/admin/users/${id}/status`, { isActive });
export const setUserRole = (id, role) => api.patch(`/admin/users/${id}/role`, { role });
export const getAllStartups = (params) => api.get("/admin/startups", { params });
export const deleteStartupAsAdmin = (id) => api.delete(`/admin/startups/${id}`);
export const getAllGrants = () => api.get("/admin/grants");
export const getAllApplications = (params) => api.get("/admin/applications", { params });
export const getReports = () => api.get("/admin/reports");
export const getLogs = (params) => api.get("/admin/logs", { params });
