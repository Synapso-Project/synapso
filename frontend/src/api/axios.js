import axios from "axios";

// 🔥 FORCE PRODUCTION - NO DETECTION LOGIC
const API = axios.create({
  baseURL: "https://synapso-backend.onrender.com"
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
