const express = require("express");
const router = express.Router();
const db = require("../config/database");

// GET - Lấy tất cả khách hàng
router.get("/", async (req, res) => {
  try {
    const result = await db.execute(
      `SELECT MA_KH, HO_TEN, EMAIL, SO_DIEN_THOAI, DIA_CHI, 
              TO_CHAR(NGAY_DANG_KY, 'YYYY-MM-DD') AS NGAY_DANG_KY, GHI_CHU
       FROM KHACH_HANG ORDER BY MA_KH`,
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET - Lấy khách hàng theo ID
router.get("/:id", async (req, res) => {
  try {
    const result = await db.execute(
      `SELECT MA_KH, HO_TEN, EMAIL, SO_DIEN_THOAI, DIA_CHI,
              TO_CHAR(NGAY_DANG_KY, 'YYYY-MM-DD') AS NGAY_DANG_KY, GHI_CHU
       FROM KHACH_HANG WHERE MA_KH = :id`,
      { id: parseInt(req.params.id) },
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy khách hàng" });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST - Thêm khách hàng mới
router.post("/", async (req, res) => {
  try {
    const { hoTen, email, soDienThoai, diaChi, ghiChu } = req.body;
    const result = await db.execute(
      `INSERT INTO KHACH_HANG (HO_TEN, EMAIL, SO_DIEN_THOAI, DIA_CHI, GHI_CHU)
       VALUES (:hoTen, :email, :soDienThoai, :diaChi, :ghiChu)
       RETURNING MA_KH INTO :maKh`,
      {
        hoTen,
        email,
        soDienThoai,
        diaChi: diaChi || null,
        ghiChu: ghiChu || null,
        maKh: { dir: db.oracledb.BIND_OUT, type: db.oracledb.NUMBER },
      },
    );
    res.status(201).json({
      success: true,
      message: "Thêm khách hàng thành công",
      data: { maKh: result.outBinds.maKh[0] },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST - Tìm hoặc tạo khách hàng (dùng cho đặt phòng)
router.post("/find-or-create", async (req, res) => {
  try {
    const { hoTen, email, soDienThoai, diaChi } = req.body;

    // Tìm theo SĐT trước
    let existing = await db.execute(
      `SELECT MA_KH, HO_TEN, EMAIL, SO_DIEN_THOAI, DIA_CHI FROM KHACH_HANG WHERE SO_DIEN_THOAI = :soDienThoai`,
      { soDienThoai }
    );

    // Nếu không tìm theo SĐT, thử tìm theo email
    if (existing.rows.length === 0 && email) {
      existing = await db.execute(
        `SELECT MA_KH, HO_TEN, EMAIL, SO_DIEN_THOAI, DIA_CHI FROM KHACH_HANG WHERE EMAIL = :email`,
        { email }
      );
    }

    if (existing.rows.length > 0) {
      return res.json({
        success: true,
        isNew: false,
        data: { maKh: existing.rows[0].MA_KH },
      });
    }

    // Tạo mới
    const result = await db.execute(
      `INSERT INTO KHACH_HANG (HO_TEN, EMAIL, SO_DIEN_THOAI, DIA_CHI)
       VALUES (:hoTen, :email, :soDienThoai, :diaChi)
       RETURNING MA_KH INTO :maKh`,
      {
        hoTen,
        email: email || null,
        soDienThoai,
        diaChi: diaChi || null,
        maKh: { dir: db.oracledb.BIND_OUT, type: db.oracledb.NUMBER },
      },
    );
    res.status(201).json({
      success: true,
      isNew: true,
      data: { maKh: result.outBinds.maKh[0] },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT - Cập nhật khách hàng
router.put("/:id", async (req, res) => {
  try {
    const { hoTen, email, soDienThoai, diaChi, ghiChu } = req.body;
    const result = await db.execute(
      `UPDATE KHACH_HANG 
       SET HO_TEN = :hoTen, EMAIL = :email, SO_DIEN_THOAI = :soDienThoai, 
           DIA_CHI = :diaChi, GHI_CHU = :ghiChu
       WHERE MA_KH = :id`,
      {
        hoTen,
        email,
        soDienThoai,
        diaChi,
        ghiChu,
        id: parseInt(req.params.id),
      },
    );
    if (result.rowsAffected === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy khách hàng" });
    }
    res.json({ success: true, message: "Cập nhật thành công" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE - Xóa khách hàng
router.delete("/:id", async (req, res) => {
  try {
    const result = await db.execute(
      "DELETE FROM KHACH_HANG WHERE MA_KH = :id",
      { id: parseInt(req.params.id) },
    );
    if (result.rowsAffected === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy khách hàng" });
    }
    res.json({ success: true, message: "Xóa thành công" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
