// ============================================================
// Server Entry Point
// ============================================================
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./config/database");

// Import Routes
const khachHangRoutes = require("./routes/khachHang");
const thuCungRoutes = require("./routes/thuCung");
const phongRoutes = require("./routes/phong");
const dichVuRoutes = require("./routes/dichVu");
const datPhongRoutes = require("./routes/datPhong");
const hoaDonRoutes = require("./routes/hoaDon");
const nhanVienRoutes = require("./routes/nhanVien");
const dashboardRoutes = require("./routes/dashboard");
const authRoutes = require("./routes/auth");
const capNhatThuCungRoutes = require("./routes/capNhatThuCung");

const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Phục vụ file ảnh tĩnh
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.use("/api/khach-hang", khachHangRoutes);
app.use("/api/thu-cung", thuCungRoutes);
app.use("/api/phong", phongRoutes);
app.use("/api/dich-vu", dichVuRoutes);
app.use("/api/dat-phong", datPhongRoutes);
app.use("/api/hoa-don", hoaDonRoutes);
app.use("/api/nhan-vien", nhanVienRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cap-nhat-thu-cung", capNhatThuCungRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Pet Hotel API is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    message: "Lỗi server nội bộ",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Khởi động server
async function startup() {
  try {
    // Khởi tạo Oracle Connection Pool
    await db.initialize();

    app.listen(PORT, () => {
      console.log(`🚀 Pet Hotel API đang chạy tại http://localhost:${PORT}`);
      console.log(`📋 API Health: http://localhost:${PORT}/api/health`);
    });
  } catch (err) {
    console.error("❌ Không thể khởi động server:", err.message);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received. Shutting down...");
  await db.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("\nSIGINT received. Shutting down...");
  await db.close();
  process.exit(0);
});

startup();
