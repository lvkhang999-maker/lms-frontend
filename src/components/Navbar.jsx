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
    <nav style={styles.navbar} className="main-navbar">
      <div style={styles.leftBrand} className="navbar-left">
        
        <Link to="/" style={styles.logoWrapper}>
          <img src="./logo.png" alt="CTUT Logo" style={styles.logoImg} />
          <span style={styles.logoText}></span>
        </Link>
        
        <Link to="/" style={styles.navLink}>Trang chủ</Link>
        {isLoggedIn && (
          <Link to={isAdmin ? "/admin/history" : "/history"} style={styles.navLink}>
            Lịch sử mượn
          </Link>
        )}
      </div>

      <div style={styles.rightMenu} className="navbar-right">
        {isLoggedIn ? (
          <div style={styles.userZone} className="navbar-user-zone">
            
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
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', height: '80px', backgroundColor: '#0056b3', color: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', position: 'sticky', top: 0, zIndex: 1000, fontFamily: 'Arial, sans-serif' },
  leftBrand: { display: 'flex', alignItems: 'center', gap: '24px' },
  
  // 🔥 STYLES MỚI: Định hình cấu trúc bọc ảnh logo và chữ thương hiệu song hành
  logoWrapper: { display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: '#fff', height: '150%' },
  logoImg: { height: '60px', width: 'auto', objectFit: 'contain' }, // Ép chiều cao logo khít khao thanh Navbar
  logoText: { fontSize: '18px', fontWeight: 'bold', letterSpacing: '0.5px' },

  navLink: { color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontSize: '14px', fontWeight: '500', transition: '0.2s' },
  rightMenu: { display: 'flex', alignItems: 'center' },
  userZone: { display: 'flex', alignItems: 'center', gap: '16px' },
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