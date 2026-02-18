-- ============================================================
-- PET HOTEL MANAGEMENT SYSTEM - Sample Data (DML)
-- Du lieu mau phong phu cho toan bo he thong
-- ============================================================

-- ============================================================
-- 1. NHAN VIEN (6 nhan vien)
-- ============================================================
INSERT INTO NHAN_VIEN (HO_TEN, EMAIL, SO_DIEN_THOAI, CHUC_VU, NGAY_VAO_LAM)
VALUES ('Nguyen Van An', 'an.nv@pethotel.vn', '0901234567', 'Quan ly', TO_DATE('2023-01-15', 'YYYY-MM-DD'));

INSERT INTO NHAN_VIEN (HO_TEN, EMAIL, SO_DIEN_THOAI, CHUC_VU, NGAY_VAO_LAM)
VALUES ('Tran Thi Binh', 'binh.tt@pethotel.vn', '0912345678', 'Nhan vien cham soc', TO_DATE('2023-03-20', 'YYYY-MM-DD'));

INSERT INTO NHAN_VIEN (HO_TEN, EMAIL, SO_DIEN_THOAI, CHUC_VU, NGAY_VAO_LAM)
VALUES ('Le Van Cuong', 'cuong.lv@pethotel.vn', '0923456789', 'Bac si thu y', TO_DATE('2023-06-01', 'YYYY-MM-DD'));

INSERT INTO NHAN_VIEN (HO_TEN, EMAIL, SO_DIEN_THOAI, CHUC_VU, NGAY_VAO_LAM)
VALUES ('Pham Thi Dung', 'dung.pt@pethotel.vn', '0934567890', 'Le tan', TO_DATE('2024-01-10', 'YYYY-MM-DD'));

INSERT INTO NHAN_VIEN (HO_TEN, EMAIL, SO_DIEN_THOAI, CHUC_VU, NGAY_VAO_LAM)
VALUES ('Vo Minh Khoi', 'khoi.vm@pethotel.vn', '0945678901', 'Nhan vien cham soc', TO_DATE('2024-03-15', 'YYYY-MM-DD'));

INSERT INTO NHAN_VIEN (HO_TEN, EMAIL, SO_DIEN_THOAI, CHUC_VU, NGAY_VAO_LAM)
VALUES ('Hoang Thi Lan', 'lan.ht@pethotel.vn', '0956789012', 'Nhan vien cham soc', TO_DATE('2024-06-01', 'YYYY-MM-DD'));

-- ============================================================
-- 2. KHACH HANG (8 khach hang)
-- ============================================================
INSERT INTO KHACH_HANG (HO_TEN, EMAIL, SO_DIEN_THOAI, DIA_CHI)
VALUES ('Hoang Minh Duc', 'duc.hm@gmail.com', '0845123456', '123 Le Loi, Q1, TP.HCM');

INSERT INTO KHACH_HANG (HO_TEN, EMAIL, SO_DIEN_THOAI, DIA_CHI)
VALUES ('Vo Thi Eu', 'eu.vt@gmail.com', '0856234567', '456 Nguyen Hue, Q1, TP.HCM');

INSERT INTO KHACH_HANG (HO_TEN, EMAIL, SO_DIEN_THOAI, DIA_CHI)
VALUES ('Bui Van Phong', 'phong.bv@gmail.com', '0867345678', '789 Tran Hung Dao, Q5, TP.HCM');

INSERT INTO KHACH_HANG (HO_TEN, EMAIL, SO_DIEN_THOAI, DIA_CHI)
VALUES ('Dang Thi Giang', 'giang.dt@gmail.com', '0878456789', '321 Hai Ba Trung, Q3, TP.HCM');

INSERT INTO KHACH_HANG (HO_TEN, EMAIL, SO_DIEN_THOAI, DIA_CHI)
VALUES ('Ngo Van Hai', 'hai.nv@gmail.com', '0889567890', '654 Vo Van Tan, Q3, TP.HCM');

INSERT INTO KHACH_HANG (HO_TEN, EMAIL, SO_DIEN_THOAI, DIA_CHI)
VALUES ('Ly Thi Kim Ngan', 'ngan.ltk@gmail.com', '0890678901', '12 Pham Ngu Lao, Q1, TP.HCM');

INSERT INTO KHACH_HANG (HO_TEN, EMAIL, SO_DIEN_THOAI, DIA_CHI)
VALUES ('Truong Quoc Bao', 'bao.tq@gmail.com', '0801789012', '88 Nguyen Thi Minh Khai, Q3, TP.HCM');

INSERT INTO KHACH_HANG (HO_TEN, EMAIL, SO_DIEN_THOAI, DIA_CHI)
VALUES ('Phan Thi Thanh Tam', 'tam.ptt@gmail.com', '0812890123', '200 Cach Mang Thang Tam, Q10, TP.HCM');

-- ============================================================
-- 3. THU CUNG (12 thu cung)
-- ============================================================
INSERT INTO THU_CUNG (MA_KH, TEN_TC, LOAI, GIONG, TUOI, CAN_NANG, GIOI_TINH, TINH_TRANG_SK)
VALUES (1, 'Lucky', 'CHO', 'Golden Retriever', 3, 28.5, 'DUC', 'Khoe manh');

INSERT INTO THU_CUNG (MA_KH, TEN_TC, LOAI, GIONG, TUOI, CAN_NANG, GIOI_TINH, TINH_TRANG_SK)
VALUES (1, 'Miu', 'MEO', 'British Shorthair', 2, 4.2, 'CAI', 'Khoe manh');

INSERT INTO THU_CUNG (MA_KH, TEN_TC, LOAI, GIONG, TUOI, CAN_NANG, GIOI_TINH, TINH_TRANG_SK)
VALUES (2, 'Buddy', 'CHO', 'Corgi', 4, 12.0, 'DUC', 'Di ung nhe voi phan hoa');

INSERT INTO THU_CUNG (MA_KH, TEN_TC, LOAI, GIONG, TUOI, CAN_NANG, GIOI_TINH, TINH_TRANG_SK)
VALUES (3, 'Tom', 'MEO', 'Persian', 1, 3.5, 'DUC', 'Khoe manh');

INSERT INTO THU_CUNG (MA_KH, TEN_TC, LOAI, GIONG, TUOI, CAN_NANG, GIOI_TINH, TINH_TRANG_SK)
VALUES (3, 'Chip', 'HAMSTER', 'Syrian Hamster', 1, 0.15, 'CAI', 'Khoe manh');

INSERT INTO THU_CUNG (MA_KH, TEN_TC, LOAI, GIONG, TUOI, CAN_NANG, GIOI_TINH, TINH_TRANG_SK)
VALUES (4, 'Bella', 'CHO', 'Poodle', 5, 8.0, 'CAI', 'Dang dieu tri viem da');

INSERT INTO THU_CUNG (MA_KH, TEN_TC, LOAI, GIONG, TUOI, CAN_NANG, GIOI_TINH, TINH_TRANG_SK)
VALUES (5, 'Rio', 'CHIM', 'Vet Hong Kong', 2, 0.3, 'DUC', 'Khoe manh');

INSERT INTO THU_CUNG (MA_KH, TEN_TC, LOAI, GIONG, TUOI, CAN_NANG, GIOI_TINH, TINH_TRANG_SK)
VALUES (6, 'Mochi', 'CHO', 'Shiba Inu', 2, 10.5, 'DUC', 'Khoe manh');

INSERT INTO THU_CUNG (MA_KH, TEN_TC, LOAI, GIONG, TUOI, CAN_NANG, GIOI_TINH, TINH_TRANG_SK)
VALUES (6, 'Luna', 'MEO', 'Scottish Fold', 3, 3.8, 'CAI', 'Thua can nhe');

INSERT INTO THU_CUNG (MA_KH, TEN_TC, LOAI, GIONG, TUOI, CAN_NANG, GIOI_TINH, TINH_TRANG_SK)
VALUES (7, 'Max', 'CHO', 'Husky Siberian', 3, 22.0, 'DUC', 'Khoe manh, nang dong');

INSERT INTO THU_CUNG (MA_KH, TEN_TC, LOAI, GIONG, TUOI, CAN_NANG, GIOI_TINH, TINH_TRANG_SK)
VALUES (7, 'Bong', 'THO', 'Holland Lop', 1, 1.8, 'CAI', 'Khoe manh');

INSERT INTO THU_CUNG (MA_KH, TEN_TC, LOAI, GIONG, TUOI, CAN_NANG, GIOI_TINH, TINH_TRANG_SK)
VALUES (8, 'Simba', 'MEO', 'Maine Coon', 4, 7.5, 'DUC', 'Da tiem phong day du');

-- ============================================================
-- 4. LOAI PHONG (5 loai)
-- ============================================================
INSERT INTO LOAI_PHONG (TEN_LOAI, MO_TA, GIA_MOI_NGAY, LOAI_THU_CUNG, SUC_CHUA)
VALUES ('Phong Standard Cho', 'Phong tieu chuan cho cho, co dieu hoa, nuoc uong tu dong', 200000, 'CHO', 1);

INSERT INTO LOAI_PHONG (TEN_LOAI, MO_TA, GIA_MOI_NGAY, LOAI_THU_CUNG, SUC_CHUA)
VALUES ('Phong VIP Cho', 'Phong VIP rong rai, co san choi rieng, camera giam sat', 500000, 'CHO', 2);

INSERT INTO LOAI_PHONG (TEN_LOAI, MO_TA, GIA_MOI_NGAY, LOAI_THU_CUNG, SUC_CHUA)
VALUES ('Phong Standard Meo', 'Phong cho meo, co cat ve sinh, do choi, cay cao', 180000, 'MEO', 1);

INSERT INTO LOAI_PHONG (TEN_LOAI, MO_TA, GIA_MOI_NGAY, LOAI_THU_CUNG, SUC_CHUA)
VALUES ('Phong VIP Meo', 'Phong VIP cho meo, co ban cong rieng va do choi cao cap', 450000, 'MEO', 2);

INSERT INTO LOAI_PHONG (TEN_LOAI, MO_TA, GIA_MOI_NGAY, LOAI_THU_CUNG, SUC_CHUA)
VALUES ('Phong Thu nho', 'Phong danh cho thu cung nho (hamster, tho, chim)', 100000, 'TAT_CA', 3);

-- ============================================================
-- 5. PHONG (12 phong)
-- ============================================================
INSERT INTO PHONG (MA_LOAI_PHONG, TEN_PHONG, TANG, TRANG_THAI) VALUES (1, 'P101', 1, 'TRONG');
INSERT INTO PHONG (MA_LOAI_PHONG, TEN_PHONG, TANG, TRANG_THAI) VALUES (1, 'P102', 1, 'TRONG');
INSERT INTO PHONG (MA_LOAI_PHONG, TEN_PHONG, TANG, TRANG_THAI) VALUES (1, 'P103', 1, 'TRONG');
INSERT INTO PHONG (MA_LOAI_PHONG, TEN_PHONG, TANG, TRANG_THAI) VALUES (2, 'P201', 2, 'TRONG');
INSERT INTO PHONG (MA_LOAI_PHONG, TEN_PHONG, TANG, TRANG_THAI) VALUES (2, 'P202', 2, 'TRONG');
INSERT INTO PHONG (MA_LOAI_PHONG, TEN_PHONG, TANG, TRANG_THAI) VALUES (3, 'P301', 3, 'TRONG');
INSERT INTO PHONG (MA_LOAI_PHONG, TEN_PHONG, TANG, TRANG_THAI) VALUES (3, 'P302', 3, 'TRONG');
INSERT INTO PHONG (MA_LOAI_PHONG, TEN_PHONG, TANG, TRANG_THAI) VALUES (4, 'P401', 4, 'BAO_TRI');
INSERT INTO PHONG (MA_LOAI_PHONG, TEN_PHONG, TANG, TRANG_THAI) VALUES (4, 'P402', 4, 'TRONG');
INSERT INTO PHONG (MA_LOAI_PHONG, TEN_PHONG, TANG, TRANG_THAI) VALUES (5, 'P501', 5, 'TRONG');
INSERT INTO PHONG (MA_LOAI_PHONG, TEN_PHONG, TANG, TRANG_THAI) VALUES (5, 'P502', 5, 'TRONG');
INSERT INTO PHONG (MA_LOAI_PHONG, TEN_PHONG, TANG, TRANG_THAI) VALUES (1, 'P104', 1, 'TRONG');

-- ============================================================
-- 6. DICH VU (10 dich vu)
-- ============================================================
INSERT INTO DICH_VU (TEN_DV, MO_TA, GIA, DON_VI, TRANG_THAI)
VALUES ('Tam spa', 'Tam, say kho, chai long chuyen nghiep', 150000, 'LAN', 'HOAT_DONG');

INSERT INTO DICH_VU (TEN_DV, MO_TA, GIA, DON_VI, TRANG_THAI)
VALUES ('Cat tia long', 'Cat tia tao kieu long theo yeu cau', 200000, 'LAN', 'HOAT_DONG');

INSERT INTO DICH_VU (TEN_DV, MO_TA, GIA, DON_VI, TRANG_THAI)
VALUES ('Kham suc khoe', 'Kham tong quat boi bac si thu y', 300000, 'LAN', 'HOAT_DONG');

INSERT INTO DICH_VU (TEN_DV, MO_TA, GIA, DON_VI, TRANG_THAI)
VALUES ('Tiem phong', 'Tiem vaccine theo lich', 250000, 'LAN', 'HOAT_DONG');

INSERT INTO DICH_VU (TEN_DV, MO_TA, GIA, DON_VI, TRANG_THAI)
VALUES ('Dan di dao', 'Nhan vien dan thu cung di dao 1 gio', 100000, 'GIO', 'HOAT_DONG');

INSERT INTO DICH_VU (TEN_DV, MO_TA, GIA, DON_VI, TRANG_THAI)
VALUES ('An uong dac biet', 'Thuc don dinh duong cao cap', 80000, 'NGAY', 'HOAT_DONG');

INSERT INTO DICH_VU (TEN_DV, MO_TA, GIA, DON_VI, TRANG_THAI)
VALUES ('Huan luyen co ban', 'Huan luyen ki nang co ban cho cho', 500000, 'LIEU_TRINH', 'HOAT_DONG');

INSERT INTO DICH_VU (TEN_DV, MO_TA, GIA, DON_VI, TRANG_THAI)
VALUES ('Cat mong', 'Cat gua mong tay/chan cho thu cung', 50000, 'LAN', 'HOAT_DONG');

INSERT INTO DICH_VU (TEN_DV, MO_TA, GIA, DON_VI, TRANG_THAI)
VALUES ('Ve sinh tai', 'Ve sinh tai chuyen nghiep, phong ngua viem tai', 80000, 'LAN', 'HOAT_DONG');

INSERT INTO DICH_VU (TEN_DV, MO_TA, GIA, DON_VI, TRANG_THAI)
VALUES ('Massage thu gian', 'Massage thu gian giup thu cung giam stress', 120000, 'LAN', 'HOAT_DONG');

-- ============================================================
-- 7. DAT PHONG (8 don dat phong da trang thai)
-- Trigger se tu cap nhat trang thai phong
-- ============================================================
-- Don 1: Lucky - NHAN_PHONG (dang o)
INSERT INTO DAT_PHONG (MA_TC, MA_PHONG, MA_NV, NGAY_NHAN, NGAY_TRA, TRANG_THAI, GHI_CHU)
VALUES (1, 3, 1, TO_DATE('2026-02-15', 'YYYY-MM-DD'), TO_DATE('2026-02-20', 'YYYY-MM-DD'), 'NHAN_PHONG', 'Cho an kieng, khong cho an do ngot');

-- Don 2: Buddy - NHAN_PHONG (dang o)
INSERT INTO DAT_PHONG (MA_TC, MA_PHONG, MA_NV, NGAY_NHAN, NGAY_TRA, TRANG_THAI, GHI_CHU)
VALUES (3, 5, 2, TO_DATE('2026-02-18', 'YYYY-MM-DD'), TO_DATE('2026-02-25', 'YYYY-MM-DD'), 'NHAN_PHONG', 'Buddy di ung voi phan hoa, tranh khu vuc co cay');

-- Don 3: Miu - DA_DAT (chua nhan)
INSERT INTO DAT_PHONG (MA_TC, MA_PHONG, MA_NV, NGAY_NHAN, NGAY_TRA, TRANG_THAI)
VALUES (2, 6, 2, TO_DATE('2026-02-20', 'YYYY-MM-DD'), TO_DATE('2026-02-23', 'YYYY-MM-DD'), 'DA_DAT');

-- Don 4: Bella - DA_DAT (chua nhan)
INSERT INTO DAT_PHONG (MA_TC, MA_PHONG, MA_NV, NGAY_NHAN, NGAY_TRA, TRANG_THAI)
VALUES (6, 1, 4, TO_DATE('2026-02-22', 'YYYY-MM-DD'), TO_DATE('2026-02-28', 'YYYY-MM-DD'), 'DA_DAT');

-- Don 5: Tom - TRA_PHONG (da hoan thanh)
INSERT INTO DAT_PHONG (MA_TC, MA_PHONG, MA_NV, NGAY_NHAN, NGAY_TRA, TRANG_THAI)
VALUES (4, 7, 2, TO_DATE('2026-01-10', 'YYYY-MM-DD'), TO_DATE('2026-01-15', 'YYYY-MM-DD'), 'TRA_PHONG');

-- Don 6: Mochi - NHAN_PHONG (dang o)
INSERT INTO DAT_PHONG (MA_TC, MA_PHONG, MA_NV, NGAY_NHAN, NGAY_TRA, TRANG_THAI, GHI_CHU)
VALUES (8, 12, 5, TO_DATE('2026-02-17', 'YYYY-MM-DD'), TO_DATE('2026-02-22', 'YYYY-MM-DD'), 'NHAN_PHONG', 'Mochi thich choi bong, cho choi nhieu');

-- Don 7: Max - DA_DAT (chua nhan)
INSERT INTO DAT_PHONG (MA_TC, MA_PHONG, MA_NV, NGAY_NHAN, NGAY_TRA, TRANG_THAI, GHI_CHU)
VALUES (10, 4, 1, TO_DATE('2026-02-25', 'YYYY-MM-DD'), TO_DATE('2026-03-02', 'YYYY-MM-DD'), 'DA_DAT', 'Max can nhieu khong gian va di dao nhieu');

-- Don 8: Simba - TRA_PHONG (da hoan thanh)
INSERT INTO DAT_PHONG (MA_TC, MA_PHONG, MA_NV, NGAY_NHAN, NGAY_TRA, TRANG_THAI)
VALUES (12, 9, 6, TO_DATE('2026-01-20', 'YYYY-MM-DD'), TO_DATE('2026-01-25', 'YYYY-MM-DD'), 'TRA_PHONG');

-- ============================================================
-- 8. HOA DON (5 hoa don)
-- ============================================================
-- Hoa don cho Don 1 (Lucky) - Chua thanh toan
INSERT INTO HOA_DON (MA_DAT_PHONG, TIEN_PHONG, TIEN_DICH_VU, GIAM_GIA, TONG_TIEN, TRANG_THAI)
VALUES (1, 1000000, 350000, 5, 1282500, 'CHUA_THANH_TOAN');

-- Hoa don cho Don 2 (Buddy) - Chua thanh toan
INSERT INTO HOA_DON (MA_DAT_PHONG, TIEN_PHONG, TIEN_DICH_VU, GIAM_GIA, TONG_TIEN, TRANG_THAI)
VALUES (2, 3500000, 200000, 0, 3700000, 'CHUA_THANH_TOAN');

-- Hoa don cho Don 5 (Tom) - Da thanh toan
INSERT INTO HOA_DON (MA_DAT_PHONG, TIEN_PHONG, TIEN_DICH_VU, GIAM_GIA, TONG_TIEN, TRANG_THAI, NGAY_THANH_TOAN)
VALUES (5, 900000, 150000, 10, 945000, 'DA_THANH_TOAN', TO_DATE('2026-01-15', 'YYYY-MM-DD'));

-- Hoa don cho Don 6 (Mochi) - Chua thanh toan
INSERT INTO HOA_DON (MA_DAT_PHONG, TIEN_PHONG, TIEN_DICH_VU, GIAM_GIA, TONG_TIEN, TRANG_THAI)
VALUES (6, 1000000, 230000, 0, 1230000, 'CHUA_THANH_TOAN');

-- Hoa don cho Don 8 (Simba) - Da thanh toan
INSERT INTO HOA_DON (MA_DAT_PHONG, TIEN_PHONG, TIEN_DICH_VU, GIAM_GIA, TONG_TIEN, TRANG_THAI, NGAY_THANH_TOAN)
VALUES (8, 2250000, 380000, 5, 2498500, 'DA_THANH_TOAN', TO_DATE('2026-01-25', 'YYYY-MM-DD'));

-- ============================================================
-- 9. CHI TIET DICH VU (10 chi tiet)
-- ============================================================
-- Don 1 (Lucky): Tam spa + Cat tia long
INSERT INTO CHI_TIET_DICH_VU (MA_DAT_PHONG, MA_DV, SO_LUONG, DON_GIA, THANH_TIEN, NGAY_SU_DUNG)
VALUES (1, 1, 1, 150000, 150000, TO_DATE('2026-02-16', 'YYYY-MM-DD'));

INSERT INTO CHI_TIET_DICH_VU (MA_DAT_PHONG, MA_DV, SO_LUONG, DON_GIA, THANH_TIEN, NGAY_SU_DUNG)
VALUES (1, 2, 1, 200000, 200000, TO_DATE('2026-02-17', 'YYYY-MM-DD'));

-- Don 2 (Buddy): Dan di dao 2h
INSERT INTO CHI_TIET_DICH_VU (MA_DAT_PHONG, MA_DV, SO_LUONG, DON_GIA, THANH_TIEN, NGAY_SU_DUNG)
VALUES (2, 5, 2, 100000, 200000, TO_DATE('2026-02-19', 'YYYY-MM-DD'));

-- Don 5 (Tom): Tam spa
INSERT INTO CHI_TIET_DICH_VU (MA_DAT_PHONG, MA_DV, SO_LUONG, DON_GIA, THANH_TIEN, NGAY_SU_DUNG)
VALUES (5, 1, 1, 150000, 150000, TO_DATE('2026-01-12', 'YYYY-MM-DD'));

-- Don 6 (Mochi): Tam spa + Cat mong + Ve sinh tai
INSERT INTO CHI_TIET_DICH_VU (MA_DAT_PHONG, MA_DV, SO_LUONG, DON_GIA, THANH_TIEN, NGAY_SU_DUNG)
VALUES (6, 1, 1, 150000, 150000, TO_DATE('2026-02-18', 'YYYY-MM-DD'));

INSERT INTO CHI_TIET_DICH_VU (MA_DAT_PHONG, MA_DV, SO_LUONG, DON_GIA, THANH_TIEN, NGAY_SU_DUNG)
VALUES (6, 8, 1, 50000, 50000, TO_DATE('2026-02-18', 'YYYY-MM-DD'));

INSERT INTO CHI_TIET_DICH_VU (MA_DAT_PHONG, MA_DV, SO_LUONG, DON_GIA, THANH_TIEN, NGAY_SU_DUNG)
VALUES (6, 9, 1, 80000, 80000, TO_DATE('2026-02-19', 'YYYY-MM-DD'));

-- Don 8 (Simba): Kham suc khoe + Tam spa + Cat mong
INSERT INTO CHI_TIET_DICH_VU (MA_DAT_PHONG, MA_DV, SO_LUONG, DON_GIA, THANH_TIEN, NGAY_SU_DUNG)
VALUES (8, 3, 1, 300000, 300000, TO_DATE('2026-01-21', 'YYYY-MM-DD'));

INSERT INTO CHI_TIET_DICH_VU (MA_DAT_PHONG, MA_DV, SO_LUONG, DON_GIA, THANH_TIEN, NGAY_SU_DUNG)
VALUES (8, 1, 1, 150000, 150000, TO_DATE('2026-01-22', 'YYYY-MM-DD'));

INSERT INTO CHI_TIET_DICH_VU (MA_DAT_PHONG, MA_DV, SO_LUONG, DON_GIA, THANH_TIEN, NGAY_SU_DUNG)
VALUES (8, 8, 1, 50000, 50000, TO_DATE('2026-01-22', 'YYYY-MM-DD'));

-- ============================================================
-- 10. TAI KHOAN KHACH HANG (5 tai khoan)
-- Mat khau mau: 123456 (plain text cho demo)
-- ============================================================
INSERT INTO TAI_KHOAN (MA_KH, EMAIL, MAT_KHAU) VALUES (1, 'duc.hm@gmail.com', '123456');
INSERT INTO TAI_KHOAN (MA_KH, EMAIL, MAT_KHAU) VALUES (2, 'eu.vt@gmail.com', '123456');
INSERT INTO TAI_KHOAN (MA_KH, EMAIL, MAT_KHAU) VALUES (3, 'phong.bv@gmail.com', '123456');
INSERT INTO TAI_KHOAN (MA_KH, EMAIL, MAT_KHAU) VALUES (6, 'ngan.ltk@gmail.com', '123456');
INSERT INTO TAI_KHOAN (MA_KH, EMAIL, MAT_KHAU) VALUES (7, 'bao.tq@gmail.com', '123456');

-- ============================================================
-- 11. CAP NHAT THU CUNG HANG NGAY (8 ban cap nhat)
-- ============================================================
INSERT INTO CAP_NHAT_THU_CUNG (MA_DAT_PHONG, MA_TC, MA_NV, NGAY, TINH_TRANG, GHI_CHU, HOAT_DONG, HINH_ANH)
VALUES (1, 1, 2, TO_DATE('2026-02-15', 'YYYY-MM-DD'), 'Tot',
    'Lucky nhap phong vui ve, an uong tot. Da tam rua sach se.',
    'Nhan phong, tam rua, an toi',
    '/images/pets/lucky_day1_1.jpg||/images/pets/lucky_day1_2.jpg');

INSERT INTO CAP_NHAT_THU_CUNG (MA_DAT_PHONG, MA_TC, MA_NV, NGAY, TINH_TRANG, GHI_CHU, HOAT_DONG, HINH_ANH)
VALUES (1, 1, 2, TO_DATE('2026-02-16', 'YYYY-MM-DD'), 'Tot',
    'Lucky an sang het khau phan, di dao buoi sang 30 phut. Tinh than vui ve.',
    'An sang, di dao, choi bong, tam spa',
    '/images/pets/lucky_day2_1.jpg||/images/pets/lucky_day2_2.jpg||/images/pets/lucky_day2_3.jpg');

INSERT INTO CAP_NHAT_THU_CUNG (MA_DAT_PHONG, MA_TC, MA_NV, NGAY, TINH_TRANG, GHI_CHU, HOAT_DONG, HINH_ANH)
VALUES (1, 1, 3, TO_DATE('2026-02-17', 'YYYY-MM-DD'), 'Binh thuong',
    'Lucky hoi met buoi sang, da kham va khong co van de. Chieu da vui ve tro lai.',
    'Kham suc khoe, nghi ngoi, an uong binh thuong',
    '/images/pets/lucky_day3_1.jpg');

INSERT INTO CAP_NHAT_THU_CUNG (MA_DAT_PHONG, MA_TC, MA_NV, NGAY, TINH_TRANG, GHI_CHU, HOAT_DONG, HINH_ANH)
VALUES (2, 3, 2, TO_DATE('2026-02-18', 'YYYY-MM-DD'), 'Tot',
    'Buddy nhan phong VIP, rat hao hung. Da cho an theo khau phan va di dao.',
    'Nhan phong, di dao, an toi',
    '/images/pets/buddy_day1_1.jpg||/images/pets/buddy_day1_2.jpg');

INSERT INTO CAP_NHAT_THU_CUNG (MA_DAT_PHONG, MA_TC, MA_NV, NGAY, TINH_TRANG, GHI_CHU, HOAT_DONG, HINH_ANH)
VALUES (2, 3, 2, TO_DATE('2026-02-19', 'YYYY-MM-DD'), 'Tot',
    'Buddy choi dua rat vui, di dao 2 tieng. An uong tot.',
    'Di dao 2h, choi san, an 3 bua',
    '/images/pets/buddy_day2_1.jpg||/images/pets/buddy_day2_2.jpg');

INSERT INTO CAP_NHAT_THU_CUNG (MA_DAT_PHONG, MA_TC, MA_NV, NGAY, TINH_TRANG, GHI_CHU, HOAT_DONG, HINH_ANH)
VALUES (6, 8, 5, TO_DATE('2026-02-17', 'YYYY-MM-DD'), 'Tot',
    'Mochi nhap phong vui ve, chay nhay khap noi. Da cho an va tam rua.',
    'Nhan phong, tam rua, choi bong, an toi',
    '/images/pets/mochi_day1_1.jpg||/images/pets/mochi_day1_2.jpg');

INSERT INTO CAP_NHAT_THU_CUNG (MA_DAT_PHONG, MA_TC, MA_NV, NGAY, TINH_TRANG, GHI_CHU, HOAT_DONG, HINH_ANH)
VALUES (6, 8, 5, TO_DATE('2026-02-18', 'YYYY-MM-DD'), 'Tot',
    'Mochi an sang het, di dao 1 tieng. Duoc tam spa va cat mong.',
    'An sang, di dao, tam spa, cat mong',
    '/images/pets/mochi_day2_1.jpg');

INSERT INTO CAP_NHAT_THU_CUNG (MA_DAT_PHONG, MA_TC, MA_NV, NGAY, TINH_TRANG, GHI_CHU, HOAT_DONG, HINH_ANH)
VALUES (8, 12, 6, TO_DATE('2026-01-20', 'YYYY-MM-DD'), 'Tot',
    'Simba nhap phong, rat binh tinh va tu tin. Da kham suc khoe tong quat.',
    'Nhan phong, kham suc khoe, an toi',
    '/images/pets/simba_day1_1.jpg');

COMMIT;
