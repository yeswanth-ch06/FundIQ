import axios from "axios";

// In development, Vite proxies /api to localhost:5000 (same-origin).
// In production, frontend (Vercel) and backend (Render) are different
// origins, so VITE_API_URL must point at the deployed backend's /api path.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true, // sends the httpOnly refresh-token cookie
});

// Attach the in-memory access token to every request.
let accessToken = null;
export const setAccessToken = (token) => {
  accessToken = token;
};

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// On a 401, try refreshing the access token once, then retry the request.
let isRefreshing = false;
let queue = [];

const processQueue = (error, token = null) => {
  queue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  queue = [];
};

// Requests that should never trigger a refresh-and-retry cycle: the auth
// endpoints themselves (a 401 from /login or /register is a real answer,
// not an expired session) and the silent session-restore check on app load
// (a 401 there just means "not logged in" — it shouldn't force a redirect).
const NO_REFRESH_PATHS = ["/auth/login", "/auth/register", "/auth/refresh", "/auth/me"];

const isNoRefreshPath = (url = "") => NO_REFRESH_PATHS.some((p) => url.includes(p));

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isNoRefreshPath(originalRequest.url)
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL || "/api"}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        setAccessToken(data.accessToken);
        processQueue(null, data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        setAccessToken(null);
        // Only force a redirect if we're on a page that assumes a session
        // exists — never bounce someone who's already on a public page.
        if (!["/", "/login", "/register"].includes(window.location.pathname)) {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
