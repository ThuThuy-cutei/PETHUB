-- ============================================================
-- PET HOTEL MANAGEMENT SYSTEM - Oracle Triggers
-- ============================================================

-- ============================================================
-- TRIGGER 1: TRG_CAP_NHAT_TRANG_THAI_PHONG
-- Mục đích: Tự động cập nhật trạng thái phòng khi có đặt phòng
--   - INSERT đặt phòng (DA_DAT) => Phòng chuyển sang DA_DAT
--   - UPDATE trạng thái đặt phòng:
--       NHAN_PHONG => Phòng chuyển sang DANG_SU_DUNG
--       TRA_PHONG / HUY => Phòng chuyển lại TRONG
-- Dùng COMPOUND TRIGGER để tránh lỗi mutating table (ORA-04091)
-- ============================================================
CREATE OR REPLACE TRIGGER TRG_CAP_NHAT_TRANG_THAI_PHONG
FOR INSERT OR UPDATE OF TRANG_THAI ON DAT_PHONG
COMPOUND TRIGGER

    TYPE t_room_update IS RECORD (
        ma_phong NUMBER,
        trang_thai_moi VARCHAR2(20),
        ma_dat_phong NUMBER
    );
    TYPE t_updates IS TABLE OF t_room_update INDEX BY PLS_INTEGER;
    l_updates t_updates;
    l_idx PLS_INTEGER := 0;

    AFTER EACH ROW IS
    BEGIN
        IF INSERTING THEN
            IF :NEW.TRANG_THAI = 'DA_DAT' THEN
                l_idx := l_idx + 1;
                l_updates(l_idx).ma_phong := :NEW.MA_PHONG;
                l_updates(l_idx).trang_thai_moi := 'DA_DAT';
                l_updates(l_idx).ma_dat_phong := :NEW.MA_DAT_PHONG;
            END IF;
        ELSIF UPDATING THEN
            IF :NEW.TRANG_THAI = 'NHAN_PHONG' THEN
                l_idx := l_idx + 1;
                l_updates(l_idx).ma_phong := :NEW.MA_PHONG;
                l_updates(l_idx).trang_thai_moi := 'DANG_SU_DUNG';
                l_updates(l_idx).ma_dat_phong := :NEW.MA_DAT_PHONG;
            ELSIF :NEW.TRANG_THAI IN ('TRA_PHONG', 'HUY') THEN
                l_idx := l_idx + 1;
                l_updates(l_idx).ma_phong := :NEW.MA_PHONG;
                l_updates(l_idx).trang_thai_moi := 'CHECK_TRONG';
                l_updates(l_idx).ma_dat_phong := :NEW.MA_DAT_PHONG;
            END IF;
        END IF;
    END AFTER EACH ROW;

    AFTER STATEMENT IS
        v_count NUMBER;
        TYPE t_processed IS TABLE OF BOOLEAN INDEX BY PLS_INTEGER;
        l_processed t_processed;
    BEGIN
        FOR i IN 1..l_updates.COUNT LOOP
            IF NOT l_processed.EXISTS(l_updates(i).ma_phong) THEN
                l_processed(l_updates(i).ma_phong) := TRUE;

                IF l_updates(i).trang_thai_moi = 'CHECK_TRONG' THEN
                    -- Khi trả phòng/hủy: kiểm tra còn đặt phòng active khác không
                    SELECT COUNT(*) INTO v_count
                    FROM DAT_PHONG
                    WHERE MA_PHONG = l_updates(i).ma_phong
                      AND MA_DAT_PHONG != l_updates(i).ma_dat_phong
                      AND TRANG_THAI IN ('DA_DAT', 'NHAN_PHONG');

                    IF v_count = 0 THEN
                        UPDATE PHONG SET TRANG_THAI = 'TRONG' WHERE MA_PHONG = l_updates(i).ma_phong;
                    END IF;
                ELSE
                    UPDATE PHONG SET TRANG_THAI = l_updates(i).trang_thai_moi WHERE MA_PHONG = l_updates(i).ma_phong;
                END IF;
            END IF;
        END LOOP;
    END AFTER STATEMENT;

END TRG_CAP_NHAT_TRANG_THAI_PHONG;
/

-- ============================================================
-- TRIGGER 2: TRG_TINH_THANH_TIEN_CTDV
-- Mục đích: Tự động tính thành tiền khi thêm/sửa chi tiết dịch vụ
--   và cập nhật tổng tiền dịch vụ trong hóa đơn
-- ============================================================
CREATE OR REPLACE TRIGGER TRG_TINH_THANH_TIEN_CTDV
BEFORE INSERT OR UPDATE ON CHI_TIET_DICH_VU
FOR EACH ROW
BEGIN
    -- Tự động tính thành tiền = số lượng * đơn giá
    :NEW.THANH_TIEN := :NEW.SO_LUONG * :NEW.DON_GIA;
END;
/

-- Trigger cập nhật tổng tiền dịch vụ trong hóa đơn sau khi thêm/sửa/xóa chi tiết DV
-- Dùng COMPOUND TRIGGER để tránh lỗi mutating table (ORA-04091)
CREATE OR REPLACE TRIGGER TRG_CAP_NHAT_TIEN_DV_HOA_DON
FOR INSERT OR UPDATE OR DELETE ON CHI_TIET_DICH_VU
COMPOUND TRIGGER

    -- Collection lưu các mã đặt phòng bị ảnh hưởng
    TYPE t_ma_dp_set IS TABLE OF NUMBER INDEX BY PLS_INTEGER;
    l_ma_dp t_ma_dp_set;
    l_idx PLS_INTEGER := 0;

    AFTER EACH ROW IS
    BEGIN
        l_idx := l_idx + 1;
        IF DELETING THEN
            l_ma_dp(l_idx) := :OLD.MA_DAT_PHONG;
        ELSE
            l_ma_dp(l_idx) := :NEW.MA_DAT_PHONG;
        END IF;
    END AFTER EACH ROW;

    AFTER STATEMENT IS
        v_tong_tien_dv NUMBER(14,2);
        -- Loại bỏ trùng lặp
        TYPE t_processed IS TABLE OF BOOLEAN INDEX BY PLS_INTEGER;
        l_processed t_processed;
        v_ma_dp NUMBER;
    BEGIN
        FOR i IN 1..l_ma_dp.COUNT LOOP
            v_ma_dp := l_ma_dp(i);
            -- Tránh xử lý trùng mã đặt phòng
            IF NOT l_processed.EXISTS(v_ma_dp) THEN
                l_processed(v_ma_dp) := TRUE;

                -- Tính lại tổng tiền dịch vụ
                SELECT NVL(SUM(THANH_TIEN), 0) INTO v_tong_tien_dv
                FROM CHI_TIET_DICH_VU
                WHERE MA_DAT_PHONG = v_ma_dp;

                -- Cập nhật hóa đơn
                UPDATE HOA_DON
                SET TIEN_DICH_VU = v_tong_tien_dv,
                    TONG_TIEN = TIEN_PHONG + v_tong_tien_dv - (TIEN_PHONG + v_tong_tien_dv) * GIAM_GIA / 100
                WHERE MA_DAT_PHONG = v_ma_dp;
            END IF;
        END LOOP;
    END AFTER STATEMENT;

END TRG_CAP_NHAT_TIEN_DV_HOA_DON;
/

COMMIT;
