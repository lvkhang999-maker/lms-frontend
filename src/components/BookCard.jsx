// src/components/BookCard.jsx
import { Link } from 'react-router-dom';

function BookCard({ book }) {
  return (
    <div style={styles.card} className="book-card-item">
      <img src={book.cover} alt={book.title} style={styles.cover} />
      <div style={styles.info}>
        {book.quantity <= 2 && book.quantity > 0 && (
          <span style={styles.badge}>SÁCH SẮP HẾT</span>
        )}
        <h3 style={styles.title}>{book.title}</h3>
        <p style={styles.author}>TG: {book.author}</p>
        <span style={styles.category}>{book.category?.name || "Chưa phân loại"}</span>
        <p style={styles.quantity}>Kho: {book.quantity} cuốn</p>
        
        {/* SỬA ĐOẠN NÀY: Thay book.id thành book._id */}
        <Link to={`/book/${book._id}`} style={styles.btn}>
          Xem Chi Tiết
        </Link>
      </div>
    </div>
  );
}

const styles = {
  card: { display: 'flex', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '16px', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', gap: '16px' },
  cover: { width: '100px', height: '140px', objectFit: 'cover', borderRadius: '4px', backgroundColor: '#f0f0f0' },
  info: { display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, position: 'relative' },
  title: { margin: '0 0 4px 0', fontSize: '16px', color: '#333' },
  author: { margin: '0', fontSize: '14px', color: '#666' },
  category: { fontSize: '12px', color: '#007bff', fontWeight: 'bold' },
  quantity: { margin: '4px 0 0 0', fontSize: '13px', color: '#28a745', fontWeight: 'bold' },
  btn: { marginTop: 'auto', padding: '8px', backgroundColor: '#007bff', color: '#fff', textDecoration: 'none', borderRadius: '4px', textAlign: 'center', fontSize: '14px', fontWeight: 'bold' },
  badge: { position: 'absolute', top: 0, right: 0, backgroundColor: '#ffc107', color: '#000', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }
};

export default BookCard;