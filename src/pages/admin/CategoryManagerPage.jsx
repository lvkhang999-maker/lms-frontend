// src/pages/admin/CategoryManagerPage.jsx
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

function CategoryManagerPage() {
  const [categories, setCategories] = useState([]);
  const [categoryInput, setCategoryInput] = useState("");
  const { token } = useSelector((state) => state.auth);
  
  const [isEditingCat, setIsEditingCat] = useState(false);
  const [editCatId, setEditCatId] = useState(null);
  const [showDeleteCatModal, setShowDeleteCatModal] = useState(false);
  const [catIdToDelete, setCatIdToDelete] = useState(null);

  const fetchCategories = () => {
    fetch("http://localhost:5000/api/categories")
      .then((res) => res.json())
      .then((data) => { if (Array.isArray(data)) setCategories(data); })
      .catch((err) => console.error(err));
  };

  useEffect(() => { fetchCategories(); }, []);

  // 🔥 HÀM SUBMIT: THÊM MỚI HOẶC SỬA THỂ LOẠI
  const handleCategorySubmit = (e) => {
    e.preventDefault();
    if (!categoryInput.trim()) return;
    const url = isEditingCat ? `http://localhost:5000/api/categories/${editCatId}` : "http://localhost:5000/api/categories";
    const method = isEditingCat ? "PUT" : "POST";
    
    fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: categoryInput.trim() }),
    })
      .then((res) => {
        if (!res.ok) return res.json().then((err) => { throw new Error(err.message); });
        return res.json();
      })
      .then(() => {
        toast.success(isEditingCat ? "📝 Cập nhật thể loại thành công!" : "📁 Thêm thể loại mới thành công!");
        setCategoryInput(""); setIsEditingCat(false); setEditCatId(null); fetchCategories();
      })
      .catch((err) => toast.error(err.message));
  };

  // 🔥 HÀM CONFIRM: XÁC NHẬN XÓA THỂ LOẠI
  const confirmDeleteCatAction = () => {
    fetch(`http://localhost:5000/api/categories/${catIdToDelete}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (!res.ok) return res.json().then((err) => { throw new Error(err.message); });
        return res.json();
      })
      .then(() => { toast.success("🗑️ Đã xóa thể loại!"); fetchCategories(); })
      .catch((err) => toast.error(err.message))
      .finally(() => { setShowDeleteCatModal(false); setCatIdToDelete(null); });
  };

  return (
    <div style={styles.boxForm}>
      <h4 style={{ color: isEditingCat ? "#e0a800" : "#007bff", margin: "0 0 16px 0" }}>{isEditingCat ? "📝 Sửa Tên Thể Loại" : "📁 Quản Lý Thể Loại Sách Mới"}</h4>
      <form onSubmit={handleCategorySubmit} style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
        <input type="text" placeholder="Tên thể loại... (Ví dụ: Công nghệ thông tin)" value={categoryInput} onChange={(e) => setCategoryInput(e.target.value)} style={styles.input} required />
        <button type="submit" style={{ ...styles.submitBtn, width: "auto", margin: 0, padding: "0 16px", backgroundColor: isEditingCat ? "#ffc107" : "#007bff", color: isEditingCat ? "#000" : "#fff" }}>{isEditingCat ? "Sửa" : "Thêm"}</button>
        {isEditingCat && <button type="button" onClick={() => { setIsEditingCat(false); setCategoryInput(""); }} style={{ ...styles.cancelBtn, width: "auto", padding: "0 12px" }}>Hủy</button>}
      </form>
      <div style={styles.catBadgesContainer}>{categories.map((cat) => <div key={cat._id} style={styles.catBadgeItem}><span>{cat.name}</span><button onClick={() => { setIsEditingCat(true); setEditCatId(cat._id); setCategoryInput(cat.name); }} style={styles.catMiniBtn}>✏️</button><button onClick={() => { setCatIdToDelete(cat._id); setShowDeleteCatModal(true); }} style={{ ...styles.catMiniBtn, color: "#dc3545" }} >❌</button></div>)}</div>

      {/* MODAL XÁC NHẬN XÓA */}
      {showDeleteCatModal && <div style={styles.modalOverlay}><div style={styles.modalBox}><h3 style={{ margin: "0 0 12px 0", color: "#dc3545" }}>⚠️ Cảnh báo xóa danh mục</h3><p style={{ margin: "0 0 20px 0", color: "#555", fontSize: "14px" }}>Bạn có chắc chắn muốn xóa thể loại này không?</p><div style={styles.modalButtons}><button onClick={() => setShowDeleteCatModal(false)} style={styles.cancelModalBtn}>Hủy bỏ</button><button onClick={confirmDeleteCatAction} style={styles.confirmModalBtn}>Xác nhận xóa</button></div></div></div>}
    </div>
  );
}

const styles = {
  boxForm: { backgroundColor: "#fff", padding: "24px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", width: "100%", boxSizing: 'border-box' },
  input: { width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box" },
  submitBtn: { padding: "12px", border: "none", borderRadius: "4px", fontWeight: "bold", fontSize: "14px", cursor: 'pointer' },
  cancelBtn: { padding: "10px", backgroundColor: "#6c757d", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", fontSize: "14px" },
  catBadgesContainer: { display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px" },
  catBadgeItem: { display: "flex", alignItems: "center", gap: "4px", backgroundColor: "#f1f3f5", padding: "4px 10px", borderRadius: "20px", fontSize: "13px", border: "1px solid #dee2e6" },
  catMiniBtn: { border: "none", backgroundColor: "transparent", cursor: "pointer", fontSize: "11px", padding: "2px" },
  modalOverlay: { position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0, 0, 0, 0.4)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 },
  modalBox: { width: "340px", backgroundColor: "#fff", padding: "24px", borderRadius: "8px", boxShadow: "0 4px 24px rgba(0,0,0,0.15)", textAlign: "center" },
  modalButtons: { display: "flex", gap: "12px", justifyContent: "center" },
  cancelModalBtn: { padding: "8px 16px", backgroundColor: "#e2e3e5", color: "#383d41", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", fontSize: "14px" },
  confirmModalBtn: { padding: "8px 16px", backgroundColor: "#dc3545", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", fontSize: "14px" }
};

export default CategoryManagerPage;