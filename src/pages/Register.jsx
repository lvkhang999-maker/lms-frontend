// src/pages/Register.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa"; 
import API_URL from "../config/api";

function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); 

  // Trạng thái quản lý ẩn/hiện con mắt cho 2 ô độc lập
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegisterSubmit = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("❌ Mật khẩu xác nhận không trùng khớp!");
      return;
    }

    // 🔥 CHẶN ĐỨNG VÀ BÁO LỖI REGEX NGAY TẠI FRONT-END ĐỂ TỐI ƯU TRẢI NGHIỆM
    const strictPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d\s])[^\s]{8,20}$/;
    if (!strictPasswordRegex.test(password)) {
      toast.warning("⚠️ Mật khẩu phải từ 8-20 ký tự, có 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt!");
      return;
    }

    setIsSubmitting(true);

    fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, confirmPassword }),
    })
      .then((res) => {
        return res.json().then((data) => {
          if (!res.ok) throw new Error(data.message || "Đăng ký thất bại!");
          return data;
        });
      })
      .then((data) => {
        toast.success(data.message || "🎉 Đăng ký thành công! Hãy đăng nhập.");
        navigate("/login");
      })
      .catch((err) => {
        toast.error(err.message);
      })
      .finally(() => setIsSubmitting(false));
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleRegisterSubmit} style={styles.formBox}>
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>ĐĂNG KÝ TÀI KHOẢN</h2>

        <div style={styles.group}>
          <label style={styles.label}>Họ và tên độc giả:</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={styles.input} placeholder="Ví dụ: Nguyễn Văn A" disabled={isSubmitting} required />
        </div>

        <div style={styles.group}>
          <label style={styles.label}>Địa chỉ Email học viện:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={styles.input} placeholder="sinhvien@ctuet.edu.vn" disabled={isSubmitting} required />
        </div>

        <div style={styles.group}>
          <label style={styles.label}>Mật khẩu bảo mật:</label>
          <div style={styles.passwordWrapper}>
            <input type={showPwd ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} style={{ ...styles.input, paddingRight: "40px" }} placeholder="8-20 ký tự mạnh" disabled={isSubmitting} required />
            <button type="button" onClick={() => setShowPwd(!showPwd)} style={styles.eyeBtn}>{showPwd ? <FaEyeSlash /> : <FaEye />}</button>
          </div>
        </div>

        <div style={styles.group}>
          <label style={styles.label}>Xác nhận lại mật khẩu:</label>
          <div style={styles.passwordWrapper}>
            <input type={showConfirmPwd ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={{ ...styles.input, paddingRight: "40px" }} placeholder="Nhập lại chính xác mật khẩu" disabled={isSubmitting} required />
            <button type="button" onClick={() => setShowConfirmPwd(!showConfirmPwd)} style={styles.eyeBtn}>{showConfirmPwd ? <FaEyeSlash /> : <FaEye />}</button>
          </div>
        </div>

        <button type="submit" style={styles.btn} disabled={isSubmitting}>
          {isSubmitting ? "Đang xử lý thông tin..." : "Xác nhận đăng ký mới"}
        </button>

        <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px' }}>
          Đã có tài khoản? <Link to="/login" style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>Đăng nhập ngay</Link>
        </div>
      </form>
    </div>
  );
}

const styles = {
  container: { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "85vh", fontFamily: "Arial" },
  formBox: { width: "380px", padding: "32px", backgroundColor: "#fff", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" },
  group: { marginBottom: "16px" },
  label: { display: "block", marginBottom: "6px", fontWeight: "bold", fontSize: "14px" },
  input: { width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box" },
  passwordWrapper: { position: "relative", display: "flex", alignItems: "center", width: "100%" },
  eyeBtn: { position: "absolute", right: "12px", background: "none", border: "none", cursor: "pointer", color: "#6c757d", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, fontSize: "16px", outline: "none" },
  btn: { width: "100%", padding: "12px", backgroundColor: "#28a745", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", marginTop: "12px" },
};

export default Register;