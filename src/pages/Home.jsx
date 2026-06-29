// src/pages/Home.jsx
import { useState, useEffect } from 'react';
import BookCard from '../components/BookCard';
import API_URL from "../config/api";

function Home() {
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); 
  const [loading, setLoading] = useState(true);

  // --- HỆ THỐNG STATE QUẢN LÝ PHÂN TRANG ĐỘNG ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8); // Mặc định hiển thị tối đa 8 cuốn/trang theo yêu cầu

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
  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- LUỒNG TÍNH TOÁN PHÂN ĐOẠN SLICE DỮ LIỆU ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBooks.slice(indexOfFirstItem, indexOfLastItem); // Mảng sách hiển thị thực tế trên trang hiện tại
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);

  // LUỒNG XỬ LÝ AN TOÀN: Khi gõ tìm kiếm, ép số trang quay về 1 để tránh bẫy tràn phân đoạn rỗng
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); 
  };

  // LUỒNG XỬ LÝ AN TOÀN: Khi đổi số lượng hiển thị, ép về trang 1
  const handleLimitChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  if (loading) return <div style={{ padding: '24px', fontFamily: 'Arial' }}>Đang tải danh sách sách từ thư viện...</div>;

  return (
    <div style={{ padding: '24px', fontFamily: 'Arial, sans-serif', backgroundColor: '#f8f9fa', minHeight: '88vh' }}>
      
      {/* THANH TÌM KIẾM SÁCH CHUẨN UX */}
      <div style={styles.searchContainer}>
        <input 
          type="text" 
          placeholder="🔍 Tìm kiếm sách theo tên sách hoặc tên tác giả..." 
          value={searchTerm}
          onChange={handleSearchChange} 
          style={styles.searchInput}
        />
      </div>

      {/* THANH ĐIỀU HƯỚNG CẤU HÌNH SỐ LƯỢNG HIỂN THỊ */}
      <div style={styles.catalogHeaderFlex}>
        <h2 style={{ color: '#333', margin: 0, fontSize: '20px' }}>📚 Kho Sách Thư Viện Hiện Có ({filteredBooks.length})</h2>
        <div style={styles.limitZone}>
          <span style={styles.limitLabel}>Hiển thị:</span>
          <select value={itemsPerPage} onChange={handleLimitChange} style={styles.limitSelect}>
            <option value={4}>4 cuốn / trang</option>
            <option value={8}>8 cuốn / trang (Mặc định)</option>
            <option value={12}>12 cuốn / trang</option>
            <option value={24}>24 cuốn / trang</option>
          </select>
        </div>
      </div>

      {/* LƯỚI HIỂN THỊ DANH SÁCH CARD SÁCH VỚI MẢNG ĐÃ CẮT PHÂN TRANG */}
      <div style={styles.grid}>
        {currentItems.length > 0 ? (
          currentItems.map((book) => (
            <BookCard key={book._id} book={book} />
          ))
        ) : (
          <div style={styles.noResult}>
            Không tìm thấy cuốn sách nào phù hợp với từ khóa "<strong>{searchTerm}</strong>".
          </div>
        )}
      </div>

      {/* ĐỒNG BỘ: Hệ thống điều hướng phân trang hình tròn Pastel chuẩn tâm đối xứng */}
      {totalPages > 1 && (
        <div style={styles.paginationContainer}>
          <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} style={styles.pageArrowBtn(currentPage === 1)}>«</button>
          {Array.from({ length: totalPages }, (_, index) => (
            <button key={index + 1} onClick={() => setCurrentPage(index + 1)} style={styles.pageCircleBtn(currentPage === index + 1)}>{index + 1}</button>
          ))}
          <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} style={styles.pageArrowBtn(currentPage === totalPages)}>»</button>
        </div>
      )}
    </div>
  );
}

const styles = {
  searchContainer: { marginBottom: '32px', display: 'flex', justifyContent: 'center' },
  searchInput: { width: '100%', maxWidth: '600px', padding: '14px 24px', borderRadius: '30px', border: '2px solid #007bff', fontSize: '16px', outline: 'none', boxShadow: '0 4px 12px rgba(0,123,255,0.08)', boxSizing: 'border-box', transition: '0.3s' },
  
  // STYLES MỚI: Thanh tiêu đề catalog kết hợp bộ Combobox chọn limit gọn gàng
  catalogHeaderFlex: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" },
  limitZone: { display: "flex", alignItems: "center", gap: "8px" },
  limitLabel: { fontSize: "13px", color: "#6c757d", fontWeight: "bold" },
  limitSelect: { padding: "6px 12px", borderRadius: "20px", border: "1px solid #ced4da", fontSize: "13px", outline: "none", cursor: "pointer", backgroundColor: "#fff", color: "#495057", fontWeight: "bold", boxShadow: "0 2px 6px rgba(0,0,0,0.02)" },

  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' },
  noResult: { gridColumn: '1 / -1', padding: '32px', textAlign: 'center', color: '#6c757d', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #dee2e6', fontSize: '15px' },

  // STYLES ĐỒNG BỘ: Bộ nút phân trang hình tròn Pastel kiên cố
  paginationContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '36px', padding: '10px 0' },
  pageCircleBtn: (isActive) => ({ 
    width: '34px', 
    height: '34px', 
    borderRadius: '50%', 
    border: isActive ? 'none' : '1px solid #bbdefb', 
    backgroundColor: isActive ? '#4b9cd3' : '#e3f2fd', 
    color: isActive ? '#fff' : '#1e88e5', 
    fontWeight: 'bold', 
    fontSize: '13px', 
    cursor: 'pointer', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    lineHeight: 0, 
    padding: 0,
    transition: '0.2s all ease',
    boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
  }),
  pageArrowBtn: (isDisabled) => ({ 
    border: 'none', 
    backgroundColor: 'transparent', 
    color: isDisabled ? '#cfd8dc' : '#4b9cd3', 
    fontSize: '20px', 
    fontWeight: 'bold', 
    cursor: isDisabled ? 'not-allowed' : 'pointer', 
    padding: '0 10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  })
};

export default Home;