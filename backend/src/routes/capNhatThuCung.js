// ============================================================
// Routes: Cập nhật thú cưng hàng ngày
// ============================================================
const express = require("express");
const router = express.Router();
const db = require("../config/database");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Cấu hình multer để lưu ảnh
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../../uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, "pet-" + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) cb(null, true);
    else cb(new Error("Chỉ chấp nhận file ảnh (jpg, png, gif, webp)"));
  },
});

// GET / - Lấy tất cả cập nhật
router.get("/", async (req, res) => {
  try {
    const result = await db.execute(
      `SELECT cn.MA_CAP_NHAT, cn.MA_DAT_PHONG, cn.MA_TC, cn.MA_NV,
              cn.NGAY, cn.TINH_TRANG, cn.GHI_CHU, cn.HOAT_DONG, cn.HINH_ANH,
              TO_CHAR(cn.NGAY_TAO, 'YYYY-MM-DD HH24:MI:SS') AS NGAY_TAO,
              tc.TEN_TC, tc.LOAI AS LOAI_TC,
              nv.HO_TEN AS TEN_NV,
              dp.MA_PHONG
       FROM CAP_NHAT_THU_CUNG cn
       JOIN THU_CUNG tc ON cn.MA_TC = tc.MA_TC
       JOIN NHAN_VIEN nv ON cn.MA_NV = nv.MA_NV
       JOIN DAT_PHONG dp ON cn.MA_DAT_PHONG = dp.MA_DAT_PHONG
       ORDER BY cn.NGAY DESC, cn.NGAY_TAO DESC`,
    );

    const data = result.rows.map((row) => ({
      ...row,
      HINH_ANH: row.HINH_ANH ? row.HINH_ANH.split("||") : [],
    }));

    res.json({ success: true, data });
  } catch (err) {
    console.error("Lỗi lấy cập nhật thú cưng:", err.message);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

// GET /dat-phong/:maDatPhong - Lấy cập nhật theo đặt phòng
router.get("/dat-phong/:maDatPhong", async (req, res) => {
  try {
    const result = await db.execute(
      `SELECT cn.MA_CAP_NHAT, cn.MA_DAT_PHONG, cn.MA_TC, cn.MA_NV,
              cn.NGAY, cn.TINH_TRANG, cn.GHI_CHU, cn.HOAT_DONG, cn.HINH_ANH,
              TO_CHAR(cn.NGAY_TAO, 'YYYY-MM-DD HH24:MI:SS') AS NGAY_TAO,
              tc.TEN_TC, tc.LOAI AS LOAI_TC,
              nv.HO_TEN AS TEN_NV
       FROM CAP_NHAT_THU_CUNG cn
       JOIN THU_CUNG tc ON cn.MA_TC = tc.MA_TC
       JOIN NHAN_VIEN nv ON cn.MA_NV = nv.MA_NV
       WHERE cn.MA_DAT_PHONG = :maDatPhong
       ORDER BY cn.NGAY DESC, cn.NGAY_TAO DESC`,
      { maDatPhong: parseInt(req.params.maDatPhong) },
    );

    const data = result.rows.map((row) => ({
      ...row,
      HINH_ANH: row.HINH_ANH ? row.HINH_ANH.split("||") : [],
    }));

    res.json({ success: true, data });
  } catch (err) {
    console.error("Lỗi:", err.message);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

// GET /khach-hang/:maKh - Lấy cập nhật theo khách hàng
router.get("/khach-hang/:maKh", async (req, res) => {
  try {
    const result = await db.execute(
      `SELECT cn.MA_CAP_NHAT, cn.MA_DAT_PHONG, cn.MA_TC, cn.MA_NV,
              cn.NGAY, cn.TINH_TRANG, cn.GHI_CHU, cn.HOAT_DONG, cn.HINH_ANH,
              TO_CHAR(cn.NGAY_TAO, 'YYYY-MM-DD HH24:MI:SS') AS NGAY_TAO,
              tc.TEN_TC, tc.LOAI AS LOAI_TC,
              nv.HO_TEN AS TEN_NV,
              dp.MA_PHONG
       FROM CAP_NHAT_THU_CUNG cn
       JOIN THU_CUNG tc ON cn.MA_TC = tc.MA_TC
       JOIN NHAN_VIEN nv ON cn.MA_NV = nv.MA_NV
       JOIN DAT_PHONG dp ON cn.MA_DAT_PHONG = dp.MA_DAT_PHONG
       WHERE tc.MA_KH = :maKh
       ORDER BY cn.NGAY DESC, cn.NGAY_TAO DESC`,
      { maKh: parseInt(req.params.maKh) },
    );

    const data = result.rows.map((row) => ({
      ...row,
      HINH_ANH: row.HINH_ANH ? row.HINH_ANH.split("||") : [],
    }));

    res.json({ success: true, data });
  } catch (err) {
    console.error("Lỗi:", err.message);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

// POST / - Tạo cập nhật mới (hỗ trợ upload ảnh)
router.post("/", (req, res, next) => {
  upload.array("images", 5)(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ success: false, message: "Ảnh quá lớn, tối đa 20MB mỗi ảnh" });
      }
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    const { maDatPhong, maTc, maNv, ngay, tinhTrang, ghiChu, hoatDong } =
      req.body;

    if (!maDatPhong || !maTc || !maNv || !tinhTrang) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu thông tin bắt buộc" });
    }

    // Xử lý hình ảnh: lấy đường dẫn file đã upload
    const imagePaths = req.files
      ? req.files.map((f) => "/uploads/" + f.filename)
      : [];
    const hinhAnhStr = imagePaths.length > 0 ? imagePaths.join("||") : null;

    const oracledb = require("oracledb");

    const result = await db.execute(
      `INSERT INTO CAP_NHAT_THU_CUNG (MA_DAT_PHONG, MA_TC, MA_NV, NGAY, TINH_TRANG, GHI_CHU, HOAT_DONG, HINH_ANH)
       VALUES (:maDatPhong, :maTc, :maNv, TO_DATE(:ngay, 'YYYY-MM-DD'), :tinhTrang, :ghiChu, :hoatDong, :hinhAnh)
       RETURNING MA_CAP_NHAT INTO :maCapNhat`,
      {
        maDatPhong: parseInt(maDatPhong),
        maTc: parseInt(maTc),
        maNv: parseInt(maNv),
        ngay: ngay || new Date().toISOString().split("T")[0],
        tinhTrang,
        ghiChu: ghiChu || null,
        hoatDong: hoatDong || null,
        hinhAnh: hinhAnhStr,
        maCapNhat: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      },
    );

    res.status(201).json({
      success: true,
      data: { MA_CAP_NHAT: result.outBinds.maCapNhat[0] },
      message: "Đã tạo cập nhật thú cưng",
    });
  } catch (err) {
    console.error("Lỗi tạo cập nhật:", err.message);
    res
      .status(500)
      .json({ success: false, message: "Lỗi server: " + err.message });
  }
});

module.exports = router;
