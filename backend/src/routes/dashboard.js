const express = require("express");
const router = express.Router();
const db = require("../config/database");

// GET - Dashboard: Thống kê tổng quan
router.get("/stats", async (req, res) => {
  try {
    // Thực hiện nhiều truy vấn song song
    const [roomStats, bookingStats, revenueStats, petStats] = await Promise.all(
      [
        // Thống kê phòng theo trạng thái
        db.execute(`
        SELECT TRANG_THAI, COUNT(*) AS SO_LUONG
        FROM PHONG GROUP BY TRANG_THAI
      `),
        // Thống kê đặt phòng theo trạng thái
        db.execute(`
        SELECT TRANG_THAI, COUNT(*) AS SO_LUONG
        FROM DAT_PHONG GROUP BY TRANG_THAI
      `),
        // Thống kê doanh thu
        db.execute(`
        SELECT 
          COUNT(*) AS TONG_HD,
          NVL(SUM(CASE WHEN TRANG_THAI = 'DA_THANH_TOAN' THEN TONG_TIEN ELSE 0 END), 0) AS DOANH_THU,
          NVL(SUM(CASE WHEN TRANG_THAI = 'CHUA_THANH_TOAN' THEN TONG_TIEN ELSE 0 END), 0) AS CHUA_THU
        FROM HOA_DON
      `),
        // Thống kê thú cưng theo loại
        db.execute(`
        SELECT LOAI, COUNT(*) AS SO_LUONG
        FROM THU_CUNG GROUP BY LOAI
      `),
      ],
    );

    // Tổng hợp trạng thái phòng
    const tongPhong = roomStats.rows.reduce((sum, r) => sum + r.SO_LUONG, 0);
    const phongTrong =
      roomStats.rows.find((r) => r.TRANG_THAI === "TRONG")?.SO_LUONG || 0;
    const phongDaDat =
      roomStats.rows.find((r) => r.TRANG_THAI === "DA_DAT")?.SO_LUONG || 0;
    const phongDangDung =
      roomStats.rows.find((r) => r.TRANG_THAI === "DANG_SU_DUNG")?.SO_LUONG ||
      0;
    const phongBaoTri =
      roomStats.rows.find((r) => r.TRANG_THAI === "BAO_TRI")?.SO_LUONG || 0;

    res.json({
      success: true,
      data: {
        phong: {
          tongPhong,
          phongTrong,
          phongDaDat,
          phongDangDung,
          phongBaoTri,
          tiLeSuDung:
            tongPhong > 0
              ? Math.round(((phongDaDat + phongDangDung) / tongPhong) * 100)
              : 0,
        },
        datPhong: bookingStats.rows,
        doanhThu: revenueStats.rows[0],
        thuCung: petStats.rows,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET - Dashboard: Đặt phòng gần đây
router.get("/dat-phong-gan-day", async (req, res) => {
  try {
    const result = await db.execute(
      `SELECT dp.MA_DAT_PHONG, tc.TEN_TC, kh.HO_TEN AS TEN_CHU,
              p.TEN_PHONG, dp.TRANG_THAI,
              TO_CHAR(dp.NGAY_NHAN, 'YYYY-MM-DD') AS NGAY_NHAN,
              TO_CHAR(dp.NGAY_TRA, 'YYYY-MM-DD') AS NGAY_TRA
       FROM DAT_PHONG dp
       JOIN THU_CUNG tc ON dp.MA_TC = tc.MA_TC
       JOIN KHACH_HANG kh ON tc.MA_KH = kh.MA_KH
       JOIN PHONG p ON dp.MA_PHONG = p.MA_PHONG
       ORDER BY dp.NGAY_TAO DESC
       FETCH FIRST 10 ROWS ONLY`,
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
