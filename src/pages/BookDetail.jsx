// src/pages/BookDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import API_URL from "../config/api";

function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [relatedBooks, setRelatedBooks] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [isBorrowing, setIsBorrowing] = useState(false);
  const { token, isLoggedIn, currentUser } = useSelector((state) => state.auth);

  const [showSlipModal, setShowSlipModal] = useState(false); 
  const [showSuccessModal, setShowSuccessModal] = useState(false); 
  const [studentPhone, setStudentPhone] = useState(""); 
  const [borrowNotes, setBorrowNotes] = useState(""); 

  // 🔥 GIẢI PHÁP SỬA LỖI IMPURE: Khởi tạo State lưu trữ chữ ngày hẹn trả thay vì tính trực tiếp khi render
  const [formattedDueDate, setFormattedDueDate] = useState("");

  const [prevId, setPrevId] = useState(id);

  if (id !== prevId) {
    setPrevId(id);       
    setIsLoading(true);  
    setBook(null);       
    setRelatedBooks([]); 
  }

  useEffect(() => {
    fetch(`${API_URL}/books/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Không thể tải thông tin cuốn sách này!");
        return res.json();
      })
      .then((data) => {
        setBook(data);
        setIsLoading(false);
      })
      .catch((err) => {
        toast.error(err.message);
        setIsLoading(false);
      });

    fetch(`${API_URL}/books/${id}/related`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setRelatedBooks(data);
      })
      .catch((err) => console.error("Lỗi tải sách liên quan:", err));

  }, [id]);

  const handleBorrowClick = () => {
    if (!isLoggedIn) {
      toast.warning("🔒 Vui lòng đăng nhập tài khoản sinh viên để mượn sách!");
      navigate('/login');
      return;
    }
    
    // 🔥 GIẢI PHÁP SỬA LỖI IMPURE: Tính toán ngày hẹn trả an toàn bên trong sự kiện click chuột
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 14);
    setFormattedDueDate(targetDate.toLocaleDateString('vi-VN'));

    setStudentPhone("");
    setBorrowNotes("");
    setShowSlipModal(true);
  };

  const handleConfirmBorrowAction = () => {
    // 🔥 BIỆN PHÁP BẢO MẬT: Tạo biểu thức chính quy (Regex) kiểm thử định dạng số điện thoại di động Việt Nam
    const phoneRegex = /^(03|05|07|08|09)\d{8}$/;
    
    if (!phoneRegex.test(studentPhone.trim())) {
      toast.warning("⚠️ Số điện thoại không hợp lệ! Vui lòng nhập đúng định dạng 10 chữ số của Việt Nam (bắt đầu bằng các đầu số 03, 05, 07, 08, 09).");
      return;
    }

    setIsBorrowing(true);
    
    fetch(`${API_URL}/borrows`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        bookId: book._id,
        phone: studentPhone.trim(),
        notes: borrowNotes.trim()
      })
    })
      .then((res) => {
        if (!res.ok) return res.json().then((err) => { throw new Error(err.message); });
        return res.json();
      })
      .then(() => {
        setBook(prev => ({ ...prev, quantity: prev.quantity - 1 }));
        setShowSlipModal(false); 
        setShowSuccessModal(true); 
      })
      .catch((err) => toast.error(err.message || "Có lỗi xảy ra!"))
      .finally(() => setIsBorrowing(false));
  };

  if (isLoading) {
    return <div style={styles.centerText}>🔄 Đang tải danh mục catalog cuốn sách...</div>;
  }

  if (!book) {
    return <div style={styles.centerText}>❌ Không tìm thấy dữ liệu cuốn sách này.</div>;
  }

  const isOutOfStock = book.quantity <= 0;

  return (
    <div style={styles.container}>
      <div style={styles.topGrid}>
        <div style={styles.imageCol}><img src={book.cover} alt={book.title} style={styles.coverImage} /></div>
        <div style={styles.metaCol}>
          <span style={styles.categoryTag}>{book.category?.name || "Chưa phân loại"}</span>
          <h1 style={styles.title}>{book.title}</h1>
          <p style={styles.author}>✍️ Tác giả: <strong>{book.author}</strong></p>
          <div style={styles.stockZone}>
            <span style={isOutOfStock ? styles.outStockBadge : styles.inStockBadge}>
              {isOutOfStock ? "❌ Hết sách trong kho" : `✓ Còn sẵn ${book.quantity} cuốn tại quầy`}
            </span>
          </div>
          <p style={styles.hintText}>ℹ️ Quy chế: Mượn tối đa 3 cuốn cùng lúc, thời hạn hoàn trả trong vòng 14 ngày.</p>
          <button onClick={handleBorrowClick} disabled={isOutOfStock || isBorrowing} style={styles.borrowBtn(isOutOfStock || isBorrowing)}>
            {isOutOfStock ? "Đã hết sách khả dụng" : "⚡ Đăng ký mượn sách"}
          </button>
        </div>
      </div>

      <div style={styles.detailsBox}>
        <h3 style={styles.sectionTitle}>📋 Thông tin chi tiết kỹ thuật</h3>
        <table style={styles.table}>
          <tbody>
            <tr><td style={styles.tdLabel}>Mã số định danh ISBN</td><td style={styles.tdValue}>{book.isbn || <span style={styles.emptyText}>Chưa cập nhật</span>}</td></tr>
            <tr><td style={styles.tdLabel}>Nhà xuất bản</td><td style={styles.tdValue}>{book.publisher || <span style={styles.emptyText}>Chưa cập nhật</span>}</td></tr>
            <tr><td style={styles.tdLabel}>Năm xuất bản</td><td style={styles.tdValue}>{book.publishYear || "2026"}</td></tr>
            <tr><td style={styles.tdLabel}>Số trang</td><td style={styles.tdValue}>{book.pages ? `${book.pages} trang` : <span style={styles.emptyText}>Chưa cập nhật</span>}</td></tr>
          </tbody>
        </table>
        <h3 style={{ ...styles.sectionTitle, marginTop: '24px' }}>📖 Tóm tắt nội dung</h3>
        <div style={styles.descriptionContent}>
          {book.description ? book.description.split('\n').map((p, i) => <p key={i} style={{ margin: '0 0 8px 0' }}>{p}</p>) : <p style={styles.emptyText}>Chưa có tóm tắt.</p>}
        </div>
      </div>

      {relatedBooks.length > 0 && (
        <div style={styles.relatedBox}>
          <h3 style={styles.sectionTitle}>📚 Có thể bạn muốn đọc (Cùng thể loại)</h3>
          <div style={styles.relatedGrid}>
            {relatedBooks.map((rBook) => (
              <div key={rBook._id} style={styles.relatedCard} onClick={() => navigate(`/book/${rBook._id}`)}>
                <div style={styles.relatedImgWrapper}><img src={rBook.cover} alt={rBook.title} style={styles.relatedImg} /></div>
                <div style={styles.relatedInfo}>
                  <h4 style={styles.relatedTitle}>{rBook.title}</h4>
                  <p style={styles.relatedAuthor}>TG: {rBook.author}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showSlipModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.slipBox}>
            <div style={styles.slipHeader}>
              <h3 style={{ margin: 0, fontSize: '16px' }}>🎫 PHIẾU ĐĂNG KÝ MƯỢN SÁCH ĐIỆN TỬ</h3>
              <button onClick={() => setShowSlipModal(false)} style={styles.closeXBtn}>&times;</button>
            </div>
            
            <div style={styles.slipBody}>
              <div style={styles.slipRow}><span style={styles.slipLabel}>Độc giả mượn:</span><strong style={styles.slipValue}>{currentUser?.name}</strong></div>
              <div style={styles.slipRow}><span style={styles.slipLabel}>Mã định danh Email:</span><span style={styles.slipValue}>{currentUser?.email}</span></div>
              <div style={styles.slipRow}><span style={styles.slipLabel}>Tên cuốn sách:</span><strong style={{...styles.slipValue, color: '#0056b3'}}>{book.title}</strong></div>
              <div style={styles.slipRow}><span style={styles.slipLabel}>Thời hạn giữ sách:</span><span style={styles.slipValue}>14 ngày (Hạn trả: {formattedDueDate})</span></div>
              
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Số điện thoại nhận thông báo báo hạn (Bắt buộc):</label>
                <input 
                  type="text" 
                  maxLength="10"
                  placeholder="Nhập số điện thoại di động (Ví dụ: 0394...)" 
                  value={studentPhone} 
                  onChange={(e) => setStudentPhone(e.target.value)} 
                  style={styles.slipInput}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Ghi chú gửi Thủ thư quầy (Nếu có):</label>
                <textarea 
                  rows="2" 
                  placeholder="Ví dụ: Xin mượn bản đính kèm CD, hoặc hẹn nhận sách ca chiều..." 
                  value={borrowNotes} 
                  onChange={(e) => setBorrowNotes(e.target.value)} 
                  style={styles.slipTextarea}
                />
              </div>
            </div>

            <div style={styles.slipFooter}>
              <button onClick={() => setShowSlipModal(false)} style={styles.cancelActionBtn} disabled={isBorrowing}>Hủy yêu cầu</button>
              <button 
                onClick={handleConfirmBorrowAction} 
                disabled={isBorrowing || !studentPhone.trim()} 
                style={styles.confirmActionBtn(isBorrowing || !studentPhone.trim())}
              >
                {isBorrowing ? "Đang ghi nhận..." : "Xác nhận đăng ký mượn"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.successBox}>
            <div style={styles.successIconZone}>🎉</div>
            <h3 style={styles.successTitle}>ĐĂNG KÝ GIỮ SÁCH THÀNH CÔNG!</h3>
            <p style={styles.successText}>
              Hệ thống trung tâm thư viện học viện đã phê duyệt và khởi tạo mã phiếu mượn điện tử thành công cho cuốn sách <strong>{book.title}</strong>.
            </p>
            <div style={styles.noticeCard}>
              📌 <strong>Hướng dẫn nhận sách vật lý:</strong> Độc giả vui lòng mang theo Thẻ sinh viên CTUT hoặc CCCD hợp lệ đến gặp Thủ thư tại quầy phục vụ trong vòng <strong>48 giờ làm việc</strong> để hoàn tất thủ tục nhận sách tay. Sau thời gian này, phiếu giữ sách trực tuyến sẽ tự động hủy bỏ quy chế để nhường suất cho sinh viên khác.
            </div>
            <button onClick={() => setShowSuccessModal(false)} style={styles.successCloseBtn}>Tôi đã nắm rõ quy định</button>
          </div>
        </div>
      )}

    </div>
  );
}

const styles = {
  container: { maxWidth: '1000px', margin: '24px auto', padding: '0 24px', fontFamily: 'Arial, sans-serif' },
  centerText: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', fontSize: '15px', fontWeight: 'bold', color: '#0056b3' },
  topGrid: { display: 'flex', gap: '32px', flexWrap: 'wrap', backgroundColor: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  imageCol: { flex: '1', minWidth: '240px', display: 'flex', justifyContent: 'center' },
  coverImage: { width: '100%', maxWidth: '240px', height: '330px', objectFit: 'cover', borderRadius: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
  metaCol: { flex: '1.5', minWidth: '280px', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  categoryTag: { alignSelf: 'flex-start', backgroundColor: '#e3f2fd', color: '#0d47a1', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' },
  title: { fontSize: '24px', color: '#212529', margin: '10px 0 6px 0' },
  author: { fontSize: '15px', color: '#495057', margin: '0 0 12px 0' },
  stockZone: { marginBottom: '16px' },
  inStockBadge: { backgroundColor: '#d4edda', color: '#155724', padding: '4px 10px', borderRadius: '4px', fontSize: '13px', fontWeight: 'bold' },
  outStockBadge: { backgroundColor: '#f8d7da', color: '#721c24', padding: '4px 10px', borderRadius: '4px', fontSize: '13px', fontWeight: 'bold' },
  hintText: { fontSize: '12px', color: '#6c757d', backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '4px', margin: '0 0 16px 0', borderLeft: '3px solid #0056b3' },
  borrowBtn: (isDisabled) => ({ width: '100%', maxWidth: '240px', padding: '12px', border: 'none', borderRadius: '4px', fontSize: '15px', fontWeight: 'bold', color: '#fff', backgroundColor: isDisabled ? '#ced4da' : '#0056b3', cursor: isDisabled ? 'not-allowed' : 'pointer' }),
  detailsBox: { backgroundColor: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginTop: '20px' },
  sectionTitle: { margin: '0 0 12px 0', fontSize: '16px', color: '#0056b3', borderBottom: '2px solid #f1f3f5', paddingBottom: '6px', fontWeight: 'bold' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
  tdLabel: { width: '25%', padding: '10px 6px', color: '#6c757d', fontWeight: '600', borderBottom: '1px solid #f1f3f5' },
  tdValue: { width: '75%', padding: '10px 6px', color: '#212529', borderBottom: '1px solid #f1f3f5' },
  emptyText: { color: '#adb5bd', fontStyle: 'italic' },
  descriptionContent: { fontSize: '14px', color: '#495057', lineHeight: '1.5' },
  relatedBox: { backgroundColor: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginTop: '20px' },
  relatedGrid: { display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '12px' },
  relatedCard: { flex: '1', minWidth: '160px', maxWidth: '200px', border: '1px solid #e9ecef', borderRadius: '6px', overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column', backgroundColor: '#fff' },
  relatedImgWrapper: { width: '100%', height: '180px', backgroundColor: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  relatedImg: { width: '100%', height: '100%', objectFit: 'cover' },
  relatedInfo: { padding: '10px', display: 'flex', flexDirection: 'column', gap: '2px' },
  relatedTitle: { margin: 0, fontSize: '13px', color: '#212529', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  relatedAuthor: { margin: 0, fontSize: '11px', color: '#6c757d' },

  modalOverlay: { position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0, 0, 0, 0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999, backdropFilter: 'blur(4px)', padding: '16px', boxSizing: 'border-box' },
  slipBox: { width: "100%", maxWidth: "480px", backgroundColor: "#fff", borderRadius: "10px", boxShadow: "0 10px 30px rgba(0,0,0,0.15)", overflow: "hidden", display: "flex", flexDirection: "column" },
  slipHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", backgroundColor: "#f8f9fa", borderBottom: "1px solid #dee2e6", color: "#333", fontWeight: "bold" },
  closeXBtn: { background: "none", border: "none", fontSize: "22px", cursor: "pointer", color: "#6c757d", lineHeight: 1 },
  slipBody: { padding: "20px", display: "flex", flexDirection: "column", gap: "10px" },
  slipRow: { display: "flex", justifyContent: "space-between", fontSize: "14px", borderBottom: "1px dashed #f1f3f5", paddingBottom: "8px" },
  slipLabel: { color: "#6c757d", fontWeight: "500" },
  slipValue: { color: "#212529", textAlign: "right" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "6px", marginTop: "8px" },
  inputLabel: { fontSize: "13px", color: "#333", fontWeight: "bold" },
  slipInput: { width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ced4da", fontSize: "13px", outline: "none", boxSizing: "border-box" },
  slipTextarea: { width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ced4da", fontSize: "13px", outline: "none", boxSizing: "border-box", resize: "none", fontFamily: "Arial" },
  slipFooter: { display: "flex", gap: "12px", justifyContent: "flex-end", padding: "14px 20px", backgroundColor: "#f8f9fa", borderTop: "1px solid #dee2e6" },
  cancelActionBtn: { padding: "8px 16px", backgroundColor: "#fff", color: "#6c757d", border: "1px solid #ced4da", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", fontSize: "13px" },
  confirmActionBtn: (isDisabled) => ({ padding: "8px 18px", backgroundColor: isDisabled ? "#ced4da" : "#0056b3", color: "#fff", border: "none", borderRadius: "4px", cursor: isDisabled ? "not-allowed" : "pointer", fontWeight: "bold", fontSize: "13px" }),

  successBox: { width: "100%", maxWidth: "460px", backgroundColor: "#fff", borderRadius: "12px", padding: "32px 24px", boxShadow: "0 12px 40px rgba(0,0,0,0.2)", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" },
  successIconZone: { width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "#e8f5e9", color: "#2e7d32", fontSize: "32px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" },
  successTitle: { fontSize: "18px", color: "#2e7d32", margin: "0 0 10px 0", fontWeight: "bold", letterSpacing: "0.5px" },
  successText: { fontSize: "14px", color: "#495057", margin: "0 0 16px 0", lineHeight: "1.5" },
  noticeCard: { backgroundColor: "#fff3cd", color: "#856404", padding: "14px 16px", borderRadius: "6px", fontSize: "13px", textAlign: "justify", lineHeight: "1.5", borderLeft: "4px solid #ffc107", marginBottom: "24px" },
  successCloseBtn: { width: "100%", padding: "12px", backgroundColor: "#2e7d32", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", fontSize: "14px", boxShadow: "0 2px 6px rgba(46,125,50,0.2)" }
};

export default BookDetail;