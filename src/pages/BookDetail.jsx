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
  const { token, isLoggedIn } = useSelector((state) => state.auth);

  const [prevId, setPrevId] = useState(id);

  if (id !== prevId) {
    setPrevId(id);       
    setIsLoading(true);  
    setBook(null);       
    setRelatedBooks([]); 
  }

  useEffect(() => {
    // 1. Tải thông tin sách chính (Công khai)
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

    // 2. Tải sách liên quan cùng thể loại (Công khai - Sinh viên/Khách đều xem được)
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

    setIsBorrowing(true);
    fetch(`${API_URL}/borrows`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ bookId: book._id })
    })
      .then((res) => {
        if (!res.ok) return res.json().then((err) => { throw new Error(err.message); });
        return res.json();
      })
      .then(() => {
        toast.success(`📖 Đăng ký mượn thành công! Thời hạn giữ sách là 14 ngày.`);
        setBook(prev => ({ ...prev, quantity: prev.quantity - 1 }));
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
            {isBorrowing ? "Đang xử lý..." : isOutOfStock ? "Đã hết sách khả dụng" : "⚡ Đăng ký mượn sách"}
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

      {/* HIỂN THỊ SÁCH LIÊN QUAN CHO SINH VIÊN */}
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
  relatedAuthor: { margin: 0, fontSize: '11px', color: '#6c757d' }
};

export default BookDetail;