// src/components/Sidebar.jsx
import { Link, useLocation } from 'react-router-dom';
import { FaBook, FaPlusCircle, FaTags, FaCogs, FaUsers, FaClipboardList, FaAddressBook, FaSignOutAlt } from 'react-icons/fa';
import { toast } from 'react-toastify'; // 🔥 IMPORT THÊM TOAST CHỦ ĐỘNG

function Sidebar() {
  const location = useLocation();
  const currentPath = location.pathname;

  // 🔥 ĐỒNG BỘ LOGIC ĐĂNG XUẤT KIÊN CỐ: Khử hoàn toàn lỗi đơ nút bấm
  const handleLogout = () => {
    // 1. Quét sạch toàn bộ token, thông tin user và phiên làm việc trong trình duyệt
    localStorage.clear(); 
    
    // 2. Bắn thông báo phẳng màu xanh dịu mắt cho Thủ thư biết
    toast.info('👋 Đã đăng xuất sạch khỏi hệ thống quản trị thư viện.');
    
    // 3. Kích hoạt tải lại trang để reset sạch RAM và đẩy thẳng về trang Login
    window.location.href = '/login';
  };

  const navItems = [
    { name: 'Tổng quan Dashboard', path: '/admin', icon: <FaBook /> },
    { name: 'Quản lý Độc giả', path: '/admin/users', icon: <FaUsers /> },
    { name: 'Nhật ký Mượn Trả', path: '/admin/history', icon: <FaClipboardList /> },
    { name: 'Quản lý Catalog Sách', path: '/admin/books', icon: <FaAddressBook /> },
  ];

  const taskItems = [
    { name: 'Thêm Sách Mới', path: '/admin/add-book', icon: <FaPlusCircle /> },
    { name: 'Quản lý Thể loại', path: '/admin/manage-categories', icon: <FaTags /> },
    { name: 'Quy định Hệ thống', path: '/admin/settings', icon: <FaCogs /> },
  ];

  return (
    <div style={styles.sidebar}>
      <h4 style={styles.mainTitle}>🗃️ PHÂN HỆ QUẢN TRỊ</h4>
      
      <nav style={styles.navZone}>
        {navItems.map((item, index) => (
          <Link key={index} to={item.path} style={styles.navLink(currentPath === item.path)}>
            <span style={styles.icon}>{item.icon}</span>
            <span style={styles.name}>{item.name}</span>
          </Link>
        ))}

        <h4 style={styles.taskTitle}>⚙️ CHỨC NĂNG TÁC VỤ</h4>
        {taskItems.map((item, index) => (
          <Link key={index} to={item.path} style={styles.navLink(currentPath === item.path)}>
            <span style={styles.icon}>{item.icon}</span>
            <span style={styles.name}>{item.name}</span>
          </Link>
        ))}
      </nav>

      {/* Gọi hàm handleLogout khi click vào nút */}
      <button onClick={handleLogout} style={styles.logoutBtn}>
        <FaSignOutAlt /> Đăng xuất
      </button>
    </div>
  );
}

const styles = {
  sidebar: { width: "240px", backgroundColor: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "10px", boxSizing: "border-box", minHeight: "calc(100vh - 120px)" },
  mainTitle: { margin: "0 0 16px 0", fontSize: "15px", color: "#495057", fontWeight: "bold", textAlign: 'center' },
  navZone: { display: "flex", flexDirection: "column", gap: "6px" },
  taskTitle: { margin: "24px 0 12px 0", fontSize: "14px", color: "#6f42c1", fontWeight: "bold", textAlign: 'center', borderTop: '1px solid #f1f3f5', paddingTop: '16px' },
  navLink: (isActive) => ({ display: "flex", alignItems: "center", gap: "12px", padding: "10px 14px", borderRadius: "6px", textDecoration: "none", fontSize: "14px", fontWeight: "500", transition: "0.2s", backgroundColor: isActive ? "#e3f2fd" : "transparent", color: isActive ? "#007bff" : "#495057" }),
  icon: { fontSize: "16px", display: "flex", alignItems: "center" },
  name: { fontSize: "14px" },
  logoutBtn: { width: "100%", padding: "12px", border: "none", borderRadius: "6px", backgroundColor: "#dc3545", color: "#fff", fontWeight: "bold", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: 'center', gap: '8px', marginTop: '40px' }
};

export default Sidebar;