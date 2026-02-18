const express = require("express");
const router = express.Router();
const db = require("../config/database");

// GET - Lấy tất cả hóa đơn
router.get("/", async (req, res) => {
  try {
    const result = await db.execute(
      `SELECT hd.MA_HD, hd.MA_DAT_PHONG, hd.TIEN_PHONG, hd.TIEN_DICH_VU, 
              hd.GIAM_GIA, hd.TONG_TIEN, hd.TRANG_THAI,
              TO_CHAR(hd.NGAY_THANH_TOAN, 'YYYY-MM-DD') AS NGAY_THANH_TOAN,
              p.TEN_PHONG, tc.TEN_TC, kh.HO_TEN AS TEN_CHU,
              TO_CHAR(dp.NGAY_NHAN, 'YYYY-MM-DD') AS NGAY_NHAN,
              TO_CHAR(dp.NGAY_TRA, 'YYYY-MM-DD') AS NGAY_TRA
       FROM HOA_DON hd
       JOIN DAT_PHONG dp ON hd.MA_DAT_PHONG = dp.MA_DAT_PHONG
       JOIN THU_CUNG tc ON dp.MA_TC = tc.MA_TC
       JOIN KHACH_HANG kh ON tc.MA_KH = kh.MA_KH
       JOIN PHONG p ON dp.MA_PHONG = p.MA_PHONG
       ORDER BY hd.NGAY_TAO DESC`,
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET - Lấy hóa đơn theo khách hàng
router.get("/khach-hang/:maKh", async (req, res) => {
  try {
    const result = await db.execute(
      `SELECT hd.MA_HD, hd.MA_DAT_PHONG, hd.TIEN_PHONG, hd.TIEN_DICH_VU, 
              hd.GIAM_GIA, hd.TONG_TIEN, hd.TRANG_THAI,
              TO_CHAR(hd.NGAY_THANH_TOAN, 'YYYY-MM-DD') AS NGAY_THANH_TOAN,
              p.TEN_PHONG, tc.TEN_TC, kh.HO_TEN AS TEN_CHU,
              TO_CHAR(dp.NGAY_NHAN, 'YYYY-MM-DD') AS NGAY_NHAN,
              TO_CHAR(dp.NGAY_TRA, 'YYYY-MM-DD') AS NGAY_TRA
       FROM HOA_DON hd
       JOIN DAT_PHONG dp ON hd.MA_DAT_PHONG = dp.MA_DAT_PHONG
       JOIN THU_CUNG tc ON dp.MA_TC = tc.MA_TC
       JOIN KHACH_HANG kh ON tc.MA_KH = kh.MA_KH
       JOIN PHONG p ON dp.MA_PHONG = p.MA_PHONG
       WHERE kh.MA_KH = :maKh
       ORDER BY hd.NGAY_TAO DESC`,
      { maKh: parseInt(req.params.maKh) },
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET - Lấy hóa đơn theo ID
router.get("/:id", async (req, res) => {
  try {
    const result = await db.execute(
      `SELECT hd.*, p.TEN_PHONG, tc.TEN_TC, tc.LOAI AS LOAI_THU_CUNG,
              kh.HO_TEN AS TEN_CHU, kh.SO_DIEN_THOAI, kh.EMAIL,
              lp.TEN_LOAI AS LOAI_PHONG, lp.GIA_MOI_NGAY,
              TO_CHAR(dp.NGAY_NHAN, 'YYYY-MM-DD') AS NGAY_NHAN,
              TO_CHAR(dp.NGAY_TRA, 'YYYY-MM-DD') AS NGAY_TRA,
              (dp.NGAY_TRA - dp.NGAY_NHAN) AS SO_NGAY
       FROM HOA_DON hd
       JOIN DAT_PHONG dp ON hd.MA_DAT_PHONG = dp.MA_DAT_PHONG
       JOIN THU_CUNG tc ON dp.MA_TC = tc.MA_TC
       JOIN KHACH_HANG kh ON tc.MA_KH = kh.MA_KH
       JOIN PHONG p ON dp.MA_PHONG = p.MA_PHONG
       JOIN LOAI_PHONG lp ON p.MA_LOAI_PHONG = lp.MA_LOAI_PHONG
       WHERE hd.MA_HD = :id`,
      { id: parseInt(req.params.id) },
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy hóa đơn" });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST - Tạo hóa đơn (sử dụng Stored Procedure)
router.post("/", async (req, res) => {
  try {
    const { maDatPhong, giamGia } = req.body;
    const result = await db.execute(
      `BEGIN
         SP_TINH_TONG_TIEN_HOA_DON(
           p_ma_dat_phong => :maDatPhong,
           p_giam_gia => :giamGia,
           p_ma_hd => :maHd,
           p_tong_tien => :tongTien
         );
       END;`,
      {
        maDatPhong: parseInt(maDatPhong),
        giamGia: parseFloat(giamGia) || 0,
        maHd: { dir: db.oracledb.BIND_OUT, type: db.oracledb.NUMBER },
        tongTien: { dir: db.oracledb.BIND_OUT, type: db.oracledb.NUMBER },
      },
    );
    res.status(201).json({
      success: true,
      message: "Tạo hóa đơn thành công",
      data: { maHd: result.outBinds.maHd, tongTien: result.outBinds.tongTien },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT - Thanh toán hóa đơn (sử dụng Stored Procedure)
router.put("/:id/thanh-toan", async (req, res) => {
  try {
    const result = await db.execute(
      `BEGIN
         SP_THANH_TOAN_HOA_DON(
           p_ma_hd => :maHd,
           p_ket_qua => :ketQua
         );
       END;`,
      {
        maHd: parseInt(req.params.id),
        ketQua: {
          dir: db.oracledb.BIND_OUT,
          type: db.oracledb.STRING,
          maxSize: 500,
        },
      },
    );
    const ketQua = result.outBinds.ketQua;
    if (ketQua.startsWith("THANH_CONG")) {
      res.json({ success: true, message: ketQua });
    } else {
      res.status(400).json({ success: false, message: ketQua });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
