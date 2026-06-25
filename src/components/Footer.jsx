// src/components/Footer.jsx
function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={styles.footer}>
      <div style={styles.topSection}>
        <div style={styles.brandCol}>
          <h4 style={styles.title}>TRƯỜNG ĐẠI HỌC KỸ THUẬT - CÔNG NGHỆ CẦN THƠ</h4>
          <p style={styles.subText}>Hệ thống Quản lý Thư viện Điện tử thông minh (CTUT LMS MVP)</p>
        </div>
        <div style={styles.infoCol}>
          <p style={styles.text}>📍 <strong>Địa chỉ:</strong> 256 Nguyễn Văn Cừ, Quận Ninh Kiều, TP. Cần Thơ</p>
          <p style={styles.text}>📞 <strong>Liên hệ hành chính:</strong> (0292) 3894050</p>
          <p style={styles.text}>📧 <strong>Hỗ trợ kỹ thuật:</strong> thuvien@ctuet.edu.vn</p>
        </div>
      </div>
      <div style={styles.bottomSection}>
        <p style={styles.copyright}>
          © {currentYear} CTUT Library Center. Phát triển bởi Đội ngũ Công nghệ thông tin CTUT. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

const styles = {
  footer: { backgroundColor: '#212529', color: '#f8f9fa', padding: '32px 24px 16px 24px', marginTop: 'auto', borderTop: '4px solid #0056b3', fontFamily: 'Arial, sans-serif' },
  topSection: { display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px', maxWidth: '1200px', margin: '0 auto', paddingBottom: '20px', borderBottom: '1px solid #343a40' },
  brandCol: { flex: 1, minWidth: '280px' },
  title: { margin: '0 0 8px 0', fontSize: '15px', fontWeight: 'bold', color: '#fff', letterSpacing: '0.5px' },
  subText: { margin: 0, fontSize: '13px', color: '#a8aeb4' },
  infoCol: { flex: 1, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '6px' },
  text: { margin: 0, fontSize: '13px', color: '#cbd5e1' },
  bottomSection: { maxWidth: '1200px', margin: '12px auto 0 auto', textAlign: 'center' },
  copyright: { margin: 0, fontSize: '12px', color: '#6c757d' }
};

export default Footer;