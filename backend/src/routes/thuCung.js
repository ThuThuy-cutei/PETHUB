const express = require("express");
const router = express.Router();
const db = require("../config/database");

// GET - Lấy tất cả thú cưng (kèm thông tin khách hàng)
router.get("/", async (req, res) => {
  try {
    const result = await db.execute(
      `SELECT tc.MA_TC, tc.MA_KH, kh.HO_TEN AS TEN_CHU, tc.TEN_TC, tc.LOAI, 
              tc.GIONG, tc.TUOI, tc.CAN_NANG, tc.GIOI_TINH, tc.TINH_TRANG_SK, tc.GHI_CHU
       FROM THU_CUNG tc
       JOIN KHACH_HANG kh ON tc.MA_KH = kh.MA_KH
       ORDER BY tc.MA_TC`,
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET - Lấy thú cưng theo khách hàng
router.get("/khach-hang/:maKh", async (req, res) => {
  try {
    const result = await db.execute(
      `SELECT MA_TC, TEN_TC, LOAI, GIONG, TUOI, CAN_NANG, GIOI_TINH, TINH_TRANG_SK, GHI_CHU
       FROM THU_CUNG WHERE MA_KH = :maKh ORDER BY MA_TC`,
      { maKh: parseInt(req.params.maKh) },
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET - Lấy thú cưng theo ID
router.get("/:id", async (req, res) => {
  try {
    const result = await db.execute(
      `SELECT tc.*, kh.HO_TEN AS TEN_CHU
       FROM THU_CUNG tc JOIN KHACH_HANG kh ON tc.MA_KH = kh.MA_KH
       WHERE tc.MA_TC = :id`,
      { id: parseInt(req.params.id) },
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy thú cưng" });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST - Thêm thú cưng
router.post("/", async (req, res) => {
  try {
    const {
      maKh,
      tenTc,
      loai,
      giong,
      tuoi,
      canNang,
      gioiTinh,
      tinhTrangSk,
      ghiChu,
    } = req.body;
    const result = await db.execute(
      `INSERT INTO THU_CUNG (MA_KH, TEN_TC, LOAI, GIONG, TUOI, CAN_NANG, GIOI_TINH, TINH_TRANG_SK, GHI_CHU)
       VALUES (:maKh, :tenTc, :loai, :giong, :tuoi, :canNang, :gioiTinh, :tinhTrangSk, :ghiChu)
       RETURNING MA_TC INTO :maTc`,
      {
        maKh,
        tenTc,
        loai,
        giong: giong || null,
        tuoi: tuoi || null,
        canNang: canNang || null,
        gioiTinh: gioiTinh || null,
        tinhTrangSk: tinhTrangSk || null,
        ghiChu: ghiChu || null,
        maTc: { dir: db.oracledb.BIND_OUT, type: db.oracledb.NUMBER },
      },
    );
    res.status(201).json({
      success: true,
      message: "Thêm thú cưng thành công",
      data: { maTc: result.outBinds.maTc[0] },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT - Cập nhật thú cưng
router.put("/:id", async (req, res) => {
  try {
    const { tenTc, loai, giong, tuoi, canNang, gioiTinh, tinhTrangSk, ghiChu } =
      req.body;
    const result = await db.execute(
      `UPDATE THU_CUNG 
       SET TEN_TC = :tenTc, LOAI = :loai, GIONG = :giong, TUOI = :tuoi,
           CAN_NANG = :canNang, GIOI_TINH = :gioiTinh, TINH_TRANG_SK = :tinhTrangSk, GHI_CHU = :ghiChu
       WHERE MA_TC = :id`,
      {
        tenTc,
        loai,
        giong,
        tuoi,
        canNang,
        gioiTinh,
        tinhTrangSk,
        ghiChu,
        id: parseInt(req.params.id),
      },
    );
    if (result.rowsAffected === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy thú cưng" });
    }
    res.json({ success: true, message: "Cập nhật thành công" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE - Xóa thú cưng
router.delete("/:id", async (req, res) => {
  try {
    const result = await db.execute("DELETE FROM THU_CUNG WHERE MA_TC = :id", {
      id: parseInt(req.params.id),
    });
    if (result.rowsAffected === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy thú cưng" });
    }
    res.json({ success: true, message: "Xóa thành công" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
