import axios from "axios";

// 🚀 BULLETPROOF PRODUCTION DETECTION
const isProduction = import.meta.env.PROD || 
                    window.location.hostname !== 'localhost' && 
                    window.location.hostname !== '127.0.0.1' &&
                    window.location.hostname !== 'localhost:5173';

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
