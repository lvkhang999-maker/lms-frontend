// src/pages/admin/OverviewPage.jsx
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

function OverviewPage() {
  const { token } = useSelector((state) => state.auth);
  const [chartData, setChartData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/stats/charts", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => { setChartData(data); setIsLoading(false); })
      .catch(err => { console.error("Lỗi tải đồ thị:", err); setIsLoading(false); });
  }, [token]);

  if (isLoading) {
    return <div style={{ text: 'center', padding: '32px', color: '#007bff', fontWeight: 'bold' }}>🔄 Đang tính toán dữ liệu và dựng đồ thị phân tích...</div>;
  }

  // Khai báo bộ mã màu phẳng chuyên nghiệp cho cột đồ thị
  const barColors = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1', '#fd7e14', '#17a2b8', '#6c757d'];

  // Tìm giá trị lượt mượn lớn nhất để định tỷ lệ chiều cao cột SVG hợp lý
  const maxBorrowValue = chartData ? Math.max(...chartData.monthlyTrends.map(m => m.value), 5) : 5;

  return (
    <div style={styles.container}>
      <h3 style={styles.pageTitle}>📉 Phân Tích & Dự Báo Xu Hướng Thư Viện (Năm 2026)</h3>

      <div style={styles.chartGrid}>
        
        {/* ĐỒ THỊ 1: BIỂU ĐỒ CỘT SVG (XU HƯỚNG MƯỢN SÁCH 12 THÁNG) */}
        <div style={styles.chartCard}>
          <h4 style={styles.chartTitle}>📊 Tần suất mượn sách theo các tháng</h4>
          <div style={styles.svgWrapper}>
            <svg viewBox="0 0 600 300" style={{ width: '100%', height: 'auto' }}>
              {/* Vẽ các đường kẻ ngang làm lưới tọa độ nền */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                const yPos = 30 + ratio * 220;
                const gridVal = Math.round(maxBorrowValue * (1 - ratio));
                return (
                  <g key={i}>
                    <line x1="50" y1={yPos} x2="550" y2={yPos} stroke="#e9ecef" strokeDasharray="4 4" />
                    <text x="20" y={yPos + 4} fontSize="11" fill="#6c757d" textAnchor="middle">{gridVal}</text>
                  </g>
                );
              })}

              {/* Vòng lặp duyệt qua 12 tháng để dựng các cột hình chữ nhật phẳng */}
              {chartData?.monthlyTrends.map((month, index) => {
                const xSpace = 40; // Khoảng cách chiều ngang giữa các cột
                const xPos = 65 + index * xSpace;
                const barHeight = (month.value / maxBorrowValue) * 220;
                const yPos = 250 - barHeight;

                return (
                  <g key={index} style={{ cursor: 'pointer' }}>
                    {/* Bẫy giá trị khi trỏ chuột vào hiện số hiệu */}
                    <title>{`${month.label}: ${month.value} lượt mượn`}</title>
                    {/* Vẽ thanh cột */}
                    <rect x={xPos} y={yPos} width="22" height={barHeight} fill={month.value > 0 ? '#007bff' : '#dee2e6'} rx="3" style={{ transition: 'all 0.3s' }} />
                    {/* Hiện số lượng trên đầu cột nếu có dữ liệu */}
                    {month.value > 0 && (
                      <text x={xPos + 11} y={yPos - 6} fontSize="10" fontWeight="bold" fill="#212529" textAnchor="middle">{month.value}</text>
                    )}
                    {/* Nhãn tháng ở trục hoành */}
                    <text x={xPos + 11} y="270" fontSize="10" fill="#495057" textAnchor="middle" transform={`rotate(-30, ${xPos + 11}, 270)`}>
                      {`T${index + 1}`}
                    </text>
                  </g>
                );
              })}
              {/* Đường trục cơ sở dưới đáy */}
              <line x1="50" y1="250" x2="550" y2="250" stroke="#495057" strokeWidth="2" />
            </svg>
          </div>
        </div>

        {/* ĐỒ THỊ 2: BIỂU ĐỒ THANH NGANG CƠ CẤU THỂ LOẠI (TOP CATEGORIES) */}
        <div style={styles.chartCard}>
          <h4 style={styles.chartTitle}>🧬 Cơ cấu danh mục Thể loại được mượn nhiều</h4>
          <div style={styles.categoryProgressWrapper}>
            {chartData?.categoryDistribution.map((cat, index) => {
              // Tính tỉ lệ phần trăm thanh dài ngắn
              const totalCatBorrows = chartData.categoryDistribution.reduce((acc, curr) => acc + curr.value, 0) || 1;
              const percent = Math.round((cat.value / totalCatBorrows) * 100);
              const barColor = barColors[index % barColors.length];

              return (
                <div key={index} style={styles.progressRow}>
                  <div style={styles.progressLabelZone}>
                    <span style={styles.catName}>{cat.label}</span>
                    <span style={styles.catCount}><strong>{cat.value}</strong> lượt đọc</span>
                  </div>
                  <div style={styles.progressTrack}>
                    <div style={{
                      ...styles.progressFill,
                      width: `${percent}%`,
                      backgroundColor: barColor
                    }}>
                      <span style={styles.progressPercentText}>{percent}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

const styles = {
  container: { width: "100%" },
  pageTitle: { margin: "0 0 20px 0", color: "#333", fontSize: "16px", fontWeight: "bold" },
  chartGrid: { display: "flex", gap: "24px", flexWrap: "wrap", width: "100%" },
  chartCard: { flex: 1, minWidth: "320px", backgroundColor: "#fff", padding: "20px", borderRadius: "8px", border: "1px solid #e9ecef", boxSizing: "border-box" },
  chartTitle: { margin: "0 0 16px 0", fontSize: "14px", color: "#495057", fontWeight: "bold" },
  svgWrapper: { width: "100%", padding: "10px 0" },
  categoryProgressWrapper: { display: "flex", flexDirection: "column", gap: "16px", marginTop: "10px" },
  progressRow: { display: "flex", flexDirection: "column", gap: "6px" },
  progressLabelZone: { display: "flex", justifyContent: "space-between", fontSize: "13px" },
  catName: { fontWeight: "600", color: "#212529" },
  catCount: { color: "#6c757d" },
  progressTrack: { width: "100%", height: "20px", backgroundColor: "#e9ecef", borderRadius: "4px", overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: "8px", transition: "width 0.5s ease-out" },
  progressPercentText: { color: "#fff", fontSize: "11px", fontWeight: "bold" }
};

export default OverviewPage;