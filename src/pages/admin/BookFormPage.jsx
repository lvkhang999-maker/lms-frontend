// src/pages/admin/BookFormPage.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // 🔥 Import useParams, useNavigate
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

function BookFormPage() {
  const { id } = useParams(); // 🔥 Lấy ID từ URL (Nếu có ID nghĩa là đang ở chế độ SỬA)
  const isEditMode = !!id; 
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    title: "", author: "", category: "", quantity: 1,
    isbn: "", publisher: "", publishYear: 2026, pages: 0, description: ""
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // 1. Tải danh mục loại sách
  useEffect(() => {
    fetch("http://localhost:5000/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
          if (data.length > 0 && !formData.category && !isEditMode) {
            setFormData((prev) => ({ ...prev, category: data[0]._id }));
          }
        }
      }).catch((err) => console.error(err));
  }, []);

  // 2. 🔥 NẾU Ở CHẾ ĐỘ SỬA: Tự động gọi API lấy thông tin sách cũ điền vào form
  useEffect(() => {
    if (isEditMode) {
      fetch(`http://localhost:5000/api/books/${id}`)
        .then((res) => res.json())
        .then((book) => {
          setFormData({
            title: book.title || "",
            author: book.author || "",
            category: book.category?._id || book.category || "",
            quantity: book.quantity || 0,
            isbn: book.isbn || "",
            publisher: book.publisher || "",
            publishYear: book.publishYear || 2026,
            pages: book.pages || 0,
            description: book.description || ""
          });
          setImagePreview(book.cover);
        })
        .catch((err) => console.error("Lỗi nạp sách cũ:", err));
    }
  }, [id, isEditMode]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) { setSelectedFile(file); setImagePreview(URL.createObjectURL(file)); }
  };

  const handleBookSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.author || !formData.category) { toast.error("Vui lòng điền đầy đủ thông tin!"); return; }
    if (parseInt(formData.pages) <= 0) { toast.error("❌ Số trang của cuốn sách phải lớn hơn 0!"); return; }

    setIsSubmitting(true); setUploadProgress(0);

    const dataToSend = new FormData();
    dataToSend.append("title", formData.title);
    dataToSend.append("author", formData.author);
    dataToSend.append('category', formData.category);
    dataToSend.append("quantity", formData.quantity);
    dataToSend.append("isbn", formData.isbn);
    dataToSend.append("publisher", formData.publisher);
    dataToSend.append("publishYear", formData.publishYear);
    dataToSend.append("pages", formData.pages);
    dataToSend.append("description", formData.description);
    if (selectedFile) dataToSend.append("cover", selectedFile);

    // 🔥 TỰ ĐỔI MÔC URL VÀ PHƯƠNG THỨC PUT HOẶC POST TÙY BIẾN CHẾ ĐỘ
    const url = isEditMode ? `http://localhost:5000/api/books/${id}` : "http://localhost:5000/api/books";
    const method = isEditMode ? "PUT" : "POST";

    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) { setUploadProgress(Math.round((event.loaded / event.total) * 100)); }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        toast.success(isEditMode ? "📝 Cập nhật thông tin đầu sách thành công!" : "＋ Thêm sách mới thành công!");
        navigate("/admin/books"); // Lưu xong tự đá thủ thư về lại trang bảng danh sách
      } else {
        setIsSubmitting(false); toast.error("Có lỗi từ máy chủ xử lý!");
      }
    };
    xhr.onerror = () => { toast.error("Lỗi kết nối!"); setIsSubmitting(false); };
    xhr.send(dataToSend);
  };

  return (
    <div style={styles.boxForm}>
      <h3 style={{ color: isEditMode ? "#e0a800" : "#28a745", marginTop: 0 }}>
        {isEditMode ? "📝 Cập Nhật Thông Tin Sách Thư Viện" : "＋ Thêm Sách Mới Vào Kho"}
      </h3>
      <form onSubmit={handleBookSubmit}>
        <div style={styles.formGroup}><label style={styles.label}>Tên sách:</label><input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} style={styles.input} disabled={isSubmitting} required /></div>
        <div style={styles.formGroup}><label style={styles.label}>Tác giả:</label><input type="text" value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })} style={styles.input} disabled={isSubmitting} required /></div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Thể loại liên kết:</label>
          <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} style={styles.input} disabled={isSubmitting}>
            {categories.map((cat) => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
          </select>
        </div>
        <div style={styles.formGroup}><label style={styles.label}>Số lượng kho:</label><input type="number" min="0" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} style={styles.input} disabled={isSubmitting} /></div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ ...styles.formGroup, flex: 1 }}><label style={styles.label}>Mã số ISBN:</label><input type="text" value={formData.isbn} onChange={(e) => setFormData({...formData, isbn: e.target.value})} style={styles.input} disabled={isSubmitting} /></div>
          <div style={{ ...styles.formGroup, flex: 1 }}><label style={styles.label}>Nhà xuất bản:</label><input type="text" value={formData.publisher} onChange={(e) => setFormData({...formData, publisher: e.target.value})} style={styles.input} disabled={isSubmitting} /></div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ ...styles.formGroup, flex: 1 }}><label style={styles.label}>Năm xuất bản:</label><input type="number" value={formData.publishYear} onChange={(e) => setFormData({...formData, publishYear: e.target.value})} style={styles.input} disabled={isSubmitting} /></div>
          <div style={{ ...styles.formGroup, flex: 1 }}><label style={styles.label}>Số trang:</label><input type="number" min="0" value={formData.pages} onChange={(e) => setFormData({...formData, pages: e.target.value})} style={styles.input} disabled={isSubmitting} /></div>
        </div>

        <div style={styles.formGroup}><label style={styles.label}>Mô tả tóm tắt nội dung sách:</label><textarea rows="3" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} style={{ ...styles.input, fontFamily: 'Arial', resize: 'vertical' }} disabled={isSubmitting}></textarea></div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Hình ảnh bìa sách:</label>
          <div style={styles.uploadRow}>
            <input id="bookCoverInput" type="file" accept="image/*" onChange={handleFileChange} style={{ ...styles.input, flex: 1 }} disabled={isSubmitting} />
            {imagePreview ? <div style={styles.previewContainer}><img src={imagePreview} alt="Preview" style={styles.previewImage} /></div> : <div style={styles.previewPlaceholder}>Chưa có ảnh</div>}
          </div>
        </div>

        <button type="submit" disabled={isSubmitting} style={{ ...styles.submitBtn, backgroundColor: isSubmitting ? "#1e7e34" : isEditMode ? "#ffc107" : "#28a745", color: isEditMode && !isSubmitting ? '#000' : '#fff', cursor: isSubmitting ? "not-allowed" : "pointer" }}>
          <div style={styles.btnContent}>
            {isSubmitting && <div style={styles.spinner}></div>}
            <span>{isSubmitting ? `Đang xử lý dữ liệu đám mây... (${uploadProgress}%)` : isEditMode ? "Lưu thay đổi đầu sách" : "Lưu Vào Thư Viện"}</span>
          </div>
          {isSubmitting && <div style={styles.progressBarTrack}><div style={{ ...styles.progressBarFill, width: `${uploadProgress}%` }}></div></div>}
        </button>
        {isEditMode && <button type="button" onClick={() => navigate("/admin/books")} style={{ ...styles.cancelBtn, marginTop: '8px' }}>Hủy bỏ & Quay lại</button>}
      </form>
    </div>
  );
}

const styles = {
  boxForm: { backgroundColor: "#fff", padding: "24px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", width: "100%", boxSizing: 'border-box' },
  formGroup: { marginBottom: "16px" },
  label: { display: "block", marginBottom: "6px", fontWeight: "bold", fontSize: "14px", color: "#333" },
  input: { width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box" },
  uploadRow: { display: "flex", gap: "12px", alignItems: "center" },
  previewContainer: { width: "70px", height: "95px", borderRadius: "4px", overflow: "hidden", border: "2px solid #28a745", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" },
  previewImage: { width: "100%", height: "100%", objectFit: "cover" },
  previewPlaceholder: { width: "70px", height: "95px", borderRadius: "4px", border: "1px dashed #adb5bd", backgroundColor: "#f8f9fa", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: "#6c757d", textAlign: "center", boxSizing: "border-box" },
  submitBtn: { width: "100%", padding: "14px 12px", border: "none", borderRadius: "4px", fontWeight: "bold", fontSize: "15px", position: "relative", overflow: "hidden", color: '#fff' },
  cancelBtn: { width: "100%", padding: "10px", backgroundColor: "#6c757d", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", fontSize: "14px" },
  btnContent: { display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" },
  spinner: { width: "18px", height: "18px", border: "3px solid rgba(255,255,255,0.3)", borderTop: "3px solid #fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  progressBarTrack: { position: "absolute", bottom: 0, left: 0, width: "100%", height: "4px", backgroundColor: "rgba(255,255,255,0.2)" },
  progressBarFill: { height: "100%", backgroundColor: "#ffc107", transition: "width 0.1s linear" }
};

export default BookFormPage;