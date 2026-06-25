// src/config/api.js

// Hệ thống sẽ ưu tiên lấy URL từ file .env khi deploy, nếu không thấy sẽ fallback về localhost mặc định
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default API_URL;