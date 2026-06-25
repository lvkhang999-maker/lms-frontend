// src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';

// Tạo ra store toàn cục gom tất cả các reducers lại
export const store = configureStore({
  reducer: {
    auth: authReducer, // Quản lý nhánh dữ liệu đăng nhập
  },
});