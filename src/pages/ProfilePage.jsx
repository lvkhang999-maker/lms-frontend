// src/pages/ProfilePage.jsx
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'; // 🔥 Thêm useDispatch
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash, FaCamera, FaUserEdit } from 'react-icons/fa';
import API_URL from "../config/api"; // Kế thừa từ bước 1 cực sạch sẽ
import { updateUserSuccess } from '../store/authSlice'; // 🔥 Import action mới từ store

function ProfilePage() {
  const dispatch = useDispatch(); // 🔥 Khởi tạo dispatch điều khiển Redux
  const { token } = useSelector((state) => state.auth);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingAvt, setIsUploadingAvt] = useState(false);

  const [name, setName] = useState(''); 
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchProfile = () => {
    fetch(`${API_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => { 
        setProfile(data); 
        setName(data.name || ''); 
        setIsLoading(false); 
      })
      .catch(err => { console.error(err); setIsLoading(false); });
  };

  useEffect(() => { if (token) fetchProfile(); }, [token]);

  // Xử lý upload avatar mượt mà bằng Redux Dispatch
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingAvt(true);
    const formDataToSend = new FormData();
    formDataToSend.append('avatar', file);

    fetch(`${API_URL}/auth/avatar`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: formDataToSend
    })
      .then(res => { if (!res.ok) throw new Error("Lỗi upload!"); return res.json(); })
      .then((data) => {
        toast.success("🖼️ Cập nhật ảnh đại diện học viện thành công!");
        setProfile(prev => ({ ...prev, avatar: data.avatar }));
        
        // 🔥 ĐỒNG BỘ MƯỢT MÀ: Cập nhật thẳng vào Redux để avatar trên Navbar đổi ngay lập tức
        const updatedUser = { ...profile, avatar: data.avatar };
        dispatch(updateUserSuccess(updatedUser));
      })
      .catch(err => toast.error(err.message))
      .finally(() => setIsUploadingAvt(false));
  };

  const handleUpdateProfileSubmit = (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Họ và tên không được để trống!");
      return;
    }

    if (currentPassword || newPassword || confirmNewPassword) {
      if (newPassword !== confirmNewPassword) {
        toast.error("❌ Mật khẩu mới nhập lại không trùng khớp!");
        return;
      }
      const strictPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d\s])[^\s]{8,20}$/;
      if (!strictPasswordRegex.test(newPassword)) {
        toast.warning("⚠️ Mật khẩu mới phải từ 8-20 ký tự, có 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt!");
        return;
      }
    }

    setIsUpdating(true);
    fetch(`${API_URL}/auth/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name, currentPassword, newPassword, confirmNewPassword })
    })
      .then(res => res.json().then(data => { if (!res.ok) throw new Error(data.message); return data; }))
      .then((data) => {
        toast.success("✨ Cập nhật thông tin tài khoản thành công!");
        
        // 🔥 GIẢI PHÁP ĐỈNH CAO: Bắn dữ liệu lên Redux Store toàn cục
        if (data.user) {
          dispatch(updateUserSuccess(data.user)); // Cập nhật state chung
          setProfile(data.user); // Cập nhật UI nội bộ trang
        }
        
        // Dọn sạch form mật khẩu
        setCurrentPassword(''); setNewPassword(''); setConfirmNewPassword('');
        
        // ❌ KHÔNG DÙNG LỆNH WINDOW.LOCATION.RELOAD() GÂY GIẬT LAG TRANG NỮA!
      })
      .catch(err => toast.error(err.message))
      .finally(() => setIsUpdating(false));
  };

  if (isLoading) {
    return <div style={{ textAlign: 'center', padding: '48px', color: '#007bff', fontWeight: 'bold' }}>🔄 Đang đồng bộ thông tin tài khoản...</div>;
  }

  return (
    <div style={styles.container}>
      <style>{`.avatar-wrapper:hover .avatar-overlay { opacity: 1 !important; }`}</style>
      <h2 style={styles.pageTitle}>👤 Quản Lý Tài Khoản Cá Nhân</h2>
      
      <div style={styles.layoutGrid}>
        <div style={styles.infoCard}>
          <div style={styles.avatarZone}>
            <div className="avatar-wrapper" style={styles.avatarWrapper} onClick={() => document.getElementById('avatarFileInput').click()}>
              <img src={profile?.avatar || 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'} alt="Avatar" style={styles.avatarImg} />
              <div className="avatar-overlay" style={styles.avatarOverlay}>
                <FaCamera style={{ fontSize: '20px', marginBottom: '4px' }} />
                <span style={{ fontSize: '11px', fontWeight: 'bold' }}>{isUploadingAvt ? "Đang up..." : "ĐỔI ẢNH"}</span>
              </div>
            </div>
            <input id="avatarFileInput" type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} disabled={isUploadingAvt} />

            <h3 style={{ margin: '8px 0 2px 0' }}>{profile?.name}</h3>
            <span style={styles.roleTag(profile?.role)}>{profile?.role === 'Admin' ? '🛠️ Thủ thư' : '🎓 Sinh viên CTUT'}</span>
          </div>
          <div style={styles.detailZone}>
            <p style={styles.infoRow}><strong>📧 Email:</strong> <span>{profile?.email}</span></p>
            <p style={styles.infoRow}><strong>📅 Tham gia:</strong> <span>{new Date(profile?.createdAt).toLocaleDateString('vi-VN')}</span></p>
          </div>
        </div>

        <div style={styles.formCard}>
          <h3 style={styles.sectionTitle}><FaUserEdit /> Thiết Lập Thông Tin Tài Khoản</h3>
          <form onSubmit={handleUpdateProfileSubmit}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Họ và tên độc giả:</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={styles.inputRegular} placeholder="Nhập họ và tên mới" disabled={isUpdating} required />
            </div>

            <div style={{ ...styles.dividerTitle, marginTop: '24px' }}>🔒 Thay đổi mật khẩu bảo mật (Để trống nếu không đổi)</div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Mật khẩu hiện tại:</label>
              <div style={styles.passwordWrapper}>
                <input type={showCurrent ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} style={styles.input} placeholder="Xác nhận mật khẩu đang dùng" disabled={isUpdating} />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)} style={styles.eyeBtn}>{showCurrent ? <FaEyeSlash /> : <FaEye />}</button>
              </div>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Mật khẩu bảo mật mới:</label>
              <div style={styles.passwordWrapper}>
                <input type={showNew ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={styles.input} placeholder="8-20 ký tự (Hoa, thường, số, ký tự lạ)" disabled={isUpdating} />
                <button type="button" onClick={() => setShowNew(!showNew)} style={styles.eyeBtn}>{showNew ? <FaEyeSlash /> : <FaEye />}</button>
              </div>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Xác nhận lại mật khẩu mới:</label>
              <div style={styles.passwordWrapper}>
                <input type={showConfirm ? "text" : "password"} value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} style={styles.input} placeholder="Nhập lại chính xác mật khẩu mới" disabled={isUpdating} />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={styles.eyeBtn}>{showConfirm ? <FaEyeSlash /> : <FaEye />}</button>
              </div>
            </div>
            <button type="submit" disabled={isUpdating} style={styles.submitBtn}>{isUpdating ? "Hệ thống đang lưu..." : "💾 Lưu & Cập Nhật Hồ Sơ"}</button>
          </form>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: '960px', margin: '32px auto', padding: '0 24px', fontFamily: 'Arial, sans-serif' },
  pageTitle: { margin: "0 0 24px 0", color: "#333", fontSize: "22px", fontWeight: "bold" },
  layoutGrid: { display: "flex", gap: "24px", flexWrap: "wrap", alignItems: "flex-start" },
  infoCard: { flex: 1, minWidth: "280px", backgroundColor: "#fff", padding: "32px 24px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", textAlign: 'center' },
  avatarZone: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', paddingBottom: '20px', borderBottom: '1px solid #f1f3f5' },
  avatarWrapper: { position: 'relative', width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden', cursor: 'pointer', border: '3px solid #007bff', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' },
  avatarImg: { width: '100%', height: '100%', objectFit: 'cover' },
  avatarOverlay: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: '0.2s' },
  roleTag: (role) => ({ backgroundColor: role === 'Admin' ? '#f3e5f5' : '#e8f5e9', color: role === 'Admin' ? '#7b1fa2' : '#2e7d32', padding: '4px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }),
  detailZone: { marginTop: '20px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '12px' },
  infoRow: { margin: 0, fontSize: '14px', display: 'flex', justifyContent: 'space-between', color: '#495057' },
  formCard: { flex: 1.6, minWidth: "320px", backgroundColor: "#fff", padding: "28px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", boxSizing: 'border-box' },
  sectionTitle: { margin: "0 0 20px 0", fontSize: "16px", color: "#007bff", display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f1f3f5', paddingBottom: '10px' },
  formGroup: { marginBottom: "16px" },
  label: { display: "block", marginBottom: "6px", fontWeight: "bold", fontSize: "14px", color: "#333" },
  inputRegular: { width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box", fontSize: '14px' },
  passwordWrapper: { position: "relative", display: "flex", alignItems: "center", width: "100%" },
  input: { width: "100%", padding: "10px 40px 10px 10px", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box", fontSize: '14px' },
  eyeBtn: { position: "absolute", right: "12px", background: "none", border: "none", cursor: "pointer", color: "#6c757d", display: "flex", alignItems: "center", fontSize: "16px", outline: "none" },
  dividerTitle: { fontSize: '13px', color: '#6c757d', fontWeight: 'bold', marginBottom: '12px', paddingBottom: '4px', borderBottom: '1px dashed #dee2e6' },
  submitBtn: { width: "100%", padding: "12px", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", fontSize: "14px", marginTop: '8px' }
};

export default ProfilePage;