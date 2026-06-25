// src/components/Breadcrumbs.jsx
import { Link, useLocation } from 'react-router-dom';

function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Ánh xạ chuẩn theo URL TOÀN PHẦN cho không gian quản trị công nghiệp
  const routeMap = {
    '/admin': 'Không gian Admin',
    '/admin/users': 'Quản lý độc giả & Phân quyền',
    '/admin/history': 'Nhật ký mượn/trả toàn trường',
    '/history': 'Lịch sử mượn cá nhân',
  };

  if (location.pathname === '/') return null;

  // 🔥 LUỒNG XỬ LÝ ĐẶC BIỆT: Khử hoàn toàn chữ "book" và ID thô kệch trên thanh điều hướng
  if (pathnames[0] === 'book') {
    return (
      <nav style={styles.nav}>
        <Link to="/" style={styles.link}>🏠 Trang chủ</Link>
        <span style={styles.item}>
          <span style={styles.separator}>/</span>
          <span style={styles.current}>Chi tiết sách</span>
        </span>
      </nav>
    );
  }

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.link}>🏠 Trang chủ</Link>
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const displayName = routeMap[routeTo] || name;

        return (
          <span key={routeTo} style={styles.item}>
            <span style={styles.separator}>/</span>
            {isLast ? (
              <span style={styles.current}>{displayName}</span>
            ) : (
              <Link to={routeTo} style={styles.link}>{displayName}</Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

const styles = {
  nav: { padding: '12px 24px', backgroundColor: '#fff', borderBottom: '1px solid #e9ecef', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'Arial, sans-serif' },
  link: { color: '#007bff', textDecoration: 'none', fontWeight: '500' },
  separator: { color: '#6c757d', margin: '0 8px' },
  current: { color: '#495057', fontWeight: '600' },
  item: { display: 'flex', alignItems: 'center' }
};

export default Breadcrumbs;