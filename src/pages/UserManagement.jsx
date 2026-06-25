// src/pages/UserManagement.jsx
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import axiosClient from "../config/axiosClient"; // 🔥 Đã đồng bộ sang Trạm kiểm soát Axios trung tâm

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { token, currentUser } = useSelector((state) => state.auth);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const fetchUsers = () => {
    // 🔥 SỬA LỖI DÒNG 36: Defer việc set state sang Macrotask tiếp theo để tránh xung đột luồng render của useEffect
    setTimeout(() => {
      setIsLoading(true);
    }, 0);

    // Sử dụng axiosClient giúp code gọn gàng, tự đính kèm Token bảo mật
    axiosClient.get(`/auth/users?page=${page}&limit=1&search=${search}`)
      .then((data) => {
        setUsers(data.users || []);
        setPages(data.pages || 1);
        setTotalUsers(data.totalUsers || 0);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (token) fetchUsers();
  }, [page, search, token]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleRoleChange = (id, currentRole) => {
    const newRole = currentRole === "Admin" ? "SinhVien" : "Admin";
    
    // 🔥 Đã xóa bỏ đoạn rác styles.API_BASE_FIX cũ, chuyển hẳn sang Axios kiên cố
    axiosClient.put(`/auth/users/${id}/role`, { role: newRole })
      .then((data) => {
        toast.success(data.message || "Thay đổi quyền thành công!");
        fetchUsers();
      })
      .catch((err) => {
        const errMsg = err.response?.data?.message || "Thay đổi quyền thất bại!";
        toast.error(errMsg);
      });
  };

  const handleToggleLock = (id) => {
    // 🔥 Đồng bộ tuyến đường khóa tài khoản sang Axios sạch sẽ
    axiosClient.put(`/auth/users/${id}/toggle-lock`)
      .then((data) => {
        toast.success(data.message || "Thực thi tác vụ tài khoản thành công!");
        fetchUsers(); 
      })
      .catch((err) => {
        const errMsg = err.response?.data?.message || "Thực thi tác vụ thất bại!";
        toast.error(errMsg);
      });
  };

  return (
    <div style={styles.contentBox}>
      <div style={styles.headerFlex}>
        <h2 style={styles.mainTitle}>🔵 Quản lý Thành viên & Phân quyền Hệ thống</h2>
        <div style={styles.searchWrapper}>
          <input 
            type="text" 
            placeholder="🔍 Gõ tìm nhanh theo tên hoặc email tài khoản sinh viên..." 
            value={search}
            onChange={handleSearchChange}
            style={styles.searchInput}
          />
        </div>
      </div>

      <div style={styles.tableCard}>
        <h4 style={styles.cardHeading}>Danh sách tài khoản đăng ký ({totalUsers})</h4>
        
        {isLoading ? (
          <div style={{ textAlign: "center", padding: "32px", color: "#0056b3", fontWeight: "bold" }}>🔄 Đang đồng bộ phân đoạn dữ liệu độc giả...</div>
        ) : (
          <>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thRow}>
                  <th style={styles.th}>Họ và Tên</th>
                  <th style={styles.th}>Địa chỉ Email</th>
                  <th style={styles.th}>Quyền hiện tại</th>
                  <th style={styles.th}>Trạng thái</th>
                  <th style={styles.th}>Tác vụ phân quyền & Quy chế</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((user) => {
                    const isSelf = user._id === currentUser?.id;
                    return (
                      <tr key={user._id} style={styles.trRow}>
                        <td style={styles.td}><strong>{user.name}</strong></td>
                        <td style={styles.td}>{user.email}</td>
                        <td style={styles.td}>
                          <span style={user.role === "Admin" ? styles.badgeAdmin : styles.badgeStudent}>
                            {user.role === "Admin" ? "Thủ thư (Admin)" : "Sinh viên"}
                          </span>
                        </td>
                        <td style={styles.td}>
                          {user.isLocked ? (
                            <span style={styles.badgeLocked}>🔒 Bị khóa</span>
                          ) : (
                            <span style={styles.badgeActive}>✓ Bình thường</span>
                          )}
                        </td>
                        <td style={styles.td}>
                          {isSelf ? (
                            <span style={styles.selfBadge}>✨ Tài khoản của bạn (Đang chạy phiên)</span>
                          ) : (
                            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                              <button onClick={() => handleRoleChange(user._id, user.role)} style={user.role === "Admin" ? styles.demoteBtn : styles.promoteBtn}>
                                {user.role === "Admin" ? "↓ Hạ xuống Sinh viên" : "↑ Cấp quyền Admin"}
                              </button>
                              <button onClick={() => handleToggleLock(user._id)} style={user.isLocked ? styles.unlockBtn : styles.lockBtn}>
                                {user.isLocked ? "🔓 Mở khóa" : "🛑 Khóa tài khoản"}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" style={{ padding: "24px", textAlign: "center", color: "#aaa" }}>Không tìm thấy tài khoản độc giả nào khớp với từ khóa.</td>
                  </tr>
                )}
              </tbody>
            </table>

            {pages > 1 && (
              <div style={styles.paginationContainer}>
                <button onClick={() => setPage(prev => Math.max(prev - 1, 1))} disabled={page === 1} style={styles.pageArrowBtn(page === 1)}>«</button>
                {Array.from({ length: pages }, (_, index) => (
                  <button key={index + 1} onClick={() => setPage(index + 1)} style={styles.pageCircleBtn(page === index + 1)}>{index + 1}</button>
                ))}
                <button onClick={() => setPage(prev => Math.min(prev + 1, pages))} disabled={page === pages} style={styles.pageArrowBtn(page === pages)}>»</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  contentBox: { width: "100%", fontFamily: "Arial, sans-serif" },
  headerFlex: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" },
  mainTitle: { fontSize: "22px", color: "#212529", margin: 0, fontWeight: "bold" },
  searchWrapper: { width: "100%", maxWidth: "400px" },
  searchInput: { width: "100%", padding: "10px 14px", borderRadius: "4px", border: "1px solid #ced4da", fontSize: "13px", outline: "none", boxSizing: "border-box" },
  tableCard: { backgroundColor: "#fff", padding: "24px", borderRadius: "8px", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", border: "1px solid #e9ecef" },
  cardHeading: { margin: "0 0 16px 0", fontSize: "16px", color: "#212529", fontWeight: "bold" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "14px" },
  thRow: { backgroundColor: "#f8f9fa" },
  th: { padding: "12px 16px", textAlign: "left", color: "#495057", fontWeight: "bold", borderBottom: "2px solid #dee2e6" },
  trRow: { borderBottom: "1px solid #dee2e6" },
  td: { padding: "14px 16px", color: "#212529", verticalAlign: "middle" },
  badgeStudent: { backgroundColor: "#e9ecef", color: "#495057", padding: "4px 10px", borderRadius: "4px", fontSize: "12px", fontWeight: "500" },
  badgeAdmin: { backgroundColor: "#f8d7da", color: "#721c24", padding: "4px 10px", borderRadius: "4px", fontSize: "12px", fontWeight: "500" },
  badgeActive: { backgroundColor: "#d4edda", color: "#155724", padding: "4px 10px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold" },
  badgeLocked: { backgroundColor: "#fff3cd", color: "#856404", padding: "4px 10px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold" },
  promoteBtn: { padding: "8px 14px", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", fontSize: "13px" },
  demoteBtn: { padding: "8px 14px", backgroundColor: "#6c757d", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", fontSize: "13px" },
  lockBtn: { padding: "8px 14px", backgroundColor: "#fd7e14", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", fontSize: "13px" },
  unlockBtn: { padding: "8px 14px", backgroundColor: "#28a745", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", fontSize: "13px" },
  selfBadge: { padding: "6px 12px", backgroundColor: "#e8f5e9", color: "#2e7d32", borderRadius: "4px", fontSize: "13px", fontWeight: "bold", display: "inline-block", border: "1px solid #c8e6c9" },
  
  paginationContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '24px', padding: '10px 0' },
  pageCircleBtn: (isActive) => ({ 
    width: '32px', 
    height: '32px', 
    borderRadius: '50%', 
    border: isActive ? 'none' : '1px solid #bbdefb', 
    backgroundColor: isActive ? '#4b9cd3' : '#e3f2fd', 
    color: isActive ? '#fff' : '#1e88e5', 
    fontWeight: 'bold', 
    fontSize: '13px', 
    cursor: 'pointer', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    lineHeight: 0, 
    padding: 0,
    transition: '0.2s all ease' 
  }),
  pageArrowBtn: (isDisabled) => ({ 
    border: 'none', 
    backgroundColor: 'transparent', 
    color: isDisabled ? '#cfd8dc' : '#4b9cd3', 
    fontSize: '18px', 
    fontWeight: 'bold', 
    cursor: isDisabled ? 'not-allowed' : 'pointer', 
    padding: '0 8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  })
};

export default UserManagement;