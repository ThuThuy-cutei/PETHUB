const express = require("express");
const router = express.Router();
const db = require("../config/database");

// GET - Lấy tất cả dịch vụ
router.get("/", async (req, res) => {
  try {
    const result = await db.execute(
      `SELECT MA_DV, TEN_DV, MO_TA, GIA, DON_VI, TRANG_THAI
       FROM DICH_VU ORDER BY MA_DV`,
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET - Lấy dịch vụ đang hoạt động
router.get("/hoat-dong", async (req, res) => {
  try {
    const result = await db.execute(
      `SELECT MA_DV, TEN_DV, MO_TA, GIA, DON_VI
       FROM DICH_VU WHERE TRANG_THAI = 'HOAT_DONG' ORDER BY TEN_DV`,
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET - Lấy dịch vụ theo ID
router.get("/:id", async (req, res) => {
  try {
    const result = await db.execute("SELECT * FROM DICH_VU WHERE MA_DV = :id", {
      id: parseInt(req.params.id),
    });
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy dịch vụ" });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST - Thêm dịch vụ
router.post("/", async (req, res) => {
  try {
    const { tenDv, moTa, gia, donVi } = req.body;
    const result = await db.execute(
      `INSERT INTO DICH_VU (TEN_DV, MO_TA, GIA, DON_VI)
       VALUES (:tenDv, :moTa, :gia, :donVi)
       RETURNING MA_DV INTO :maDv`,
      {
        tenDv,
        moTa: moTa || null,
        gia,
        donVi: donVi || "LAN",
        maDv: { dir: db.oracledb.BIND_OUT, type: db.oracledb.NUMBER },
      },
    );
    res.status(201).json({
      success: true,
      message: "Thêm dịch vụ thành công",
      data: { maDv: result.outBinds.maDv[0] },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT - Cập nhật dịch vụ
router.put("/:id", async (req, res) => {
  try {
    const { tenDv, moTa, gia, donVi, trangThai } = req.body;
    const result = await db.execute(
      `UPDATE DICH_VU 
       SET TEN_DV = :tenDv, MO_TA = :moTa, GIA = :gia, DON_VI = :donVi, TRANG_THAI = :trangThai
       WHERE MA_DV = :id`,
      { tenDv, moTa, gia, donVi, trangThai, id: parseInt(req.params.id) },
    );
    if (result.rowsAffected === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy dịch vụ" });
    }
    res.json({ success: true, message: "Cập nhật thành công" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE - Xóa dịch vụ (chỉ khi chưa được sử dụng)
router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    // Kiểm tra dịch vụ đã được sử dụng chưa
    const checkResult = await db.execute(
      "SELECT COUNT(*) AS CNT FROM CHI_TIET_DICH_VU WHERE MA_DV = :id",
      { id },
    );
    if (checkResult.rows[0].CNT > 0) {
      return res.status(400).json({
        success: false,
        message: "Không thể xóa dịch vụ đã được sử dụng. Hãy chuyển sang trạng thái Ngưng.",
      });
    }
    const result = await db.execute(
      "DELETE FROM DICH_VU WHERE MA_DV = :id",
      { id },
    );
    if (result.rowsAffected === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy dịch vụ" });
    }
    res.json({ success: true, message: "Xóa dịch vụ thành công" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
