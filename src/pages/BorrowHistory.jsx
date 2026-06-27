// src/pages/BorrowHistory.jsx
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import axiosClient from "../config/axiosClient"; 

function BorrowHistory() {
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); 
  const [uiError, setUiError] = useState(''); 
  const { token, currentUser } = useSelector((state) => state.auth);
  const isAdmin = currentUser?.role === 'Admin';

  const [activeTab, setActiveTab] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; 

  const [showReturnModal, setShowReturnModal] = useState(false);
  const [recordIdToReturn, setRecordIdToReturn] = useState(null);

  const fetchRecords = () => {
    const url = isAdmin ? '/borrows/all' : '/borrows/my-records';
    
    axiosClient.get(url)
      .then(data => {
        setUiError(''); 
        if (Array.isArray(data)) setRecords(data);
        else setRecords([]);
      })
      .catch(err => {
        console.error(err);
        setUiError(err.response?.data?.message || err.message);
      });
  };

  useEffect(() => { 
    if (token) fetchRecords(); 
  }, [isAdmin, token]);

  const getSafeDueDate = (record) => {
    if (record.dueDate) return new Date(record.dueDate);
    const borrowDate = new Date(record.borrowDate);
    return new Date(borrowDate.getTime() + 14 * 24 * 60 * 60 * 1000);
  };

  const checkIsOverdue = (record) => {
    if (record.status !== 'DangMuon') return false;
    const dueDate = getSafeDueDate(record);
    return new Date() > dueDate;
  };

  const calculateFine = (record) => {
    if (record.status === 'DaTra') {
      return { amount: record.fineAmount || 0, isPaid: record.isFinePaid, isOverdue: (record.fineAmount > 0) };
    }
    const dueDate = getSafeDueDate(record);
    const now = new Date();
    if (now > dueDate) {
      const diffTime = Math.abs(now - dueDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return { amount: diffDays * 2000, isPaid: false, isOverdue: true };
    }
    return { amount: 0, isPaid: true, isOverdue: false };
  };

  const handleRenewBook = (id) => {
    axiosClient.put(`/borrows/${id}/renew`)
      .then((data) => {
        toast.success(data.message || '🎉 Gia hạn thời gian đọc sách thành công!');
        fetchRecords(); 
      })
      .catch(err => toast.error(err.response?.data?.message || err.message));
  };

  const handlePayFine = (id) => {
    axiosClient.put(`/borrows/${id}/pay-fine`)
      .then((data) => {
        toast.success(data.message || '💰 Xác nhận thu tiền phạt thành công!');
        fetchRecords(); 
      })
      .catch(err => toast.error(err.response?.data?.message || err.message));
  };

  const filteredRecords = records.filter(r => {
    if (activeTab === 'DangMuon' && r.status !== 'DangMuon') return false;
    if (activeTab === 'DaTra' && r.status !== 'DaTra') return false;
    if (activeTab === 'QuaHan' && !checkIsOverdue(r)) return false;

    const search = searchTerm.toLowerCase();
    const studentName = r.user?.name?.toLowerCase() || '';
    const studentEmail = r.user?.email?.toLowerCase() || '';
    const bookTitle = r.book?.title?.toLowerCase() || '';
    const studentPhone = r.phone?.toLowerCase() || ''; // 🔥 Lọc thêm theo số điện thoại khi tìm kiếm

    return studentName.includes(search) || studentEmail.includes(search) || bookTitle.includes(search) || studentPhone.includes(search);
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRecords.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

  const triggerReturnBook = (id) => {
    setRecordIdToReturn(id);
    setShowReturnModal(true);
  };

  const confirmReturnBookAction = () => {
    axiosClient.put(`/borrows/${recordIdToReturn}/return`)
      .then(() => {
        toast.success('📚 Thu hồi sách thành công!');
        fetchRecords(); 
      })
      .catch(err => toast.error(err.response?.data?.message || err.message))
      .finally(() => {
        setShowReturnModal(false);
        setRecordIdToReturn(null);
      });
  };

  return (
    <div style={isAdmin ? { fontFamily: 'Arial, sans-serif' } : { padding: '24px', fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f6f9', minHeight: '88vh' }}>
      
      <h2 style={{ margin: '0 0 20px 0', fontSize: '22px', color: '#212529', fontWeight: 'bold' }}>
        📋 {isAdmin ? 'Hệ thống Quản lý Phiếu Mượn Toàn Trường' : 'Lịch sử Mượn Sách Cá Nhân'}
      </h2>
      
      <div style={isAdmin ? {} : { backgroundColor: '#fff', padding: '20px', borderRadius: '#8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        
        <div style={styles.tabContainer}>
          <button onClick={() => { setActiveTab('ALL'); setCurrentPage(1); }} style={styles.tabButton(activeTab === 'ALL', '#007bff')}>
            📋 Tất cả ({records.length})
          </button>
          <button onClick={() => { setActiveTab('DangMuon'); setCurrentPage(1); }} style={styles.tabButton(activeTab === 'DangMuon', '#ffc107', '#856404')}>
            ⌛ Đang mượn ({records.filter(r => r.status === 'DangMuon').length})
          </button>
          <button onClick={() => { setActiveTab('QuaHan'); setCurrentPage(1); }} style={styles.tabButton(activeTab === 'QuaHan', '#dc3545')}>
            ⚠️ Quá hạn ({records.filter(r => checkIsOverdue(r)).length})
          </button>
          <button onClick={() => { setActiveTab('DaTra'); setCurrentPage(1); }} style={styles.tabButton(activeTab === 'DaTra', '#28a745')}>
            ✅ Đã trả ({records.filter(r => r.status === 'DaTra').length})
          </button>
        </div>

        <div style={styles.searchContainer}>
          <input 
            type="text" 
            placeholder={isAdmin ? "🔍 Lọc theo tên SV, SĐT, Email hoặc tên cuốn sách..." : "🔍 Tìm kiếm theo tên cuốn sách đã mượn..."}
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
            style={styles.searchInput}
          />
        </div>

        {uiError ? (
          <div style={styles.errorAlert}><strong>Lỗi đồng bộ:</strong> {uiError}</div>
        ) : (
          <>
            <table style={styles.table}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  {isAdmin && <th style={styles.th}>Sinh Viên</th>}
                  <th style={styles.th}>Tên Sách</th>
                  <th style={styles.th}>Ngày Mượn</th>
                  <th style={styles.th}>Hạn Trả</th>
                  <th style={styles.th}>Trạng Thái</th>
                  <th style={styles.th}>Tiền Phạt (2k/ngày)</th> 
                  <th style={styles.th}>Hành Động</th> 
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map(r => {
                    const isOverdue = checkIsOverdue(r);
                    const fineInfo = calculateFine(r); 
                    return (
                      <tr key={r._id} style={{ borderBottom: '1px solid #eee' }}>
                        {isAdmin && (
                          <td style={styles.td}>
                            <strong>{r.user?.name}</strong><br/>
                            <small style={{color:'#666', display:'block', marginBottom:'2px'}}>{r.user?.email}</small>
                            {/* 🔥 HIỂN THỊ MỚI: Bơm Số điện thoại của phiếu vào đây */}
                            <small style={{color:'#0056b3', fontWeight:'bold'}}>📞 SĐT: {r.phone || "Chưa cung cấp"}</small>
                          </td>
                        )}
                        <td style={styles.td}>
                          <strong>{r.book?.title || <span style={{color:'#aaa'}}>Sách đã bị xóa</span>}</strong>
                          {/* 🔥 HIỂN THỊ MỚI: Nếu sinh viên có để lại ghi chú, render khối chữ tím dịu mắt ở đây */}
                          {r.notes && (
                            <div style={{marginTop: '4px', fontSize: '12px', color: '#6f42c1', fontStyle: 'italic', backgroundColor: '#f3e5f5', padding: '4px 8px', borderRadius: '4px', display: 'inline-block'}}>
                              💬 Ghi chú: {r.notes}
                            </div>
                          )}
                        </td>
                        <td style={styles.td}>{new Date(r.borrowDate).toLocaleDateString('vi-VN')}</td>
                        <td style={styles.td}>{getSafeDueDate(r).toLocaleDateString('vi-VN')}</td>
                        
                        <td style={styles.td}>
                          {isOverdue ? (
                            <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', backgroundColor: '#f8d7da', color: '#721c24' }}>
                              ⚠️ Quá hạn!
                            </span>
                          ) : (
                            <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', backgroundColor: r.status === 'DangMuon' ? '#fff3cd' : '#d4edda', color: r.status === 'DangMuon' ? '#856404' : '#155724' }}>
                              {r.status === 'DangMuon' ? 'Đang mượn' : 'Đã trả'}
                            </span>
                          )}
                        </td>

                        <td style={styles.td}>
                          {fineInfo.amount > 0 ? (
                            <div>
                              <strong style={{ color: '#dc3545' }}>{fineInfo.amount.toLocaleString('vi-VN')}đ</strong><br/>
                              <small style={{ fontWeight: 'bold', color: fineInfo.isPaid ? '#28a745' : '#ffc107' }}>
                                {fineInfo.isPaid ? '✓ Đã thu tiền' : '⏳ Chờ nộp phạt'}
                              </small>
                            </div>
                          ) : (
                            <span style={{ color: '#aaa' }}>0đ</span>
                          )}
                        </td>

                        <td style={styles.td}>
                          {isAdmin ? (
                            <div style={{ display: 'flex', gap: '8px' }}>
                              {r.status === 'DangMuon' && (
                                <button onClick={() => triggerReturnBook(r._id)} style={styles.returnBtn}>Thu hồi sách</button>
                              )}
                              {r.status === 'DaTra' && fineInfo.amount > 0 && !fineInfo.isPaid && (
                                <button onClick={() => handlePayFine(r._id)} style={styles.payFineBtn}>Thu tiền phạt</button>
                              )}
                              {fineInfo.amount > 0 && fineInfo.isPaid && (
                                <small style={{ color: '#28a745', fontWeight: 'bold' }}>Sạch nợ phiếu</small>
                              )}
                            </div>
                          ) : (
                            r.status === 'DangMuon' ? (
                              isOverdue ? (
                                <small style={{ color: '#dc3545', fontWeight: 'bold' }}>Khóa gia hạn</small>
                              ) : r.isRenewed ? (
                                <span style={{ color: '#28a745', fontSize: '12px', fontWeight: 'bold' }}>✓ Đã gia hạn</span>
                              ) : (
                                <button onClick={() => handleRenewBook(r._id)} style={styles.renewBtn}>Gia hạn +7 ngày</button>
                              )
                            ) : (
                              <small style={{ color: '#aaa' }}>Hoàn thành</small>
                            )
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={isAdmin ? 7 : 6} style={{ padding: '24px', textAlign: 'center', color: '#999' }}>
                      Không có bản ghi phiếu mượn nào ở danh mục này.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div style={styles.paginationContainer}>
                <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} style={styles.pageArrowBtn(currentPage === 1)}>«</button>
                {Array.from({ length: totalPages }, (_, index) => (
                  <button key={index + 1} onClick={() => setCurrentPage(index + 1)} style={styles.pageCircleBtn(currentPage === index + 1)}>{index + 1}</button>
                ))}
                <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} style={styles.pageArrowBtn(currentPage === totalPages)}>»</button>
              </div>
            )}
          </>
        )}
      </div>

      {showReturnModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <h3 style={{ margin: '0 0 12px 0', color: '#007bff' }}>🔄 Xác nhận thu hồi</h3>
            <p style={{ margin: '0 0 20px 0', color: '#555', fontSize: '14px', lineHeight: '1.5' }}>Xác nhận sinh viên đã mang trả sách chính xác tới quầy thư viện?</p>
            <div style={styles.modalButtons}>
              <button onClick={() => setShowReturnModal(false)} style={styles.cancelModalBtn}>Hủy bỏ</button>
              <button onClick={confirmReturnBookAction} style={styles.confirmModalBtn}>Xác nhận trả</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  tabContainer: { display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' },
  tabButton: (isActive, color, textColor = '#fff') => ({ padding: '8px 16px', borderRadius: '20px', border: isActive ? `2px solid ${color}` : '1px solid #ced4da', backgroundColor: isActive ? color : '#f8f9fa', color: isActive ? textColor : '#495057', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', transition: '0.2s' }),
  searchContainer: { margin: '10px 0 16px 0', display: 'flex', justifyContent: 'flex-start' },
  searchInput: { width: '100%', maxWidth: '450px', padding: '10px 16px', borderRadius: '4px', border: '1px solid #ced4da', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
  th: { padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6', fontSize: '14px', color: '#495057' },
  td: { padding: '12px', fontSize: '14px', verticalAlign: 'middle' },
  returnBtn: { padding: '6px 12px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' },
  renewBtn: { padding: '6px 12px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', transition: '0.2s' },
  payFineBtn: { padding: '6px 12px', backgroundColor: '#6f42c1', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', transition: '0.2s' },
  errorAlert: { padding: '16px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px', marginTop: '16px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 },
  modalBox: { width: '340px', backgroundColor: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 4px 24px rgba(0,0,0,0.15)', textAlign: 'center' },
  modalButtons: { display: 'flex', gap: '12px', justifyContent: 'center' },
  cancelModalBtn: { padding: '8px 16px', backgroundColor: '#e2e3e5', color: '#383d41', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' },
  confirmModalBtn: { padding: '8px 16px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' },

  paginationContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '24px', padding: '10px 0' },
  pageCircleBtn: (isActive) => ({ 
    width: '32px', 
    height: '32px', 
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
    transition: '0.2s all ease' 
  }),
  pageArrowBtn: (isDisabled) => ({ 
    border: 'none', 
    backgroundColor: 'transparent', 
    color: isDisabled ? '#cfd8dc' : '#4b9cd3', 
    fontSize: '18px', 
    fontWeight: 'bold', 
    cursor: isDisabled ? 'not-allowed' : 'pointer', 
    padding: '0 8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  })
};

export default BorrowHistory;