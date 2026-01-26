import axios from "axios";

// 🚀 PRODUCTION-READY: Auto-detects environment
const isProduction = window.location.hostname !== 'localhost' && 
                   window.location.hostname !== '127.0.0.1';

const API = axios.create({
  baseURL: isProduction 
    ? "https://synapso-backend.onrender.com"  // ✅ PRODUCTION
    : "http://127.0.0.1:8000",               // ✅ LOCAL DEVELOPMENT
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
