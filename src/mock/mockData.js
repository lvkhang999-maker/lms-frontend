// src/mock/mockData.js

export const MOCK_USERS = [
  { id: 1, name: "Lê Vĩ Khang", birthYear: 2002, role: "SinhVien" },
  { id: 2, name: "Trần Văn Út", birthYear: 1985, role: "Admin" }
];

export const MOCK_BOOKS = [
  {
    id: "B001",
    title: "Giáo trình Thiết kế web",
    author: "Nguyễn Trung Phú",
    category: "Công nghệ thông tin",
    quantity: 5,
    cover: "https://via.placeholder.com/150"
  },
  {
    id: "B002",
    title: "Thiết kế web với JavaScript & DOM",
    author: "Nguyễn Trường Sinh",
    category: "Công nghệ thông tin",
    quantity: 2,
    cover: "https://via.placeholder.com/150"
  }
];

export const MOCK_BORROW_RECORDS = [
  {
    id: "R001",
    userId: 1,
    bookId: "B001",
    borrowDate: "2026-06-15",
    dueDate: "2026-06-22",
    status: "Đang mượn"
  }
];