// src/components/Navbar.jsx
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux'; 
import { toast } from 'react-toastify';

function Navbar() {
  const { isLoggedIn, currentUser } = useSelector((state) => state.auth);
  const isAdmin = currentUser?.role === 'Admin';

  const handleLogoutClick = () => {
    localStorage.clear(); 
    toast.info('👋 Đã đăng xuất khỏi hệ thống thư viện.');
    window.location.href = '/login';
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.leftBrand}>
        <Link to="/" style={styles.logo}>📘 CTUT THƯ VIỆN</Link>
        <Link to="/" style={styles.navLink}>Trang chủ</Link>
        {isLoggedIn && (
          <Link to={isAdmin ? "/admin/history" : "/history"} style={styles.navLink}>
            Lịch sử mượn
          </Link>
        )}
      </div>

      <div style={styles.rightMenu}>
        {isLoggedIn ? (
          <div style={styles.userZone}>
            
            {/* 🔥 NÂNG CẤP: Chuyển div thành Link dẫn đến /profile kèm Avatar động từ Cloudinary */}
            <Link to="/profile" style={styles.profileBadgeLink}>
              <img 
                src={currentUser?.avatar || 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'} 
                alt="Avatar" 
                style={styles.avatarImg} 
              />
              <span style={styles.userName}>{currentUser?.name}</span>
              <small style={isAdmin ? styles.roleAdmin : styles.roleStudent}>
                ({isAdmin ? 'Thủ thư' : 'Sinh viên'})
              </small>
            </Link>

            {/* Nút chuyển đổi vùng quản trị nhanh nếu là Admin */}
            {isAdmin && (
              <Link to="/admin" style={styles.adminBtn}>⚙ Không gian Admin</Link>
            )}

            <button onClick={handleLogoutClick} style={styles.logoutBtn}>Đăng xuất</button>
          </div>
        ) : (
          <div style={styles.authZone}>
            <Link to="/login" style={styles.loginLink}>Đăng nhập</Link>
            <Link to="/register" style={styles.registerBtn}>Đăng ký tài khoản</Link>
          </div>
        )}
      </div>
    </nav>
  );
}

const styles = {
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px', height: '64px', backgroundColor: '#0056b3', color: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', position: 'sticky', top: 0, zIndex: 1000, fontFamily: 'Arial, sans-serif' },
  leftBrand: { display: 'flex', alignItems: 'center', gap: '24px' },
  logo: { fontSize: '18px', fontWeight: 'bold', color: '#fff', textDecoration: 'none', letterSpacing: '0.5px' },
  navLink: { color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontSize: '14px', fontWeight: '500', transition: '0.2s' },
  rightMenu: { display: 'flex', alignItems: 'center' },
  userZone: { display: 'flex', alignItems: 'center', gap: '16px' },
  
  // 🔥 STYLES MỚI CHO LINK BADGE HỒ SƠ & AVATAR TRÒN KHÍT KHAO
  profileBadgeLink: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.1)', padding: '6px 14px', borderRadius: '20px', fontSize: '14px', color: '#fff', textDecoration: 'none', transition: '0.2s' },
  avatarImg: { width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.4)' },
  
  userName: { fontWeight: 'bold' },
  roleAdmin: { color: '#ffc107', fontWeight: 'bold' },
  roleStudent: { color: '#d1ecf1' },
  adminBtn: { backgroundColor: '#dc3545', color: '#fff', padding: '8px 14px', borderRadius: '4px', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
  logoutBtn: { backgroundColor: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.5)', padding: '7px 14px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', transition: '0.2s' },
  authZone: { display: 'flex', alignItems: 'center', gap: '16px' },
  loginLink: { color: '#fff', textDecoration: 'none', fontSize: '14px', fontWeight: '500' },
  registerBtn: { backgroundColor: '#fff', color: '#0056b3', padding: '8px 16px', borderRadius: '4px', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold' }
};

export default Navbar;