// src/pages/admin/SystemSettingsPage.jsx
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

function SystemSettingsPage() {
  const { token } = useSelector((state) => state.auth);
  
  // STATE CHỨA CẤU HÌNH QUY CHẾ ĐỘNG
  const [sysSettings, setSysSettings] = useState({ maxBooks: 3, borrowDays: 14, finePerDay: 2000 });
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // 1. Tải cấu hình luật thư viện hiện tại
  useEffect(() => {
    fetch("http://localhost:5000/api/settings", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
      .then((data) => {
        if (data) setSysSettings({ maxBooks: data.maxBooks, borrowDays: data.borrowDays, finePerDay: data.finePerDay });
        setIsLoading(false);
      })
      .catch((err) => { console.error("Lỗi tải quy chế:", err); setIsLoading(false); });
  }, []);

  // 2. 🔥 HÀM SUBMIT: THAY ĐỔI LUẬT TOÀN TRƯỜNG
  const handleSettingsSubmit = (e) => {
    e.preventDefault();
    setIsUpdating(true);
    fetch("http://localhost:5000/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(sysSettings)
    })
      .then(res => { if (!res.ok) throw new Error(); return res.json(); })
      .then((data) => {
        toast.success("⚙️ Đã áp dụng cấu hình quy định mới trên toàn trường!");
        if (data.setting) setSysSettings(data.setting);
      })
      .catch(() => toast.error("Có lỗi xảy ra, không thể lưu cấu hình!"))
      .finally(() => setIsUpdating(false));
  };

  if (isLoading) {
    return <div style={{ textAlign: 'center', padding: '48px', color: '#6f42c1', fontWeight: 'bold' }}>🔄 Đang tải luật quy định...</div>;
  }

  return (
    <div style={styles.boxForm}>
      <h4 style={{ color: '#6f42c1', margin: "0 0 16px 0" }}>⚙️ Cấu Hình Quy Định Hệ Thống</h4>
      <form onSubmit={handleSettingsSubmit}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Số sách mượn tối đa / Sinh viên:</label>
          <input type="number" min="1" value={sysSettings.maxBooks} onChange={(e) => setSysSettings({...sysSettings, maxBooks: parseInt(e.target.value) || 1})} style={styles.input} disabled={isUpdating} required />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Số ngày mượn mặc định / Cuốn sách:</label>
          <input type="number" min="1" value={sysSettings.borrowDays} onChange={(e) => setSysSettings({...sysSettings, borrowDays: parseInt(e.target.value) || 1})} style={styles.input} disabled={isUpdating} required />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Mức phạt trễ hạn (VNĐ / Ngày trễ):</label>
          <input type="number" step="500" min="0" value={sysSettings.finePerDay} onChange={(e) => setSysSettings({...sysSettings, finePerDay: parseInt(e.target.value) || 0})} style={styles.input} disabled={isUpdating} required />
        </div>
        <button type="submit" disabled={isUpdating} style={{ ...styles.submitBtn, backgroundColor: isUpdating ? '#4a148c' : '#6f42c1', cursor: isUpdating ? 'not-allowed' : 'pointer' }}>
          {isUpdating ? "Đang áp dụng luật..." : "💾 Lưu & Áp Dụng Quy Chế Toàn Trường"}
        </button>
      </form>
    </div>
  );
}

const styles = {
  boxForm: { backgroundColor: "#fff", padding: "24px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", width: "100%", boxSizing: 'border-box' },
  formGroup: { marginBottom: "16px" },
  label: { display: "block", marginBottom: "6px", fontWeight: "bold", fontSize: "14px", color: "#333" },
  input: { width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box" },
  submitBtn: { width: "100%", padding: "14px 12px", border: "none", borderRadius: "4px", fontWeight: "bold", fontSize: "15px", position: "relative", color: '#fff' },
};

export default SystemSettingsPage;