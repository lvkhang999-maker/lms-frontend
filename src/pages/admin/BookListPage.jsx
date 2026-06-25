// src/pages/admin/BookListPage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

function BookListPage() {
  const [books, setBooks] = useState([]);
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [showDeleteBookModal, setShowDeleteBookModal] = useState(false);
  const [bookIdToDelete, setBookIdToDelete] = useState(null);

  const fetchBooks = () => {
    fetch("http://localhost:5000/api/books")
      .then((res) => res.json())
      .then((data) => { if (Array.isArray(data)) setBooks(data); })
      .catch((err) => console.error("Lỗi tải kho sách:", err));
  };

  useEffect(() => { fetchBooks(); }, []);

  const confirmDeleteBookAction = () => {
    fetch(`http://localhost:5000/api/books/${bookIdToDelete}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) return res.json().then((err) => { throw new Error(err.message); });
        return res.json();
      })
      .then(() => {
        toast.success("🗑️ Đã xóa đầu sách khỏi thư viện thành công!");
        fetchBooks(); // Tải lại bảng ngay lập tức
      })
      .catch((err) => toast.error(err.message))
      .finally(() => { setShowDeleteBookModal(false); setBookIdToDelete(null); });
  };

  return (
    <div style={styles.boxTable}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0 }}>📚 Danh Sách Sách Trong Kho ({books.length})</h3>
        <button onClick={() => navigate("/admin/add-book")} style={styles.addFastBtn}>＋ Thêm sách mới</button>
      </div>

      <table style={styles.table}>
        <thead>
          <tr style={styles.thRow}>
            <th style={styles.th}>Ảnh bìa</th>
            <th style={styles.th}>Tên Sách / Tác Giả</th>
            <th style={styles.th}>Thể Loại</th>
            <th style={styles.th}>SL Kho</th>
            <th style={styles.th}>Tác vụ quản trị</th>
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <tr key={book._id} style={styles.trRow}>
              <td style={styles.td}>
                <img src={book.cover} alt="Bìa" style={styles.tdCover} />
              </td>
              <td style={styles.td}>
                <strong>{book.title}</strong><br />
                <small style={{ color: "#666" }}>TG: {book.author}</small>
              </td>
              <td style={styles.td}>{book.category?.name || <span style={{ color: "#aaa" }}>Chưa phân loại</span>}</td>
              <td style={styles.td}><strong>{book.quantity}</strong> cuốn</td>
              <td style={styles.td}>
                <div style={{ display: "flex", gap: "8px" }}>
                  {/* 🔥 SỬA THÀNH ĐIỀU HƯỚNG SANG TRANG FORM CÓ KÈM ID SÁCH CẦN SỬA */}
                  <button onClick={() => navigate(`/admin/edit-book/${book._id}`)} style={styles.editBtn}>✏️ Sửa</button>
                  <button onClick={() => { setBookIdToDelete(book._id); setShowDeleteBookModal(true); }} style={styles.deleteBtn}>🗑️ Xóa</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* CUSTOM MODAL XÁC NHẬN XÓA SÁCH */}
      {showDeleteBookModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <h3 style={{ margin: "0 0 12px 0", color: "#dc3545" }}>🗑️ Xác nhận xóa sách</h3>
            <p style={{ margin: "0 0 20px 0", color: "#555", fontSize: "14px" }}>Bạn có chắc chắn muốn xóa cuốn sách này khỏi kho dữ liệu đám mây thư viện?</p>
            <div style={styles.modalButtons}>
              <button onClick={() => setShowDeleteBookModal(false)} style={styles.cancelModalBtn}>Hủy bỏ</button>
              <button onClick={confirmDeleteBookAction} style={styles.confirmModalBtn}>Xác nhận xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  boxTable: { width: "100%" },
  addFastBtn: { padding: "8px 14px", backgroundColor: "#28a745", color: "#fff", border: "none", borderRadius: "4px", fontWeight: "bold", fontSize: "13px", cursor: "pointer" },
  table: { width: "100%", borderCollapse: "collapse", marginTop: "12px" },
  thRow: { backgroundColor: "#f8f9fa" },
  th: { padding: "12px", textAlign: "left", borderBottom: "2px solid #dee2e6", fontSize: "14px", color: '#495057' },
  td: { padding: "12px", borderBottom: "1px solid #eee", fontSize: "14px", verticalAlign: "middle" },
  tdCover: { width: "42px", height: "58px", objectFit: "cover", borderRadius: "4px", backgroundColor: "#f1f3f5", border: "1px solid #dee2e6" },
  editBtn: { padding: "6px 12px", backgroundColor: "#ffc107", color: "#000", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px", fontWeight: "bold" },
  deleteBtn: { padding: "6px 12px", backgroundColor: "#dc3545", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px", fontWeight: "bold" },
  modalOverlay: { position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0, 0, 0, 0.4)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 },
  modalBox: { width: "340px", backgroundColor: "#fff", padding: "24px", borderRadius: "8px", boxShadow: "0 4px 24px rgba(0,0,0,0.15)", textAlign: "center" },
  modalButtons: { display: "flex", gap: "12px", justifyContent: "center" },
  cancelModalBtn: { padding: "8px 16px", backgroundColor: "#e2e3e5", color: "#383d41", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", fontSize: "14px" },
  confirmModalBtn: { padding: "8px 16px", backgroundColor: "#dc3545", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", fontSize: "14px" },
};

export default BookListPage;