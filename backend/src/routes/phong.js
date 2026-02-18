const express = require("express");
const router = express.Router();
const db = require("../config/database");

// GET - Lấy tất cả phòng (kèm thông tin loại phòng)
router.get("/", async (req, res) => {
  try {
    const result = await db.execute(
      `SELECT p.MA_PHONG, p.TEN_PHONG, p.TANG, p.TRANG_THAI, p.GHI_CHU,
              lp.MA_LOAI_PHONG, lp.TEN_LOAI, lp.MO_TA AS MO_TA_LOAI, 
              lp.GIA_MOI_NGAY, lp.LOAI_THU_CUNG, lp.SUC_CHUA
       FROM PHONG p
       JOIN LOAI_PHONG lp ON p.MA_LOAI_PHONG = lp.MA_LOAI_PHONG
       ORDER BY p.TEN_PHONG`,
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET - Lấy phòng trống theo khoảng thời gian
router.get("/trong", async (req, res) => {
  try {
    const { ngayNhan, ngayTra, loaiThuCung } = req.query;

    let sql = `
      SELECT p.MA_PHONG, p.TEN_PHONG, p.TANG, p.TRANG_THAI,
             lp.TEN_LOAI, lp.GIA_MOI_NGAY, lp.LOAI_THU_CUNG, lp.SUC_CHUA, lp.MO_TA
      FROM PHONG p
      JOIN LOAI_PHONG lp ON p.MA_LOAI_PHONG = lp.MA_LOAI_PHONG
      WHERE p.TRANG_THAI != 'BAO_TRI'
    `;
    const binds = {};

    if (ngayNhan && ngayTra) {
      sql += `
        AND p.MA_PHONG NOT IN (
          SELECT MA_PHONG FROM DAT_PHONG
          WHERE TRANG_THAI IN ('DA_DAT', 'NHAN_PHONG')
            AND (
              (NGAY_NHAN < TO_DATE(:ngayTra, 'YYYY-MM-DD') AND NGAY_TRA > TO_DATE(:ngayNhan, 'YYYY-MM-DD'))
            )
        )
      `;
      binds.ngayNhan = ngayNhan;
      binds.ngayTra = ngayTra;
    }

    if (loaiThuCung) {
      sql += ` AND (lp.LOAI_THU_CUNG = :loaiThuCung OR lp.LOAI_THU_CUNG = 'TAT_CA')`;
      binds.loaiThuCung = loaiThuCung;
    }

    sql += " ORDER BY lp.GIA_MOI_NGAY, p.TEN_PHONG";

    const result = await db.execute(sql, binds);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET - Lấy loại phòng
router.get("/loai-phong", async (req, res) => {
  try {
    const result = await db.execute(
      "SELECT * FROM LOAI_PHONG ORDER BY MA_LOAI_PHONG",
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET - Lấy phòng theo ID
router.get("/:id", async (req, res) => {
  try {
    const result = await db.execute(
      `SELECT p.*, lp.TEN_LOAI, lp.GIA_MOI_NGAY, lp.LOAI_THU_CUNG, lp.SUC_CHUA
       FROM PHONG p JOIN LOAI_PHONG lp ON p.MA_LOAI_PHONG = lp.MA_LOAI_PHONG
       WHERE p.MA_PHONG = :id`,
      { id: parseInt(req.params.id) },
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy phòng" });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT - Cập nhật trạng thái phòng
router.put("/:id/trang-thai", async (req, res) => {
  try {
    const { trangThai } = req.body;
    const result = await db.execute(
      "UPDATE PHONG SET TRANG_THAI = :trangThai WHERE MA_PHONG = :id",
      { trangThai, id: parseInt(req.params.id) },
    );
    if (result.rowsAffected === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy phòng" });
    }
    res.json({ success: true, message: "Cập nhật trạng thái thành công" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST - Thêm phòng mới
router.post("/", async (req, res) => {
  try {
    const { maLoaiPhong, tenPhong, tang, ghiChu } = req.body;
    const result = await db.execute(
      `INSERT INTO PHONG (MA_LOAI_PHONG, TEN_PHONG, TANG, GHI_CHU)
       VALUES (:maLoaiPhong, :tenPhong, :tang, :ghiChu)
       RETURNING MA_PHONG INTO :maPhong`,
      {
        maLoaiPhong: parseInt(maLoaiPhong),
        tenPhong,
        tang: parseInt(tang),
        ghiChu: ghiChu || null,
        maPhong: { dir: db.oracledb.BIND_OUT, type: db.oracledb.NUMBER },
      },
    );
    res.status(201).json({
      success: true,
      message: "Thêm phòng thành công",
      data: { maPhong: result.outBinds.maPhong[0] },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT - Cập nhật thông tin phòng
router.put("/:id", async (req, res) => {
  try {
    const { maLoaiPhong, tenPhong, tang, trangThai, ghiChu } = req.body;
    const result = await db.execute(
      `UPDATE PHONG 
       SET MA_LOAI_PHONG = :maLoaiPhong, TEN_PHONG = :tenPhong, 
           TANG = :tang, TRANG_THAI = :trangThai, GHI_CHU = :ghiChu
       WHERE MA_PHONG = :id`,
      {
        maLoaiPhong: parseInt(maLoaiPhong),
        tenPhong,
        tang: parseInt(tang),
        trangThai,
        ghiChu: ghiChu || null,
        id: parseInt(req.params.id),
      },
    );
    if (result.rowsAffected === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy phòng" });
    }
    res.json({ success: true, message: "Cập nhật phòng thành công" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
