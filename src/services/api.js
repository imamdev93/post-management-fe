import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default {
  // Auth
  register(data) {
    return api.post("/register", data);
  },
  login(data) {
    return api.post("/login", data);
  },
  logout() {
    return api.post("/logout");
  },
  getUser() {
    return api.get("/user");
  },

  // Posts CRUD
  getPosts(params) {
    return api.get("/posts", { params });
  },
  getPost(id) {
    return api.get(`/posts/${id}`);
  },
  createPost(data) {
    return api.post("/posts", data);
  },
  updatePost(id, data) {
    return api.put(`/posts/${id}`, data);
  },
  deletePost(id) {
    return api.delete(`/posts/${id}`);
  },

  // Sync
  syncData() {
    return api.post("/posts/sync");
  },
  getLastSync() {
    return api.get("/posts/sync/last");
  },

  // Dashboard
  getDashboard(params) {
    return api.get("/dashboard", { params });
  },
  getCategories() {
    return api.get("/posts/data/categories");
  },
};
