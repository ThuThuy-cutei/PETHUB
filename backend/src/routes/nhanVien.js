const express = require("express");
const router = express.Router();
const db = require("../config/database");

// GET - Lấy tất cả nhân viên
router.get("/", async (req, res) => {
  try {
    const result = await db.execute(
      `SELECT MA_NV, HO_TEN, EMAIL, SO_DIEN_THOAI, CHUC_VU,
              TO_CHAR(NGAY_VAO_LAM, 'YYYY-MM-DD') AS NGAY_VAO_LAM, TRANG_THAI
       FROM NHAN_VIEN ORDER BY MA_NV`,
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET - Nhân viên đang làm
router.get("/dang-lam", async (req, res) => {
  try {
    const result = await db.execute(
      `SELECT MA_NV, HO_TEN, CHUC_VU
       FROM NHAN_VIEN WHERE TRANG_THAI = 'DANG_LAM' ORDER BY HO_TEN`,
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST - Thêm nhân viên
router.post("/", async (req, res) => {
  try {
    const { hoTen, email, soDienThoai, chucVu } = req.body;
    const result = await db.execute(
      `INSERT INTO NHAN_VIEN (HO_TEN, EMAIL, SO_DIEN_THOAI, CHUC_VU)
       VALUES (:hoTen, :email, :soDienThoai, :chucVu)
       RETURNING MA_NV INTO :maNv`,
      {
        hoTen,
        email,
        soDienThoai,
        chucVu,
        maNv: { dir: db.oracledb.BIND_OUT, type: db.oracledb.NUMBER },
      },
    );
    res.status(201).json({
      success: true,
      message: "Thêm nhân viên thành công",
      data: { maNv: result.outBinds.maNv[0] },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
