-- ============================================================
-- PET HOTEL MANAGEMENT SYSTEM - Oracle Stored Procedures
-- ============================================================

-- ============================================================
-- PROCEDURE 1: SP_TINH_TONG_TIEN_HOA_DON
-- Mục đích: Tính tổng tiền hóa đơn bao gồm phí phòng + dịch vụ
-- Tham số:
--   p_ma_dat_phong: Mã đặt phòng cần tính
--   p_giam_gia: Phần trăm giảm giá (mặc định 0)
-- ============================================================
CREATE OR REPLACE PROCEDURE SP_TINH_TONG_TIEN_HOA_DON(
    p_ma_dat_phong  IN  NUMBER,
    p_giam_gia      IN  NUMBER DEFAULT 0,
    p_ma_hd         OUT NUMBER,
    p_tong_tien     OUT NUMBER
)
AS
    v_tien_phong    NUMBER(14,2) := 0;
    v_tien_dich_vu  NUMBER(14,2) := 0;
    v_so_ngay       NUMBER;
    v_gia_phong     NUMBER(12,2);
    v_ma_hd         NUMBER;
BEGIN
    -- 1. Tính tiền phòng = số ngày * giá phòng/ngày
    SELECT (dp.NGAY_TRA - dp.NGAY_NHAN), lp.GIA_MOI_NGAY
    INTO v_so_ngay, v_gia_phong
    FROM DAT_PHONG dp
    JOIN PHONG p ON dp.MA_PHONG = p.MA_PHONG
    JOIN LOAI_PHONG lp ON p.MA_LOAI_PHONG = lp.MA_LOAI_PHONG
    WHERE dp.MA_DAT_PHONG = p_ma_dat_phong;
    
    v_tien_phong := v_so_ngay * v_gia_phong;
    
    -- 2. Tính tổng tiền dịch vụ
    SELECT NVL(SUM(THANH_TIEN), 0) INTO v_tien_dich_vu
    FROM CHI_TIET_DICH_VU
    WHERE MA_DAT_PHONG = p_ma_dat_phong;
    
    -- 3. Tính tổng tiền sau giảm giá
    p_tong_tien := (v_tien_phong + v_tien_dich_vu) * (1 - p_giam_gia / 100);
    
    -- 4. Tạo hoặc cập nhật hóa đơn
    BEGIN
        SELECT MA_HD INTO v_ma_hd
        FROM HOA_DON
        WHERE MA_DAT_PHONG = p_ma_dat_phong;
        
        -- Hóa đơn đã tồn tại => cập nhật
        UPDATE HOA_DON
        SET TIEN_PHONG = v_tien_phong,
            TIEN_DICH_VU = v_tien_dich_vu,
            GIAM_GIA = p_giam_gia,
            TONG_TIEN = p_tong_tien
        WHERE MA_HD = v_ma_hd;
        
        p_ma_hd := v_ma_hd;
        
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            -- Tạo hóa đơn mới
            INSERT INTO HOA_DON (MA_DAT_PHONG, TIEN_PHONG, TIEN_DICH_VU, GIAM_GIA, TONG_TIEN)
            VALUES (p_ma_dat_phong, v_tien_phong, v_tien_dich_vu, p_giam_gia, p_tong_tien)
            RETURNING MA_HD INTO p_ma_hd;
    END;
    
    COMMIT;
    
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
/

-- ============================================================
-- PROCEDURE 2: SP_DAT_PHONG
-- Mục đích: Xử lý đặt phòng với kiểm tra tránh Double Booking
-- Sử dụng Transaction Control để đảm bảo tính toàn vẹn
-- ============================================================
CREATE OR REPLACE PROCEDURE SP_DAT_PHONG(
    p_ma_tc         IN  NUMBER,
    p_ma_phong      IN  NUMBER,
    p_ma_nv         IN  NUMBER DEFAULT NULL,
    p_ngay_nhan     IN  DATE,
    p_ngay_tra      IN  DATE,
    p_ghi_chu       IN  VARCHAR2 DEFAULT NULL,
    p_ma_dat_phong  OUT NUMBER,
    p_ket_qua       OUT VARCHAR2
)
AS
    v_count         NUMBER;
    v_trang_thai    VARCHAR2(20);
BEGIN
    -- 1. Kiểm tra ngày hợp lệ
    IF p_ngay_tra <= p_ngay_nhan THEN
        p_ket_qua := 'LOI: Ngay tra phong phai sau ngay nhan phong';
        RETURN;
    END IF;
    
    IF p_ngay_nhan < TRUNC(SYSDATE) THEN
        p_ket_qua := 'LOI: Ngay nhan phong khong duoc o qua khu';
        RETURN;
    END IF;
    
    -- 2. Kiểm tra trạng thái phòng (không đang bảo trì)
    SELECT TRANG_THAI INTO v_trang_thai
    FROM PHONG
    WHERE MA_PHONG = p_ma_phong
    FOR UPDATE; -- Lock row để tránh race condition
    
    IF v_trang_thai = 'BAO_TRI' THEN
        p_ket_qua := 'LOI: Phong dang bao tri, khong the dat';
        RETURN;
    END IF;
    
    -- 3. Kiểm tra Double Booking: Phòng đã có người đặt trong khoảng thời gian này chưa?
    SELECT COUNT(*) INTO v_count
    FROM DAT_PHONG
    WHERE MA_PHONG = p_ma_phong
      AND TRANG_THAI IN ('DA_DAT', 'NHAN_PHONG')
      AND (
          (p_ngay_nhan >= NGAY_NHAN AND p_ngay_nhan < NGAY_TRA)
          OR (p_ngay_tra > NGAY_NHAN AND p_ngay_tra <= NGAY_TRA)
          OR (p_ngay_nhan <= NGAY_NHAN AND p_ngay_tra >= NGAY_TRA)
      );
    
    IF v_count > 0 THEN
        p_ket_qua := 'LOI: Phong da duoc dat trong khoang thoi gian nay (Double Booking)';
        RETURN;
    END IF;
    
    -- 4. Thực hiện đặt phòng
    INSERT INTO DAT_PHONG (MA_TC, MA_PHONG, MA_NV, NGAY_NHAN, NGAY_TRA, TRANG_THAI, GHI_CHU)
    VALUES (p_ma_tc, p_ma_phong, p_ma_nv, p_ngay_nhan, p_ngay_tra, 'DA_DAT', p_ghi_chu)
    RETURNING MA_DAT_PHONG INTO p_ma_dat_phong;
    
    p_ket_qua := 'THANH_CONG: Dat phong thanh cong voi ma ' || p_ma_dat_phong;
    
EXCEPTION
    WHEN OTHERS THEN
        p_ket_qua := 'LOI: ' || SQLERRM;
END;
/

-- ============================================================
-- PROCEDURE BỔ SUNG: SP_THANH_TOAN_HOA_DON
-- Mục đích: Xử lý thanh toán hóa đơn
-- ============================================================
CREATE OR REPLACE PROCEDURE SP_THANH_TOAN_HOA_DON(
    p_ma_hd     IN  NUMBER,
    p_ket_qua   OUT VARCHAR2
)
AS
    v_trang_thai VARCHAR2(20);
BEGIN
    SELECT TRANG_THAI INTO v_trang_thai
    FROM HOA_DON
    WHERE MA_HD = p_ma_hd;
    
    IF v_trang_thai = 'DA_THANH_TOAN' THEN
        p_ket_qua := 'LOI: Hoa don da duoc thanh toan truoc do';
        RETURN;
    END IF;
    
    IF v_trang_thai = 'HUY' THEN
        p_ket_qua := 'LOI: Hoa don da bi huy';
        RETURN;
    END IF;
    
    UPDATE HOA_DON
    SET TRANG_THAI = 'DA_THANH_TOAN',
        NGAY_THANH_TOAN = SYSDATE
    WHERE MA_HD = p_ma_hd;
    
    COMMIT;
    p_ket_qua := 'THANH_CONG: Thanh toan hoa don ' || p_ma_hd || ' thanh cong';
    
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        p_ket_qua := 'LOI: Khong tim thay hoa don';
    WHEN OTHERS THEN
        ROLLBACK;
        p_ket_qua := 'LOI: ' || SQLERRM;
END;
/

COMMIT;
