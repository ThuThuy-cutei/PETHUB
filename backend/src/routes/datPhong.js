const express = require("express");
const router = express.Router();
const db = require("../config/database");

// GET - Lấy tất cả đặt phòng
router.get("/", async (req, res) => {
  try {
    const result = await db.execute(
      `SELECT dp.MA_DAT_PHONG, dp.MA_TC, tc.TEN_TC, tc.LOAI AS LOAI_THU_CUNG,
              kh.HO_TEN AS TEN_CHU, kh.SO_DIEN_THOAI,
              dp.MA_PHONG, p.TEN_PHONG, lp.TEN_LOAI AS LOAI_PHONG,
              nv.HO_TEN AS TEN_NV,
              TO_CHAR(dp.NGAY_NHAN, 'YYYY-MM-DD') AS NGAY_NHAN,
              TO_CHAR(dp.NGAY_TRA, 'YYYY-MM-DD') AS NGAY_TRA,
              dp.TRANG_THAI, dp.GHI_CHU,
              lp.GIA_MOI_NGAY,
              (dp.NGAY_TRA - dp.NGAY_NHAN) AS SO_NGAY
       FROM DAT_PHONG dp
       JOIN THU_CUNG tc ON dp.MA_TC = tc.MA_TC
       JOIN KHACH_HANG kh ON tc.MA_KH = kh.MA_KH
       JOIN PHONG p ON dp.MA_PHONG = p.MA_PHONG
       JOIN LOAI_PHONG lp ON p.MA_LOAI_PHONG = lp.MA_LOAI_PHONG
       LEFT JOIN NHAN_VIEN nv ON dp.MA_NV = nv.MA_NV
       ORDER BY dp.NGAY_TAO DESC`,
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET - Lấy đặt phòng theo khách hàng
router.get("/khach-hang/:maKh", async (req, res) => {
  try {
    const result = await db.execute(
      `SELECT dp.MA_DAT_PHONG, dp.MA_TC, tc.TEN_TC, tc.LOAI AS LOAI_THU_CUNG,
              kh.HO_TEN AS TEN_CHU, kh.SO_DIEN_THOAI, kh.MA_KH,
              dp.MA_PHONG, p.TEN_PHONG, lp.TEN_LOAI AS LOAI_PHONG,
              nv.HO_TEN AS TEN_NV,
              TO_CHAR(dp.NGAY_NHAN, 'YYYY-MM-DD') AS NGAY_NHAN,
              TO_CHAR(dp.NGAY_TRA, 'YYYY-MM-DD') AS NGAY_TRA,
              dp.TRANG_THAI, dp.GHI_CHU,
              lp.GIA_MOI_NGAY,
              (dp.NGAY_TRA - dp.NGAY_NHAN) AS SO_NGAY
       FROM DAT_PHONG dp
       JOIN THU_CUNG tc ON dp.MA_TC = tc.MA_TC
       JOIN KHACH_HANG kh ON tc.MA_KH = kh.MA_KH
       JOIN PHONG p ON dp.MA_PHONG = p.MA_PHONG
       JOIN LOAI_PHONG lp ON p.MA_LOAI_PHONG = lp.MA_LOAI_PHONG
       LEFT JOIN NHAN_VIEN nv ON dp.MA_NV = nv.MA_NV
       WHERE kh.MA_KH = :maKh
       ORDER BY dp.NGAY_TAO DESC`,
      { maKh: parseInt(req.params.maKh) },
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET - Lấy đặt phòng theo ID
router.get("/:id", async (req, res) => {
  try {
    const result = await db.execute(
      `SELECT dp.*, tc.TEN_TC, tc.LOAI AS LOAI_THU_CUNG, 
              kh.HO_TEN AS TEN_CHU, kh.SO_DIEN_THOAI, kh.EMAIL,
              p.TEN_PHONG, lp.TEN_LOAI AS LOAI_PHONG, lp.GIA_MOI_NGAY,
              nv.HO_TEN AS TEN_NV
       FROM DAT_PHONG dp
       JOIN THU_CUNG tc ON dp.MA_TC = tc.MA_TC
       JOIN KHACH_HANG kh ON tc.MA_KH = kh.MA_KH
       JOIN PHONG p ON dp.MA_PHONG = p.MA_PHONG
       JOIN LOAI_PHONG lp ON p.MA_LOAI_PHONG = lp.MA_LOAI_PHONG
       LEFT JOIN NHAN_VIEN nv ON dp.MA_NV = nv.MA_NV
       WHERE dp.MA_DAT_PHONG = :id`,
      { id: parseInt(req.params.id) },
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đặt phòng" });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST - Đặt phòng mới (sử dụng Stored Procedure tránh Double Booking)
router.post("/", async (req, res) => {
  try {
    const { maTc, maPhong, maNv, ngayNhan, ngayTra, ghiChu } = req.body;

    const result = await db.execute(
      `BEGIN
         SP_DAT_PHONG(
           p_ma_tc => :maTc,
           p_ma_phong => :maPhong,
           p_ma_nv => :maNv,
           p_ngay_nhan => TO_DATE(:ngayNhan, 'YYYY-MM-DD'),
           p_ngay_tra => TO_DATE(:ngayTra, 'YYYY-MM-DD'),
           p_ghi_chu => :ghiChu,
           p_ma_dat_phong => :maDatPhong,
           p_ket_qua => :ketQua
         );
       END;`,
      {
        maTc: parseInt(maTc),
        maPhong: parseInt(maPhong),
        maNv: maNv ? parseInt(maNv) : null,
        ngayNhan,
        ngayTra,
        ghiChu: ghiChu || null,
        maDatPhong: { dir: db.oracledb.BIND_OUT, type: db.oracledb.NUMBER },
        ketQua: {
          dir: db.oracledb.BIND_OUT,
          type: db.oracledb.STRING,
          maxSize: 500,
        },
      },
    );

    const ketQua = result.outBinds.ketQua;
    if (ketQua.startsWith("THANH_CONG")) {
      res.status(201).json({
        success: true,
        message: ketQua,
        data: { maDatPhong: result.outBinds.maDatPhong },
      });
    } else {
      res.status(400).json({ success: false, message: ketQua });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT - Cập nhật trạng thái đặt phòng
router.put("/:id/trang-thai", async (req, res) => {
  try {
    const { trangThai } = req.body;
    const result = await db.execute(
      `UPDATE DAT_PHONG SET TRANG_THAI = :trangThai WHERE MA_DAT_PHONG = :id`,
      { trangThai, id: parseInt(req.params.id) },
    );
    if (result.rowsAffected === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đặt phòng" });
    }
    res.json({ success: true, message: "Cập nhật trạng thái thành công" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST - Thêm dịch vụ cho đặt phòng
router.post("/:id/dich-vu", async (req, res) => {
  try {
    const maDatPhong = parseInt(req.params.id);
    const { maDv, soLuong } = req.body;

    // Lấy giá dịch vụ
    const dvResult = await db.execute(
      "SELECT GIA FROM DICH_VU WHERE MA_DV = :maDv",
      { maDv: parseInt(maDv) },
    );
    if (dvResult.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy dịch vụ" });
    }

    const donGia = dvResult.rows[0].GIA;
    const result = await db.execute(
      `INSERT INTO CHI_TIET_DICH_VU (MA_DAT_PHONG, MA_DV, SO_LUONG, DON_GIA, THANH_TIEN)
       VALUES (:maDatPhong, :maDv, :soLuong, :donGia, :thanhTien)
       RETURNING MA_CT_DV INTO :maCtDv`,
      {
        maDatPhong,
        maDv: parseInt(maDv),
        soLuong: parseInt(soLuong) || 1,
        donGia,
        thanhTien: donGia * (parseInt(soLuong) || 1),
        maCtDv: { dir: db.oracledb.BIND_OUT, type: db.oracledb.NUMBER },
      },
    );
    res.status(201).json({
      success: true,
      message: "Thêm dịch vụ thành công",
      data: { maCtDv: result.outBinds.maCtDv[0] },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET - Lấy dịch vụ đã sử dụng của 1 đặt phòng
router.get("/:id/dich-vu", async (req, res) => {
  try {
    const result = await db.execute(
      `SELECT ct.MA_CT_DV, ct.MA_DV, dv.TEN_DV, ct.SO_LUONG, ct.DON_GIA, ct.THANH_TIEN,
              TO_CHAR(ct.NGAY_SU_DUNG, 'YYYY-MM-DD') AS NGAY_SU_DUNG, dv.DON_VI
       FROM CHI_TIET_DICH_VU ct
       JOIN DICH_VU dv ON ct.MA_DV = dv.MA_DV
       WHERE ct.MA_DAT_PHONG = :id
       ORDER BY ct.NGAY_SU_DUNG`,
      { id: parseInt(req.params.id) },
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
