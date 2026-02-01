import axios from "axios";

const API = axios.create({
  baseURL: "https://synapso-app.onrender.com"  // ✅ YOUR ACTUAL BACKEND
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
