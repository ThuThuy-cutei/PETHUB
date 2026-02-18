// ============================================================
// Routes: Xác thực tài khoản khách hàng (Auth)
// ============================================================
const express = require("express");
const router = express.Router();
const db = require("../config/database");

// POST /api/auth/login - Đăng nhập
router.post("/login", async (req, res) => {
  try {
    const { email, matKhau } = req.body;

    if (!email || !matKhau) {
      return res
        .status(400)
        .json({ success: false, message: "Vui lòng nhập email và mật khẩu" });
    }

    const result = await db.execute(
      `SELECT tk.MA_TK, tk.MA_KH, tk.EMAIL, 
              kh.HO_TEN, kh.SO_DIEN_THOAI, kh.DIA_CHI
       FROM TAI_KHOAN tk
       JOIN KHACH_HANG kh ON tk.MA_KH = kh.MA_KH
       WHERE tk.EMAIL = :email AND tk.MAT_KHAU = :matKhau`,
      { email, matKhau },
    );

    if (result.rows.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: "Email hoặc mật khẩu không đúng" });
    }

    const user = result.rows[0];
    res.json({
      success: true,
      customer: {
        MA_KH: user.MA_KH,
        HO_TEN: user.HO_TEN,
        EMAIL: user.EMAIL,
        SO_DIEN_THOAI: user.SO_DIEN_THOAI,
        DIA_CHI: user.DIA_CHI,
      },
      token: "token-" + user.MA_TK,
    });
  } catch (err) {
    console.error("Lỗi đăng nhập:", err.message);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

// POST /api/auth/register - Đăng ký
router.post("/register", async (req, res) => {
  try {
    const { hoTen, email, soDienThoai, diaChi, matKhau } = req.body;

    if (!hoTen || !email || !soDienThoai || !matKhau) {
      return res
        .status(400)
        .json({ success: false, message: "Vui lòng điền đầy đủ thông tin" });
    }

    // Kiểm tra email đã tồn tại trong TAI_KHOAN
    const emailCheck = await db.execute(
      "SELECT COUNT(*) AS CNT FROM TAI_KHOAN WHERE EMAIL = :email",
      { email },
    );
    if (emailCheck.rows[0].CNT > 0) {
      return res
        .status(400)
        .json({ success: false, message: "Email đã được sử dụng" });
    }

    // Kiểm tra khách hàng đã tồn tại (qua SĐT hoặc email) nhưng chưa có tài khoản
    const existingCustomer = await db.execute(
      `SELECT kh.MA_KH, kh.HO_TEN, kh.EMAIL, kh.SO_DIEN_THOAI, kh.DIA_CHI
       FROM KHACH_HANG kh
       WHERE (kh.SO_DIEN_THOAI = :soDienThoai OR kh.EMAIL = :email)
         AND NOT EXISTS (SELECT 1 FROM TAI_KHOAN tk WHERE tk.MA_KH = kh.MA_KH)`,
      { soDienThoai, email },
    );

    if (existingCustomer.rows.length > 0) {
      // Khách hàng đã tồn tại nhưng chưa có tài khoản → tạo tài khoản liên kết
      const kh = existingCustomer.rows[0];
      const oracledb = require("oracledb");

      // Cập nhật thông tin khách hàng nếu cần
      await db.execute(
        `UPDATE KHACH_HANG SET HO_TEN = :hoTen, EMAIL = :email, DIA_CHI = NVL(:diaChi, DIA_CHI)
         WHERE MA_KH = :maKh`,
        { hoTen, email, diaChi: diaChi || null, maKh: kh.MA_KH },
      );

      // Tạo tài khoản
      const tkResult = await db.execute(
        `INSERT INTO TAI_KHOAN (MA_KH, EMAIL, MAT_KHAU)
         VALUES (:maKh, :email, :matKhau)
         RETURNING MA_TK INTO :maTk`,
        {
          maKh: kh.MA_KH,
          email,
          matKhau,
          maTk: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        },
      );

      const maTk = tkResult.outBinds.maTk[0];

      return res.status(201).json({
        success: true,
        customer: {
          MA_KH: kh.MA_KH,
          HO_TEN: hoTen,
          EMAIL: email,
          SO_DIEN_THOAI: kh.SO_DIEN_THOAI,
          DIA_CHI: diaChi || kh.DIA_CHI,
        },
        token: "token-" + maTk,
      });
    }

    // Kiểm tra SĐT đã có tài khoản chưa
    const phoneWithAccount = await db.execute(
      `SELECT COUNT(*) AS CNT FROM KHACH_HANG kh
       JOIN TAI_KHOAN tk ON tk.MA_KH = kh.MA_KH
       WHERE kh.SO_DIEN_THOAI = :soDienThoai`,
      { soDienThoai },
    );
    if (phoneWithAccount.rows[0].CNT > 0) {
      return res
        .status(400)
        .json({ success: false, message: "Số điện thoại đã được sử dụng" });
    }

    // Tạo khách hàng + tài khoản mới trong transaction
    const result = await db.executeTransaction(async (connection) => {
      const oracledb = require("oracledb");

      // Insert khách hàng
      const khResult = await connection.execute(
        `INSERT INTO KHACH_HANG (HO_TEN, EMAIL, SO_DIEN_THOAI, DIA_CHI)
         VALUES (:hoTen, :email, :soDienThoai, :diaChi)
         RETURNING MA_KH INTO :maKh`,
        {
          hoTen,
          email,
          soDienThoai,
          diaChi: diaChi || null,
          maKh: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        },
      );

      const maKh = khResult.outBinds.maKh[0];

      // Insert tài khoản
      const tkResult = await connection.execute(
        `INSERT INTO TAI_KHOAN (MA_KH, EMAIL, MAT_KHAU)
         VALUES (:maKh, :email, :matKhau)
         RETURNING MA_TK INTO :maTk`,
        {
          maKh,
          email,
          matKhau,
          maTk: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        },
      );

      const maTk = tkResult.outBinds.maTk[0];

      return { maKh, maTk };
    });

    res.status(201).json({
      success: true,
      customer: {
        MA_KH: result.maKh,
        HO_TEN: hoTen,
        EMAIL: email,
        SO_DIEN_THOAI: soDienThoai,
        DIA_CHI: diaChi,
      },
      token: "token-" + result.maTk,
    });
  } catch (err) {
    console.error("Lỗi đăng ký:", err.message);
    res
      .status(500)
      .json({ success: false, message: "Lỗi server: " + err.message });
  }
});

module.exports = router;
