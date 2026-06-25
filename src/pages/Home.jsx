// src/pages/Home.jsx
import { useState, useEffect } from 'react';
import BookCard from '../components/BookCard';
import API_URL from "../config/api";

function Home() {
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // State quản lý từ khóa tìm kiếm
  const [loading, setLoading] = useState(true);

  // Lấy danh sách sách từ Server MongoDB đám mây khi trang được tải
  useEffect(() => {
    fetch(`${API_URL}/books`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setBooks(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Lỗi lấy dữ liệu kho sách:", err);
        setLoading(false);
      });
  }, []);

  // BIẾN BỘ LỌC THÔNG MINH: Tìm kiếm không phân biệt chữ hoa / chữ thường
  // Sinh viên có thể gõ tìm theo "Tên sách" hoặc "Tên tác giả" đều được
  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div style={{ padding: '24px', fontFamily: 'Arial' }}>Đang tải danh sách sách từ thư viện...</div>;

  return (
    <div style={{ padding: '24px', fontFamily: 'Arial, sans-serif', backgroundColor: '#f8f9fa', minHeight: '88vh' }}>
      
      {/* THANH TÌM KIẾM SÁCH CHUẨN UX */}
      <div style={styles.searchContainer}>
        <input 
          type="text" 
          placeholder="🔍 Tìm kiếm sách theo tên sách hoặc tên tác giả..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)} // Cập nhật từ khóa liên tục khi gõ
          style={styles.searchInput}
        />
      </div>

      <h2 style={{ color: '#333', marginBottom: '24px' }}>📚 Kho Sách Thư Viện Hiện Có</h2>

      {/* LƯỚI HIỂN THỊ DANH SÁCH CARD SÁCH */}
      <div style={styles.grid}>
        {filteredBooks.length > 0 ? (
          filteredBooks.map((book) => (
            // Truyền key chuẩn _id của MongoDB xuống component con
            <BookCard key={book._id} book={book} />
          ))
        ) : (
          <div style={styles.noResult}>
            Không tìm thấy cuốn sách nào phù hợp với từ khóa "<strong>{searchTerm}</strong>".
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  searchContainer: { marginBottom: '32px', display: 'flex', justifyContent: 'center' },
  searchInput: { 
    width: '100%', 
    maxWidth: '600px', 
    padding: '14px 24px', 
    borderRadius: '30px', 
    border: '2px solid #007bff', 
    fontSize: '16px', 
    outline: 'none', 
    boxShadow: '0 4px 12px rgba(0,123,255,0.08)', 
    boxSizing: 'border-box',
    transition: '0.3s'
  },
  grid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
    gap: '24px' 
  },
  noResult: { 
    gridColumn: '1 / -1', 
    padding: '32px', 
    textAlign: 'center', 
    color: '#6c757d', 
    backgroundColor: '#fff', 
    borderRadius: '8px', 
    border: '1px solid #dee2e6',
    fontSize: '15px'
  }
};

export default Home;