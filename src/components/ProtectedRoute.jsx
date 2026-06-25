// src/components/ProtectedRoute.jsx
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, allowedRoles }) {
  const { isLoggedIn, currentUser } = useSelector((state) => state.auth);

  // 1. Nếu chưa đăng nhập, âm thầm đẩy sang trang Login (Không dùng alert ở đây)
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // 2. Nếu sai vai trò quyền hạn, âm thầm trả về trang chủ công khai
  if (allowedRoles && !allowedRoles.includes(currentUser?.role)) {
    return <Navigate to="/" replace />;
  }

  // 3. Hợp lệ hoàn toàn thì hiển thị giao diện bên trong
  return children;
}

export default ProtectedRoute;