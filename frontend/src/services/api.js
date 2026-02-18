/**
 * API Service Layer
 * Khi USE_MOCK = true: sử dụng dữ liệu từ mockData.json
 * Khi USE_MOCK = false: gọi API thực tế đến backend Express + Oracle
 */
import mockData from '@/data/mockData.json';

const USE_MOCK = false; // Chuyển sang false khi kết nối Oracle
const API_BASE = 'http://localhost:5000/api';

// ============ HELPER ============
async function fetchAPI(endpoint, options = {}) {
  if (USE_MOCK) return null;
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'API Error');
  return data;
}

// ============ DASHBOARD ============
export async function getDashboardStats() {
  if (USE_MOCK) return mockData.dashboardStats;
  const res = await fetchAPI('/dashboard/stats');
  return res.data;
}

export async function getRecentBookings() {
  if (USE_MOCK) return mockData.datPhong.slice(0, 10);
  const res = await fetchAPI('/dashboard/dat-phong-gan-day');
  return res.data;
}

// ============ PHÒNG ============
export async function getAllRooms() {
  if (USE_MOCK) return mockData.phong;
  const res = await fetchAPI('/phong');
  return res.data;
}

export async function getAvailableRooms(ngayNhan, ngayTra, loaiThuCung) {
  if (USE_MOCK) {
    return mockData.phong.filter((p) => {
      const statusOk = p.TRANG_THAI === 'TRONG';
      const typeOk = !loaiThuCung || p.LOAI_THU_CUNG === loaiThuCung || p.LOAI_THU_CUNG === 'TAT_CA';
      return statusOk && typeOk;
    });
  }
  const params = new URLSearchParams();
  if (ngayNhan) params.append('ngayNhan', ngayNhan);
  if (ngayTra) params.append('ngayTra', ngayTra);
  if (loaiThuCung) params.append('loaiThuCung', loaiThuCung);
  const res = await fetchAPI(`/phong/trong?${params}`);
  return res.data;
}

export async function getRoomTypes() {
  if (USE_MOCK) return mockData.loaiPhong;
  const res = await fetchAPI('/phong/loai-phong');
  return res.data;
}

export async function createRoom(data) {
  if (USE_MOCK) return { maPhong: 99 };
  const res = await fetchAPI('/phong', { method: 'POST', body: JSON.stringify(data) });
  return res;
}

export async function updateRoom(id, data) {
  if (USE_MOCK) return { success: true };
  const res = await fetchAPI(`/phong/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  return res;
}

// ============ KHÁCH HÀNG ============
export async function getAllCustomers() {
  if (USE_MOCK) return mockData.khachHang;
  const res = await fetchAPI('/khach-hang');
  return res.data;
}

export async function createCustomer(data) {
  if (USE_MOCK) {
    const newId = Math.max(...mockData.khachHang.map(k => k.MA_KH)) + 1;
    return { maKh: newId };
  }
  const res = await fetchAPI('/khach-hang', { method: 'POST', body: JSON.stringify(data) });
  return res.data;
}

export async function findOrCreateCustomer(data) {
  if (USE_MOCK) {
    const existing = mockData.khachHang.find(k => k.SO_DIEN_THOAI === data.soDienThoai);
    if (existing) return { maKh: existing.MA_KH };
    const newId = Math.max(...mockData.khachHang.map(k => k.MA_KH)) + 1;
    return { maKh: newId };
  }
  const res = await fetchAPI('/khach-hang/find-or-create', { method: 'POST', body: JSON.stringify(data) });
  return res.data;
}

// ============ THÚ CƯNG ============
export async function getAllPets() {
  if (USE_MOCK) return mockData.thuCung;
  const res = await fetchAPI('/thu-cung');
  return res.data;
}

export async function getPetsByCustomer(maKh) {
  if (USE_MOCK) return mockData.thuCung.filter(tc => tc.MA_KH === maKh);
  const res = await fetchAPI(`/thu-cung/khach-hang/${maKh}`);
  return res.data;
}

export async function createPet(data) {
  if (USE_MOCK) {
    const newId = mockData.thuCung.length > 0 ? Math.max(...mockData.thuCung.map(t => t.MA_TC)) + 1 : 1;
    return { maTc: newId };
  }
  const res = await fetchAPI('/thu-cung', { method: 'POST', body: JSON.stringify(data) });
  return res.data;
}

// ============ DỊCH VỤ ============
export async function getAllServices() {
  if (USE_MOCK) return mockData.dichVu;
  const res = await fetchAPI('/dich-vu');
  return res.data;
}

export async function getActiveServices() {
  if (USE_MOCK) return mockData.dichVu.filter(dv => dv.TRANG_THAI === 'HOAT_DONG');
  const res = await fetchAPI('/dich-vu/hoat-dong');
  return res.data;
}

export async function createService(data) {
  if (USE_MOCK) return { maDv: 99 };
  const res = await fetchAPI('/dich-vu', { method: 'POST', body: JSON.stringify(data) });
  return res;
}

export async function updateService(id, data) {
  if (USE_MOCK) return { success: true };
  const res = await fetchAPI(`/dich-vu/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  return res;
}

export async function deleteService(id) {
  if (USE_MOCK) return { success: true };
  const res = await fetchAPI(`/dich-vu/${id}`, { method: 'DELETE' });
  return res;
}

// ============ ĐẶT PHÒNG ============
export async function getAllBookings() {
  if (USE_MOCK) return mockData.datPhong;
  const res = await fetchAPI('/dat-phong');
  return res.data;
}

export async function createBooking(data) {
  if (USE_MOCK) {
    const newId = Math.max(...mockData.datPhong.map(dp => dp.MA_DAT_PHONG)) + 1;
    return { success: true, maDatPhong: newId };
  }
  const res = await fetchAPI('/dat-phong', { method: 'POST', body: JSON.stringify(data) });
  return res;
}

export async function getBookingsByCustomer(maKh) {
  if (USE_MOCK) {
    const customerPets = mockData.thuCung.filter(tc => tc.MA_KH === maKh).map(tc => tc.MA_TC);
    return mockData.datPhong.filter(dp => customerPets.includes(dp.MA_TC));
  }
  const res = await fetchAPI(`/dat-phong/khach-hang/${maKh}`);
  return res.data;
}

export async function getBillsByCustomer(maKh) {
  if (USE_MOCK) {
    const customerPets = mockData.thuCung.filter(tc => tc.MA_KH === maKh).map(tc => tc.MA_TC);
    const bookingIds = mockData.datPhong.filter(dp => customerPets.includes(dp.MA_TC)).map(dp => dp.MA_DAT_PHONG);
    return mockData.hoaDon.filter(hd => bookingIds.includes(hd.MA_DAT_PHONG));
  }
  const res = await fetchAPI(`/hoa-don/khach-hang/${maKh}`);
  return res.data;
}

export async function updateBookingStatus(id, trangThai) {
  if (USE_MOCK) return { success: true };
  const res = await fetchAPI(`/dat-phong/${id}/trang-thai`, {
    method: 'PUT',
    body: JSON.stringify({ trangThai }),
  });
  return res;
}

// ============ HÓA ĐƠN ============
export async function getAllBills() {
  if (USE_MOCK) return mockData.hoaDon;
  const res = await fetchAPI('/hoa-don');
  return res.data;
}

export async function getBillById(id) {
  if (USE_MOCK) return mockData.hoaDon.find(hd => hd.MA_HD === id);
  const res = await fetchAPI(`/hoa-don/${id}`);
  return res.data;
}

export async function createBill(maDatPhong, giamGia = 0) {
  if (USE_MOCK) return { maHd: 99, tongTien: 0 };
  const res = await fetchAPI('/hoa-don', {
    method: 'POST',
    body: JSON.stringify({ maDatPhong, giamGia }),
  });
  return res.data;
}

export async function payBill(id) {
  if (USE_MOCK) return { success: true };
  return await fetchAPI(`/hoa-don/${id}/thanh-toan`, { method: 'PUT' });
}

// ============ NHÂN VIÊN ============
export async function getAllStaff() {
  if (USE_MOCK) return mockData.nhanVien;
  const res = await fetchAPI('/nhan-vien');
  return res.data;
}

export async function getActiveStaff() {
  if (USE_MOCK) return mockData.nhanVien.filter(nv => nv.TRANG_THAI === 'DANG_LAM');
  const res = await fetchAPI('/nhan-vien/dang-lam');
  return res.data;
}

// ============ CHI TIẾT DỊCH VỤ ============
export async function getBookingServices(maDatPhong) {
  if (USE_MOCK) return mockData.chiTietDichVu.filter(ct => ct.MA_DAT_PHONG === maDatPhong);
  const res = await fetchAPI(`/dat-phong/${maDatPhong}/dich-vu`);
  return res.data;
}

// ============ TÀI KHOẢN KHÁCH HÀNG ============
export async function customerLogin(email, matKhau) {
  if (USE_MOCK) {
    const tk = mockData.taiKhoan.find(t => t.EMAIL === email && t.MAT_KHAU === matKhau);
    if (!tk) return { success: false, message: 'Email hoặc mật khẩu không đúng' };
    const kh = mockData.khachHang.find(k => k.MA_KH === tk.MA_KH);
    return { success: true, customer: kh, token: 'mock-token-' + tk.MA_TK };
  }
  const res = await fetchAPI('/auth/login', { method: 'POST', body: JSON.stringify({ email, matKhau }) });
  return res;
}

export async function customerRegister(data) {
  if (USE_MOCK) {
    const existEmail = mockData.taiKhoan.find(t => t.EMAIL === data.email);
    if (existEmail) return { success: false, message: 'Email đã được sử dụng' };
    const existPhone = mockData.khachHang.find(k => k.SO_DIEN_THOAI === data.soDienThoai);
    if (existPhone) return { success: false, message: 'Số điện thoại đã được sử dụng' };
    const newKhId = Math.max(...mockData.khachHang.map(k => k.MA_KH)) + 1;
    const newKh = {
      MA_KH: newKhId, HO_TEN: data.hoTen, EMAIL: data.email,
      SO_DIEN_THOAI: data.soDienThoai, DIA_CHI: data.diaChi || '',
      NGAY_DANG_KY: new Date().toISOString().split('T')[0]
    };
    mockData.khachHang.push(newKh);
    const newTkId = Math.max(...mockData.taiKhoan.map(t => t.MA_TK)) + 1;
    mockData.taiKhoan.push({ MA_TK: newTkId, MA_KH: newKhId, EMAIL: data.email, MAT_KHAU: data.matKhau, NGAY_TAO: newKh.NGAY_DANG_KY });
    return { success: true, customer: newKh, token: 'mock-token-' + newTkId };
  }
  const res = await fetchAPI('/auth/register', { method: 'POST', body: JSON.stringify(data) });
  return res;
}

// ============ CẬP NHẬT THÚ CƯNG HÀNG NGÀY ============
export async function getAllPetUpdates() {
  if (USE_MOCK) return mockData.capNhatThuCung;
  const res = await fetchAPI('/cap-nhat-thu-cung');
  return res.data;
}

export async function getPetUpdatesByBooking(maDatPhong) {
  if (USE_MOCK) return mockData.capNhatThuCung.filter(cn => cn.MA_DAT_PHONG === maDatPhong);
  const res = await fetchAPI(`/cap-nhat-thu-cung/dat-phong/${maDatPhong}`);
  return res.data;
}

export async function getPetUpdatesByCustomer(maKh) {
  if (USE_MOCK) {
    const customerPets = mockData.thuCung.filter(tc => tc.MA_KH === maKh).map(tc => tc.MA_TC);
    return mockData.capNhatThuCung.filter(cn => customerPets.includes(cn.MA_TC));
  }
  const res = await fetchAPI(`/cap-nhat-thu-cung/khach-hang/${maKh}`);
  return res.data;
}

export async function createPetUpdate(data) {
  if (USE_MOCK) {
    const newId = mockData.capNhatThuCung.length > 0
      ? Math.max(...mockData.capNhatThuCung.map(cn => cn.MA_CAP_NHAT)) + 1
      : 1;
    const booking = mockData.datPhong.find(dp => dp.MA_DAT_PHONG === data.maDatPhong);
    const staff = mockData.nhanVien.find(nv => nv.MA_NV === data.maNv);
    const newUpdate = {
      MA_CAP_NHAT: newId,
      MA_DAT_PHONG: data.maDatPhong,
      MA_TC: booking?.MA_TC,
      TEN_TC: booking?.TEN_TC,
      MA_NV: data.maNv,
      TEN_NV: staff?.HO_TEN,
      NGAY: data.ngay || new Date().toISOString().split('T')[0],
      TINH_TRANG: data.tinhTrang,
      GHI_CHU: data.ghiChu,
      HOAT_DONG: data.hoatDong,
      HINH_ANH: data.hinhAnh || []
    };
    mockData.capNhatThuCung.push(newUpdate);
    return { success: true, data: newUpdate };
  }
  const res = await fetchAPI('/cap-nhat-thu-cung', { method: 'POST', body: JSON.stringify(data) });
  return res;
}

// ============ UTILITY ============
export function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

export function getStatusLabel(status) {
  const labels = {
    'TRONG': 'Trống',
    'DA_DAT': 'Đã đặt',
    'DANG_SU_DUNG': 'Đang sử dụng',
    'BAO_TRI': 'Bảo trì',
    'NHAN_PHONG': 'Nhận phòng',
    'TRA_PHONG': 'Trả phòng',
    'HUY': 'Đã hủy',
    'CHUA_THANH_TOAN': 'Chưa thanh toán',
    'DA_THANH_TOAN': 'Đã thanh toán',
    'HOAT_DONG': 'Hoạt động',
    'NGUNG': 'Ngưng',
    'DANG_LAM': 'Đang làm',
    'NGHI_VIEC': 'Nghỉ việc',
    'TAM_NGHI': 'Tạm nghỉ',
  };
  return labels[status] || status;
}

export function getStatusColor(status) {
  const colors = {
    'TRONG': 'badge-green',
    'DA_DAT': 'badge-blue',
    'DANG_SU_DUNG': 'badge-yellow',
    'BAO_TRI': 'badge-red',
    'NHAN_PHONG': 'badge-blue',
    'TRA_PHONG': 'badge-gray',
    'HUY': 'badge-red',
    'CHUA_THANH_TOAN': 'badge-yellow',
    'DA_THANH_TOAN': 'badge-green',
    'HOAT_DONG': 'badge-green',
    'NGUNG': 'badge-red',
  };
  return colors[status] || 'badge-gray';
}

export function getPetTypeLabel(type) {
  const labels = {
    'CHO': '🐕 Chó',
    'MEO': '🐈 Mèo',
    'CHIM': '🐦 Chim',
    'CA': '🐟 Cá',
    'HAMSTER': '🐹 Hamster',
    'THO': '🐰 Thỏ',
    'KHAC': '🐾 Khác',
    'TAT_CA': '🐾 Tất cả',
  };
  return labels[type] || type;
}
