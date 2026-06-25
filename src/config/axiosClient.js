// src/config/axiosClient.js
import axios from 'axios';
import API_URL from './api';
import { toast } from 'react-toastify';

// 1. Khởi tạo một instance cấu hình gốc cho Axios
const axiosClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. INTERCEPTOR CHO REQUEST: Tự động đính kèm mã Token bảo mật trước khi gửi lên Server
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Tự động inject header hóa đơn bảo mật
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. INTERCEPTOR CHO RESPONSE: Trạm hứng bẫy lỗi tập trung từ Server bắn về
axiosClient.interceptors.response.use(
  (response) => {
    return response.data; // Rút gọn dữ liệu trả về, Front-end không cần gọi .json() nữa
  },
  (error) => {
    // 🔥 BẪY THẦN THÁNH: Nếu server báo lỗi 401 (Hết hạn JWT hoặc Token bất hợp pháp)
    if (error.response && error.response.status === 401) {
      localStorage.clear(); // Quét sạch phiên làm việc lỗi
      
      // Bắn thông báo cảnh báo đẩy về giao diện
      toast.error('🔒 Phiên đăng nhập học viện đã hết hạn! Vui lòng đăng nhập lại để tiếp tục.');
      
      // Chờ 1.5 giây cho người dùng đọc thông báo rồi điều hướng về trang Login
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
    }
    
    return Promise.reject(error);
  }
);

export default axiosClient;