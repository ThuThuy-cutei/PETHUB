const oracledb = require('oracledb');

async function run() {
  let conn;
  try {
    conn = await oracledb.getConnection({
      user: 'pethotel',
      password: 'pethotel123',
      connectString: 'localhost:1521/FREEPDB1'
    });
    conn.autoCommit = false;

    console.log('Connected to Oracle DB');

    // 1. Delete all existing data in correct order (child tables first)
    const deleteTables = [
      'CAP_NHAT_THU_CUNG', 'CHI_TIET_DICH_VU', 'HOA_DON', 'DAT_PHONG',
      'TAI_KHOAN', 'THU_CUNG', 'PHONG', 'LOAI_PHONG', 'DICH_VU',
      'KHACH_HANG', 'NHAN_VIEN'
    ];

    console.log('\n--- Deleting all existing data ---');
    for (const table of deleteTables) {
      const result = await conn.execute(`DELETE FROM ${table}`);
      console.log(`  Deleted ${result.rowsAffected} rows from ${table}`);
    }
    await conn.commit();
    console.log('  Committed deletes');

    // 2. Insert data with explicit IDs
    console.log('\n--- Inserting NHAN_VIEN (6 records) ---');
    const nhanVien = [
      [1, 'Nguyen Van An', 'an.nv@pethotel.vn', '0901234567', 'Quan ly', '2023-01-15'],
      [2, 'Tran Thi Binh', 'binh.tt@pethotel.vn', '0912345678', 'Nhan vien cham soc', '2023-03-20'],
      [3, 'Le Van Cuong', 'cuong.lv@pethotel.vn', '0923456789', 'Bac si thu y', '2023-06-01'],
      [4, 'Pham Thi Dung', 'dung.pt@pethotel.vn', '0934567890', 'Le tan', '2024-01-10'],
      [5, 'Vo Minh Khoi', 'khoi.vm@pethotel.vn', '0945678901', 'Nhan vien cham soc', '2024-03-15'],
      [6, 'Hoang Thi Lan', 'lan.ht@pethotel.vn', '0956789012', 'Nhan vien cham soc', '2024-06-01'],
    ];
    for (const nv of nhanVien) {
      await conn.execute(
        `INSERT INTO NHAN_VIEN (MA_NV, HO_TEN, EMAIL, SO_DIEN_THOAI, CHUC_VU, NGAY_VAO_LAM) VALUES (:1, :2, :3, :4, :5, TO_DATE(:6, 'YYYY-MM-DD'))`,
        nv
      );
    }
    console.log('  Done');

    console.log('\n--- Inserting KHACH_HANG (8 records) ---');
    const khachHang = [
      [1, 'Hoang Minh Duc', 'duc.hm@gmail.com', '0845123456', '123 Le Loi, Q1, TP.HCM'],
      [2, 'Vo Thi Eu', 'eu.vt@gmail.com', '0856234567', '456 Nguyen Hue, Q1, TP.HCM'],
      [3, 'Bui Van Phong', 'phong.bv@gmail.com', '0867345678', '789 Tran Hung Dao, Q5, TP.HCM'],
      [4, 'Dang Thi Giang', 'giang.dt@gmail.com', '0878456789', '321 Hai Ba Trung, Q3, TP.HCM'],
      [5, 'Ngo Van Hai', 'hai.nv@gmail.com', '0889567890', '654 Vo Van Tan, Q3, TP.HCM'],
      [6, 'Ly Thi Kim Ngan', 'ngan.ltk@gmail.com', '0890678901', '12 Pham Ngu Lao, Q1, TP.HCM'],
      [7, 'Truong Quoc Bao', 'bao.tq@gmail.com', '0801789012', '88 Nguyen Thi Minh Khai, Q3, TP.HCM'],
      [8, 'Phan Thi Thanh Tam', 'tam.ptt@gmail.com', '0812890123', '200 Cach Mang Thang Tam, Q10, TP.HCM'],
    ];
    for (const kh of khachHang) {
      await conn.execute(
        `INSERT INTO KHACH_HANG (MA_KH, HO_TEN, EMAIL, SO_DIEN_THOAI, DIA_CHI) VALUES (:1, :2, :3, :4, :5)`,
        kh
      );
    }
    console.log('  Done');

    console.log('\n--- Inserting THU_CUNG (12 records) ---');
    const thuCung = [
      [1, 1, 'Lucky', 'CHO', 'Golden Retriever', 3, 28.5, 'DUC', 'Khoe manh'],
      [2, 1, 'Miu', 'MEO', 'British Shorthair', 2, 4.2, 'CAI', 'Khoe manh'],
      [3, 2, 'Buddy', 'CHO', 'Corgi', 4, 12.0, 'DUC', 'Di ung nhe voi phan hoa'],
      [4, 3, 'Tom', 'MEO', 'Persian', 1, 3.5, 'DUC', 'Khoe manh'],
      [5, 3, 'Chip', 'HAMSTER', 'Syrian Hamster', 1, 0.15, 'CAI', 'Khoe manh'],
      [6, 4, 'Bella', 'CHO', 'Poodle', 5, 8.0, 'CAI', 'Dang dieu tri viem da'],
      [7, 5, 'Rio', 'CHIM', 'Vet Hong Kong', 2, 0.3, 'DUC', 'Khoe manh'],
      [8, 6, 'Mochi', 'CHO', 'Shiba Inu', 2, 10.5, 'DUC', 'Khoe manh'],
      [9, 6, 'Luna', 'MEO', 'Scottish Fold', 3, 3.8, 'CAI', 'Thua can nhe'],
      [10, 7, 'Max', 'CHO', 'Husky Siberian', 3, 22.0, 'DUC', 'Khoe manh, nang dong'],
      [11, 7, 'Bong', 'THO', 'Holland Lop', 1, 1.8, 'CAI', 'Khoe manh'],
      [12, 8, 'Simba', 'MEO', 'Maine Coon', 4, 7.5, 'DUC', 'Da tiem phong day du'],
    ];
    for (const tc of thuCung) {
      await conn.execute(
        `INSERT INTO THU_CUNG (MA_TC, MA_KH, TEN_TC, LOAI, GIONG, TUOI, CAN_NANG, GIOI_TINH, TINH_TRANG_SK) VALUES (:1, :2, :3, :4, :5, :6, :7, :8, :9)`,
        tc
      );
    }
    console.log('  Done');

    console.log('\n--- Inserting LOAI_PHONG (5 records) ---');
    const loaiPhong = [
      [1, 'Phong Standard Cho', 'Phong tieu chuan cho cho, co dieu hoa, nuoc uong tu dong', 200000, 'CHO', 1],
      [2, 'Phong VIP Cho', 'Phong VIP rong rai, co san choi rieng, camera giam sat', 500000, 'CHO', 2],
      [3, 'Phong Standard Meo', 'Phong cho meo, co cat ve sinh, do choi, cay cao', 180000, 'MEO', 1],
      [4, 'Phong VIP Meo', 'Phong VIP cho meo, co ban cong rieng va do choi cao cap', 450000, 'MEO', 2],
      [5, 'Phong Thu nho', 'Phong danh cho thu cung nho (hamster, tho, chim)', 100000, 'TAT_CA', 3],
    ];
    for (const lp of loaiPhong) {
      await conn.execute(
        `INSERT INTO LOAI_PHONG (MA_LOAI_PHONG, TEN_LOAI, MO_TA, GIA_MOI_NGAY, LOAI_THU_CUNG, SUC_CHUA) VALUES (:1, :2, :3, :4, :5, :6)`,
        lp
      );
    }
    console.log('  Done');

    console.log('\n--- Inserting PHONG (12 records) ---');
    const phong = [
      [1, 1, 'P101', 1, 'TRONG'], [2, 1, 'P102', 1, 'TRONG'], [3, 1, 'P103', 1, 'TRONG'],
      [4, 2, 'P201', 2, 'TRONG'], [5, 2, 'P202', 2, 'TRONG'],
      [6, 3, 'P301', 3, 'TRONG'], [7, 3, 'P302', 3, 'TRONG'],
      [8, 4, 'P401', 4, 'BAO_TRI'], [9, 4, 'P402', 4, 'TRONG'],
      [10, 5, 'P501', 5, 'TRONG'], [11, 5, 'P502', 5, 'TRONG'],
      [12, 1, 'P104', 1, 'TRONG'],
    ];
    for (const p of phong) {
      await conn.execute(
        `INSERT INTO PHONG (MA_PHONG, MA_LOAI_PHONG, TEN_PHONG, TANG, TRANG_THAI) VALUES (:1, :2, :3, :4, :5)`,
        p
      );
    }
    console.log('  Done');

    console.log('\n--- Inserting DICH_VU (10 records) ---');
    const dichVu = [
      [1, 'Tam spa', 'Tam, say kho, chai long chuyen nghiep', 150000, 'LAN', 'HOAT_DONG'],
      [2, 'Cat tia long', 'Cat tia tao kieu long theo yeu cau', 200000, 'LAN', 'HOAT_DONG'],
      [3, 'Kham suc khoe', 'Kham tong quat boi bac si thu y', 300000, 'LAN', 'HOAT_DONG'],
      [4, 'Tiem phong', 'Tiem vaccine theo lich', 250000, 'LAN', 'HOAT_DONG'],
      [5, 'Dan di dao', 'Nhan vien dan thu cung di dao 1 gio', 100000, 'GIO', 'HOAT_DONG'],
      [6, 'An uong dac biet', 'Thuc don dinh duong cao cap', 80000, 'NGAY', 'HOAT_DONG'],
      [7, 'Huan luyen co ban', 'Huan luyen ki nang co ban cho cho', 500000, 'LIEU_TRINH', 'HOAT_DONG'],
      [8, 'Cat mong', 'Cat gua mong tay/chan cho thu cung', 50000, 'LAN', 'HOAT_DONG'],
      [9, 'Ve sinh tai', 'Ve sinh tai chuyen nghiep, phong ngua viem tai', 80000, 'LAN', 'HOAT_DONG'],
      [10, 'Massage thu gian', 'Massage thu gian giup thu cung giam stress', 120000, 'LAN', 'HOAT_DONG'],
    ];
    for (const dv of dichVu) {
      await conn.execute(
        `INSERT INTO DICH_VU (MA_DV, TEN_DV, MO_TA, GIA, DON_VI, TRANG_THAI) VALUES (:1, :2, :3, :4, :5, :6)`,
        dv
      );
    }
    console.log('  Done');

    console.log('\n--- Inserting DAT_PHONG (8 records) ---');
    const datPhong = [
      [1, 1, 3, 1, '2026-02-15', '2026-02-20', 'NHAN_PHONG', 'Cho an kieng, khong cho an do ngot'],
      [2, 3, 5, 2, '2026-02-18', '2026-02-25', 'NHAN_PHONG', 'Buddy di ung voi phan hoa, tranh khu vuc co cay'],
      [3, 2, 6, 2, '2026-02-20', '2026-02-23', 'DA_DAT', null],
      [4, 6, 1, 4, '2026-02-22', '2026-02-28', 'DA_DAT', null],
      [5, 4, 7, 2, '2026-01-10', '2026-01-15', 'TRA_PHONG', null],
      [6, 8, 12, 5, '2026-02-17', '2026-02-22', 'NHAN_PHONG', 'Mochi thich choi bong, cho choi nhieu'],
      [7, 10, 4, 1, '2026-02-25', '2026-03-02', 'DA_DAT', 'Max can nhieu khong gian va di dao nhieu'],
      [8, 12, 9, 6, '2026-01-20', '2026-01-25', 'TRA_PHONG', null],
    ];
    for (const dp of datPhong) {
      await conn.execute(
        `INSERT INTO DAT_PHONG (MA_DAT_PHONG, MA_TC, MA_PHONG, MA_NV, NGAY_NHAN, NGAY_TRA, TRANG_THAI, GHI_CHU) VALUES (:1, :2, :3, :4, TO_DATE(:5, 'YYYY-MM-DD'), TO_DATE(:6, 'YYYY-MM-DD'), :7, :8)`,
        dp
      );
    }
    console.log('  Done');

    console.log('\n--- Inserting HOA_DON (5 records) ---');
    const hoaDon = [
      [1, 1, 1000000, 350000, 5, 1282500, 'CHUA_THANH_TOAN', null],
      [2, 2, 3500000, 200000, 0, 3700000, 'CHUA_THANH_TOAN', null],
      [3, 5, 900000, 150000, 10, 945000, 'DA_THANH_TOAN', '2026-01-15'],
      [4, 6, 1000000, 230000, 0, 1230000, 'CHUA_THANH_TOAN', null],
      [5, 8, 2250000, 380000, 5, 2498500, 'DA_THANH_TOAN', '2026-01-25'],
    ];
    for (const hd of hoaDon) {
      const sql = hd[7]
        ? `INSERT INTO HOA_DON (MA_HD, MA_DAT_PHONG, TIEN_PHONG, TIEN_DICH_VU, GIAM_GIA, TONG_TIEN, TRANG_THAI, NGAY_THANH_TOAN) VALUES (:1, :2, :3, :4, :5, :6, :7, TO_DATE(:8, 'YYYY-MM-DD'))`
        : `INSERT INTO HOA_DON (MA_HD, MA_DAT_PHONG, TIEN_PHONG, TIEN_DICH_VU, GIAM_GIA, TONG_TIEN, TRANG_THAI) VALUES (:1, :2, :3, :4, :5, :6, :7)`;
      const params = hd[7] ? hd : hd.slice(0, 7);
      await conn.execute(sql, params);
    }
    console.log('  Done');

    console.log('\n--- Inserting CHI_TIET_DICH_VU (10 records) ---');
    const ctdv = [
      [1, 1, 1, 1, 150000, 150000, '2026-02-16'],
      [2, 1, 2, 1, 200000, 200000, '2026-02-17'],
      [3, 2, 5, 2, 100000, 200000, '2026-02-19'],
      [4, 5, 1, 1, 150000, 150000, '2026-01-12'],
      [5, 6, 1, 1, 150000, 150000, '2026-02-18'],
      [6, 6, 8, 1, 50000, 50000, '2026-02-18'],
      [7, 6, 9, 1, 80000, 80000, '2026-02-19'],
      [8, 8, 3, 1, 300000, 300000, '2026-01-21'],
      [9, 8, 1, 1, 150000, 150000, '2026-01-22'],
      [10, 8, 8, 1, 50000, 50000, '2026-01-22'],
    ];
    for (const c of ctdv) {
      await conn.execute(
        `INSERT INTO CHI_TIET_DICH_VU (MA_CT_DV, MA_DAT_PHONG, MA_DV, SO_LUONG, DON_GIA, THANH_TIEN, NGAY_SU_DUNG) VALUES (:1, :2, :3, :4, :5, :6, TO_DATE(:7, 'YYYY-MM-DD'))`,
        c
      );
    }
    console.log('  Done');

    console.log('\n--- Inserting TAI_KHOAN (5 records) ---');
    const taiKhoan = [
      [1, 1, 'duc.hm@gmail.com', '123456'],
      [2, 2, 'eu.vt@gmail.com', '123456'],
      [3, 3, 'phong.bv@gmail.com', '123456'],
      [4, 6, 'ngan.ltk@gmail.com', '123456'],
      [5, 7, 'bao.tq@gmail.com', '123456'],
    ];
    for (const tk of taiKhoan) {
      await conn.execute(
        `INSERT INTO TAI_KHOAN (MA_TK, MA_KH, EMAIL, MAT_KHAU) VALUES (:1, :2, :3, :4)`,
        tk
      );
    }
    console.log('  Done');

    console.log('\n--- Inserting CAP_NHAT_THU_CUNG (8 records) ---');
    const capNhat = [
      [1, 1, 1, 2, '2026-02-15', 'Tot', 'Lucky nhap phong vui ve, an uong tot. Da tam rua sach se.', 'Nhan phong, tam rua, an toi', '/images/pets/lucky_day1_1.jpg||/images/pets/lucky_day1_2.jpg'],
      [2, 1, 1, 2, '2026-02-16', 'Tot', 'Lucky an sang het khau phan, di dao buoi sang 30 phut. Tinh than vui ve.', 'An sang, di dao, choi bong, tam spa', '/images/pets/lucky_day2_1.jpg||/images/pets/lucky_day2_2.jpg||/images/pets/lucky_day2_3.jpg'],
      [3, 1, 1, 3, '2026-02-17', 'Binh thuong', 'Lucky hoi met buoi sang, da kham va khong co van de. Chieu da vui ve tro lai.', 'Kham suc khoe, nghi ngoi, an uong binh thuong', '/images/pets/lucky_day3_1.jpg'],
      [4, 2, 3, 2, '2026-02-18', 'Tot', 'Buddy nhan phong VIP, rat hao hung. Da cho an theo khau phan va di dao.', 'Nhan phong, di dao, an toi', '/images/pets/buddy_day1_1.jpg||/images/pets/buddy_day1_2.jpg'],
      [5, 2, 3, 2, '2026-02-19', 'Tot', 'Buddy choi dua rat vui, di dao 2 tieng. An uong tot.', 'Di dao 2h, choi san, an 3 bua', '/images/pets/buddy_day2_1.jpg||/images/pets/buddy_day2_2.jpg'],
      [6, 6, 8, 5, '2026-02-17', 'Tot', 'Mochi nhap phong vui ve, chay nhay khap noi. Da cho an va tam rua.', 'Nhan phong, tam rua, choi bong, an toi', '/images/pets/mochi_day1_1.jpg||/images/pets/mochi_day1_2.jpg'],
      [7, 6, 8, 5, '2026-02-18', 'Tot', 'Mochi an sang het, di dao 1 tieng. Duoc tam spa va cat mong.', 'An sang, di dao, tam spa, cat mong', '/images/pets/mochi_day2_1.jpg'],
      [8, 8, 12, 6, '2026-01-20', 'Tot', 'Simba nhap phong, rat binh tinh va tu tin. Da kham suc khoe tong quat.', 'Nhan phong, kham suc khoe, an toi', '/images/pets/simba_day1_1.jpg'],
    ];
    for (const cn of capNhat) {
      await conn.execute(
        `INSERT INTO CAP_NHAT_THU_CUNG (MA_CAP_NHAT, MA_DAT_PHONG, MA_TC, MA_NV, NGAY, TINH_TRANG, GHI_CHU, HOAT_DONG, HINH_ANH) VALUES (:1, :2, :3, :4, TO_DATE(:5, 'YYYY-MM-DD'), :6, :7, :8, :9)`,
        cn
      );
    }
    console.log('  Done');

    // Commit all changes
    await conn.commit();
    console.log('\n✅ All sample data loaded successfully!');

    // Verify counts
    console.log('\n--- Verification ---');
    const tables = ['NHAN_VIEN', 'KHACH_HANG', 'THU_CUNG', 'LOAI_PHONG', 'PHONG', 'DICH_VU', 'DAT_PHONG', 'HOA_DON', 'CHI_TIET_DICH_VU', 'TAI_KHOAN', 'CAP_NHAT_THU_CUNG'];
    for (const t of tables) {
      const r = await conn.execute(`SELECT COUNT(*) FROM ${t}`);
      console.log(`  ${t}: ${r.rows[0][0]} records`);
    }

    // Verify room statuses (trigger should have updated)
    console.log('\n--- Room statuses ---');
    const rooms = await conn.execute(`SELECT MA_PHONG, TEN_PHONG, TRANG_THAI FROM PHONG ORDER BY MA_PHONG`);
    for (const r of rooms.rows) {
      console.log(`  Room ${r[1]}: ${r[2]}`);
    }

  } catch (err) {
    console.error('Error:', err.message);
    if (conn) await conn.rollback();
  } finally {
    if (conn) await conn.close();
    console.log('\nConnection closed.');
  }
}

run();
