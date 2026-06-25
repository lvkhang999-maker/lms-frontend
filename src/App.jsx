// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css"; 

import Home from "./pages/Home";
import BookDetail from "./pages/BookDetail";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import BorrowHistory from "./pages/BorrowHistory";
import UserManagement from "./pages/UserManagement";
import BookFormPage from './pages/admin/BookFormPage';
import CategoryManagerPage from './pages/admin/CategoryManagerPage';
import SystemSettingsPage from './pages/admin/SystemSettingsPage';
import BookListPage from './pages/admin/BookListPage';
import OverviewPage from './pages/admin/OverviewPage';
import ProfilePage from './pages/ProfilePage';
import MainLayout from "./components/MainLayout"; 

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          {/* ==================== PHÂN HỆ TRANG CÔNG CỘNG & SINH VIÊN ==================== */}
          <Route path="/" element={<Home />} />
          <Route path="/book/:id" element={<BookDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* Tuyến đường xem lịch sử cá nhân của Sinh viên */}
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <BorrowHistory />
              </ProtectedRoute>
            }
          />
          
          {/* ==================== 🔥 PHÂN HỆ CONTAINER ADMIN HỢP NHẤT TOÀN DIỆN ==================== */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          >
            {/* 1. Trang chủ mặc định khi vừa cập bến /admin -> Gọi đồ thị SVG phân tích lên */}
            <Route index element={<OverviewPage />} /> 
            
            {/* 2. Các trang quản lý dạng bảng (Được gọi vào Outlet để giữ vững Sidebar) */}
            <Route path="books" element={<BookListPage />} /> 
            <Route path="history" element={<BorrowHistory />} /> {/* ✅ Đã đưa lọt lòng vào đây */}
            <Route path="users" element={<UserManagement />} />   {/* ✅ Đã đưa lọt lòng vào đây */}
            
            {/* 3. Các trang biểu mẫu tác vụ hành động */}
            <Route path="add-book" element={<BookFormPage />} />
            <Route path="edit-book/:id" element={<BookFormPage />} /> 
            <Route path="manage-categories" element={<CategoryManagerPage />} />
            <Route path="settings" element={<SystemSettingsPage />} />
          </Route>

        </Routes>
      </MainLayout>

      {/* GIỮ NGUYÊN HỘP CHỨA TOAST Ở NGOÀI CÙNG */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        theme="colored"
      />
    </BrowserRouter>
  );
}

export default App;