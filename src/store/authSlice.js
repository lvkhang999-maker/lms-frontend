// src/store/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

// Khởi tạo trạng thái ban đầu đọc từ bộ nhớ trình duyệt (nếu có)
const initialState = {
  currentUser: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isLoggedIn: !!localStorage.getItem('token'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Xử lý khi đăng nhập thành công: Lưu vào cả Redux State và LocalStorage
    loginSuccess: (state, action) => {
      state.currentUser = action.payload.user;
      state.token = action.payload.token;
      state.isLoggedIn = true;

      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    updateUserSuccess: (state, action) => {
      state.currentUser = action.payload; // Ghi đè thông tin user mới vào Redux State
      localStorage.setItem('user', JSON.stringify(action.payload)); // Đồng bộ cập nhật luôn LocalStorage
    },
    // Xử lý khi đăng xuất: Xóa sạch bộ nhớ
    logoutSuccess: (state) => {
      state.currentUser = null;
      state.token = null;
      state.isLoggedIn = false;

      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
});

export const { loginSuccess, logoutSuccess, updateUserSuccess } = authSlice.actions;
export default authSlice.reducer;