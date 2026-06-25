// src/pages/AdminDashboard.jsx
import { useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom"; 
import { useSelector } from "react-redux";
import Sidebar from "../components/Sidebar";
import { FaClock } from "react-icons/fa";
import API_URL from "../config/api";

function AdminDashboard() {
  const { token } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({ totalBooks: 0, totalBorrowed: 0, totalOverdue: 0, totalUsers: 0 });

  // 🔥 CHỈ GIỮ LẠI: Hàm kéo số liệu thống kê tổng quan của học viện
  const fetchStats = () => {
    fetch(`${API_URL}/stats`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error("Lỗi tải thống kê:", err));
  };

  // 🔥 ĐÃ XÓA: Hàm fetchBooks và [books, setBooks] dư thừa gây lỗi no-unused-vars

  useEffect(() => { 
    fetchStats(); 
  }, [token]); // Kích hoạt chạy lại nếu phiên làm việc thay đổi

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>Không gian quản trị (Thủ thư)</h1>
        <Link to="/" style={styles.backLink}>← Xem trang chủ</Link>
      </header>

      <div style={styles.mainLayout}>
        {/* Thanh Sidebar điều hướng tác vụ bên trái */}
        <Sidebar />

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* KHỐI HIỂN THỊ SỐ LIỆU THỐNG KÊ (STATS CARDS) */}
          <div style={styles.statsGrid}>
            <div style={{ ...styles.card, borderLeft: "5px solid #007bff" }}>
              <div style={styles.cardIconZone}>📊</div>
              <div style={styles.cardTextZone}>
                <small style={styles.cardLabel}>Tổng số đầu sách</small>
                <h2 style={styles.cardValue}>{stats.totalBooks}</h2>
              </div>
            </div>
            
            <div style={{ ...styles.card, borderLeft: "5px solid #28a745" }}>
              <div style={styles.cardIconZone}>📖</div>
              <div style={styles.cardTextZone}>
                <small style={styles.cardLabel}>Sách đang mượn</small>
                <h2 style={styles.cardValue}>{stats.totalBorrowed}</h2>
              </div>
            </div>
            
            <div style={{ ...styles.card, borderLeft: "5px solid #dc3545" }}>
              <div style={styles.cardIconZone}><FaClock style={{color: "#dc3545", fontSize: '20px'}} /></div>
              <div style={styles.cardTextZone}>
                <small style={styles.cardLabel}>Quá hạn</small>
                <h2 style={{ ...styles.cardValue, color: "#dc3545" }}>{stats.totalOverdue}</h2>
              </div>
            </div>
            
            <div style={{ ...styles.card, borderLeft: "5px solid #6f42c1" }}>
              <div style={styles.cardIconZone}>👥</div>
              <div style={styles.cardTextZone}>
                <small style={styles.cardLabel}>Độc giả đăng ký</small>
                <h2 style={styles.cardValue}>{stats.totalUsers}</h2>
              </div>
            </div>
          </div>

          {/* KHU VỰC OUTLET KHÔNG GIAN CON CHÍNH */}
          <div style={styles.mainContentArea}>
             <Outlet />
          </div>

        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: "24px", fontFamily: "Arial, sans-serif", backgroundColor: "#f4f6f9", minHeight: "100vh" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" },
  backLink: { color: "#007bff", textDecoration: "none", fontWeight: "bold" },
  mainLayout: { display: "flex", gap: "24px", alignItems: "flex-start" },
  statsGrid: { display: "flex", gap: "16px", width: "100%", flexWrap: "wrap" },
  card: { flex: 1, minWidth: "200px", backgroundColor: "#fff", padding: "16px 20px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", display: "flex", alignItems: "center", gap: "16px", boxSizing: "border-box" },
  cardIconZone: { width: "46px", height: "46px", borderRadius: "50%", backgroundColor: "#f8f9fa", display: "flex", alignItems: "center", justifyContent: "center" },
  cardTextZone: { display: "flex", flexDirection: "column" },
  cardLabel: { fontSize: "12px", color: "#6c757d", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.3px" },
  cardValue: { margin: "4px 0 0 0", fontSize: "24px", fontWeight: "bold", color: "#212529" },
  mainContentArea: { backgroundColor: "#fff", padding: "24px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", width: "100%", boxSizing: 'border-box' }
};

export default AdminDashboard;