# Pet Hotel Management System

## 📌 Overview
A fullstack web application for managing pet hotel services including booking, pet care, and customer management.

## 🛠️ Technologies
- Frontend: Next.js + Tailwind CSS
- Backend: Node.js (Express)
- Database: Oracle

## 🏗️ Project Structure

```
PetHub/
├── database/                        # Oracle SQL Scripts
│   ├── 01_create_tables.sql         # DDL - Tạo bảng (3NF)
│   ├── 02_triggers.sql              # Triggers (2 triggers)
│   ├── 03_stored_procedures.sql     # Stored Procedures (3 procedures)
│   └── 04_sample_data.sql           # DML - Dữ liệu mẫu
│
├── backend/                         # Node.js Express API
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # Oracle Connection Pool
│   │   ├── routes/
│   │   │   ├── khachHang.js         # API Khách hàng
│   │   │   ├── thuCung.js           # API Thú cưng
│   │   │   ├── phong.js             # API Phòng
│   │   │   ├── dichVu.js            # API Dịch vụ
│   │   │   ├── datPhong.js          # API Đặt phòng
│   │   │   ├── hoaDon.js            # API Hóa đơn
│   │   │   ├── nhanVien.js          # API Nhân viên
│   │   │   └── dashboard.js         # API Dashboard
│   │   └── server.js                # Entry point
│   ├── .env                         # Biến môi trường
│   └── package.json
│
└── frontend/                        # Next.js + Tailwind CSS
    ├── src/
    │   ├── components/
    │   │   └── Layout.js            # Layout chính (Sidebar + Header)
    │   ├── data/
    │   │   └── mockData.json        # Dữ liệu mẫu cho demo UI
    │   ├── pages/
    │   │   ├── _app.js              # App wrapper
    │   │   ├── _document.js         # HTML Document
    │   │   ├── index.js             # Dashboard
    │   │   ├── booking.js           # Trang đặt phòng
    │   │   ├── rooms.js             # Quản lý phòng
    │   │   ├── services.js          # Danh sách dịch vụ
    │   │   ├── billing.js           # Hóa đơn
    │   │   └── customers.js         # Khách hàng
    │   ├── services/
    │   │   └── api.js               # API service (Mock ↔ Oracle)
    │   └── styles/
    │       └── globals.css           # Tailwind CSS + Custom styles
    ├── jsconfig.json
    ├── next.config.js
    ├── tailwind.config.js
    └── package.json
```

## Các thực thể (Entities)

| Thực thể | Bảng Oracle | Mô tả |
|----------|------------|-------|
| Nhân viên | `NHAN_VIEN` | Quản lý, lễ tân, bác sĩ thú y |
| Khách hàng | `KHACH_HANG` | Chủ thú cưng |
| Thú cưng | `THU_CUNG` | Thông tin thú cưng (N-1 với Khách hàng) |
| Loại phòng | `LOAI_PHONG` | Phân loại phòng theo tiêu chuẩn |
| Phòng | `PHONG` | Phòng lưu trú (N-1 với Loại phòng) |
| Dịch vụ | `DICH_VU` | Các dịch vụ chăm sóc |
| Đặt phòng | `DAT_PHONG` | Thông tin đặt phòng |
| Hóa đơn | `HOA_DON` | Hóa đơn thanh toán (1-1 với Đặt phòng) |
| Chi tiết DV | `CHI_TIET_DICH_VU` | Bảng trung gian N-N (Đặt phòng - Dịch vụ) |

## Chuẩn hóa 3NF

Cơ sở dữ liệu tuân thủ chuẩn hóa 3NF:

- **1NF**: Mỗi cột chứa giá trị nguyên tử, không có nhóm lặp
- **2NF**: Tất cả thuộc tính không khóa phụ thuộc hoàn toàn vào khóa chính
- **3NF**: Không có phụ thuộc bắc cầu - VD: `LOAI_PHONG` tách riêng khỏi `PHONG`

## Triggers

1. **TRG_CAP_NHAT_TRANG_THAI_PHONG**: Tự động cập nhật trạng thái phòng khi đặt/nhận/trả phòng
2. **TRG_TINH_THANH_TIEN_CTDV**: Tự động tính thành tiền chi tiết dịch vụ
3. **TRG_CAP_NHAT_TIEN_DV_HOA_DON**: Cập nhật tổng tiền dịch vụ trong hóa đơn

## Stored Procedures

1. **SP_TINH_TONG_TIEN_HOA_DON**: Tính tổng tiền hóa đơn (phí phòng + dịch vụ - giảm giá)
2. **SP_DAT_PHONG**: Đặt phòng với kiểm tra Double Booking (Transaction Control)
3. **SP_THANH_TOAN_HOA_DON**: Xử lý thanh toán hóa đơn

## Hướng dẫn chạy

### Bước 1: Thiết lập Oracle Database
```sql
-- Chạy các script theo thứ tự trong Oracle SQL Developer:
-- 1. 01_create_tables.sql
-- 2. 02_triggers.sql
-- 3. 03_stored_procedures.sql
-- 4. 04_sample_data.sql
```

### Bước 2: Chạy Frontend (Mock Data)
```bash
cd frontend
npm install
npm run dev
# Truy cập: http://localhost:3000
```

### Bước 3: Chạy Backend (Kết nối Oracle)
```bash
cd backend
npm install
# Cấu hình .env với thông tin Oracle
npm run dev
# API chạy tại: http://localhost:5000
```

### Bước 4: Chuyển sang Oracle Data
Mở file `frontend/src/services/api.js`, đổi:
```js
const USE_MOCK = false; // Chuyển từ true -> false
```

## Công nghệ sử dụng

| Layer | Công nghệ |
|-------|-----------|
| Database | Oracle Database (VARCHAR2, NUMBER, DATE, TIMESTAMP) |
| Backend | Node.js, Express.js, oracledb |
| Frontend | Next.js 14, React 18, Tailwind CSS 3 |
| Tools | Oracle SQL Developer, VS Code, Postman |

## API Endpoints

| Method | Endpoint | Mô tả |
|--------|---------|-------|
| GET | `/api/dashboard/stats` | Thống kê dashboard |
| GET | `/api/khach-hang` | Danh sách khách hàng |
| POST | `/api/khach-hang` | Thêm khách hàng |
| GET | `/api/thu-cung` | Danh sách thú cưng |
| GET | `/api/phong` | Danh sách phòng |
| GET | `/api/phong/trong?ngayNhan=&ngayTra=` | Phòng trống |
| GET | `/api/dich-vu` | Danh sách dịch vụ |
| GET | `/api/dat-phong` | Danh sách đặt phòng |
| POST | `/api/dat-phong` | Đặt phòng mới (SP_DAT_PHONG) |
| GET | `/api/hoa-don` | Danh sách hóa đơn |
| POST | `/api/hoa-don` | Tạo hóa đơn (SP_TINH_TONG_TIEN_HOA_DON) |
| PUT | `/api/hoa-don/:id/thanh-toan` | Thanh toán |

## 👥 Team Project
Developed collaboratively with my teammate.

## 👤 My Responsibilities
- Performed manual testing
- Designed test cases
- Reported bugs
- Verified bug fixes

## 🧪 Testing
Testing documents are included:
- TestCase_PetHub.xlsx
- BugReport_PetHub.xlsx
- TestScenario.txt