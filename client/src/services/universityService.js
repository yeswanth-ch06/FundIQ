import api from "./api.js";

export const getStudentStartups = (params) => api.get("/university/student-startups", { params });
export const getUniversityAnalytics = () => api.get("/university/analytics");
export const submitMentorshipFeedback = (payload) => api.post("/university/mentorship", payload);
