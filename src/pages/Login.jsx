// src/pages/Login.jsx
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginSuccess } from "../store/authSlice";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa"; 
import API_URL from "../config/api";

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setError("");

    fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
      .then((res) => {
        // 🔥 GIẢI PHÁP VÀ LỖI: Bốc tách data.message động từ MongoDB trả về thay vì ép chuỗi cứng
        return res.json().then((data) => {
          if (!res.ok) throw new Error(data.message || "Đăng nhập thất bại!");
          return data;
        });
      })
      .then((data) => {
        dispatch(loginSuccess({ user: data.user, token: data.token }));

        const vaiTroText = data.user.role === "Admin" ? "thủ thư" : "sinh viên";
        toast.success(`👋 Chào mừng ${vaiTroText} ${data.user.name} đăng nhập thành công!`);
        navigate("/");
      })
      .catch((err) => {
        setError(err.message);
        toast.error(err.message); // Hiển thị chuẩn xác câu thông báo khóa hoặc sai pass
      });
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleLoginSubmit} style={styles.formBox}>
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>ĐĂNG NHẬP HỆ THỐNG</h2>

        {error && <div style={styles.errorAlert}>{error}</div>}

        <div style={styles.group}>
          <label style={styles.label}>Tài khoản Email:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={styles.input} placeholder="admin@ctuet.edu.vn" required />
        </div>

        <div style={styles.group}>
          <label style={styles.label}>Mật khẩu:</label>
          <div style={styles.passwordWrapper}>
            <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} style={{ ...styles.input, paddingRight: "40px" }} placeholder="••••••••" required />
            <button type="button" onClick={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        <button type="submit" style={styles.btn}>Xác nhận đăng nhập</button>
      </form>
    </div>
  );
}

const styles = {
  container: { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh", fontFamily: "Arial" },
  formBox: { width: "360px", padding: "32px", backgroundColor: "#fff", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" },
  group: { marginBottom: "16px" },
  label: { display: "block", marginBottom: "6px", fontWeight: "bold", fontSize: "14px" },
  input: { width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box" },
  passwordWrapper: { position: "relative", display: "flex", alignItems: "center", width: "100%" },
  eyeBtn: { position: "absolute", right: "12px", background: "none", border: "none", cursor: "pointer", color: "#6c757d", display: "flex", alignItems: "center", fontSize: "16px", outline: "none" },
  btn: { width: "100%", padding: "12px", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", marginTop: "8px" },
  errorAlert: { padding: "12px", backgroundColor: "#f8d7da", color: "#721c24", borderRadius: "4px", marginBottom: "16px", fontSize: "13px", lineHeight: "1.4", textAlign: "justify" },
};

export default Login;