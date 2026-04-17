import axios from "axios";
import { getToken, logoutUser } from "../auth/auth";

const API = axios.create({
  baseURL: "http://localhost:8000",
  headers: {
    "Content-Type": "application/json"
  }
});

// 🔐 Attach token to every request
API.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ⚠️ Handle errors globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      // 🔥 Token expired / invalid
      logoutUser();
    }

    if (status === 403) {
      // 🔥 Access denied (RBAC)
      alert("You don’t have permission to perform this action");
    }

    return Promise.reject(error);
  }
);

export default API;