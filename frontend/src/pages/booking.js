import { useState, useEffect } from 'react';
import {
  getAllBookings, getAllPets, getAllCustomers, getAvailableRooms,
  getActiveStaff, createBooking, updateBookingStatus,
  formatCurrency, getStatusLabel, getStatusColor, getPetTypeLabel
} from '@/services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiSearch, FiX } from 'react-icons/fi';

export default function BookingPage() {
  const [bookings, setBookings] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  // Form data
  const [customers, setCustomers] = useState([]);
  const [pets, setPets] = useState([]);
  const [filteredPets, setFilteredPets] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [staff, setStaff] = useState([]);

  const [form, setForm] = useState({
    maKh: '',
    maTc: '',
    maPhong: '',
    maNv: '',
    ngayNhan: '',
    ngayTra: '',
    ghiChu: '',
  });

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    try {
      const data = await getAllBookings();
      setBookings(data);
    } catch (err) {
      toast.error('Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }

  async function openForm() {
    try {
      const [custs, allPets, staffData] = await Promise.all([
        getAllCustomers(),
        getAllPets(),
        getActiveStaff(),
      ]);
      setCustomers(custs);
      setPets(allPets);
      setStaff(staffData);
      setShowForm(true);
    } catch (err) {
      toast.error('Lỗi tải form');
    }
  }

  function handleCustomerChange(maKh) {
    const id = parseInt(maKh);
    setForm({ ...form, maKh: maKh, maTc: '' });
    setFilteredPets(pets.filter(p => p.MA_KH === id));
    setAvailableRooms([]);
  }

  async function handleSearchRooms() {
    if (!form.ngayNhan || !form.ngayTra) {
      toast.error('Vui lòng chọn ngày nhận và trả phòng');
      return;
    }
    if (form.ngayTra <= form.ngayNhan) {
      toast.error('Ngày trả phải sau ngày nhận');
      return;
    }
    try {
      // Lấy loại thú cưng đã chọn
      const selectedPet = pets.find(p => p.MA_TC === parseInt(form.maTc));
      const loai = selectedPet?.LOAI || '';
      const rooms = await getAvailableRooms(form.ngayNhan, form.ngayTra, loai);
      setAvailableRooms(rooms);
      if (rooms.length === 0) {
        toast('Không có phòng trống phù hợp', { icon: '⚠️' });
      }
    } catch (err) {
      toast.error('Lỗi kiểm tra phòng');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.maTc || !form.maPhong || !form.ngayNhan || !form.ngayTra) {
      toast.error('Vui lòng điền đủ thông tin');
      return;
    }
    try {
      await createBooking({
        maTc: form.maTc,
        maPhong: form.maPhong,
        maNv: form.maNv || null,
        ngayNhan: form.ngayNhan,
        ngayTra: form.ngayTra,
        ghiChu: form.ghiChu,
      });
      toast.success('Đặt phòng thành công!');
      setShowForm(false);
      setForm({ maKh: '', maTc: '', maPhong: '', maNv: '', ngayNhan: '', ngayTra: '', ghiChu: '' });
      loadBookings();
    } catch (err) {
      toast.error(err.message || 'Lỗi đặt phòng');
    }
  }

  async function handleStatusChange(id, newStatus) {
    try {
      await updateBookingStatus(id, newStatus);
      toast.success('Cập nhật trạng thái thành công');
      loadBookings();
    } catch (err) {
      toast.error('Lỗi cập nhật');
    }
  }

  const filteredBookings = bookings.filter(b =>
    !filter ||
    b.TEN_TC?.toLowerCase().includes(filter.toLowerCase()) ||
    b.TEN_CHU?.toLowerCase().includes(filter.toLowerCase()) ||
    b.TEN_PHONG?.toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Đặt Phòng</h1>
          <p className="text-gray-500 mt-1">Quản lý đặt phòng cho thú cưng</p>
        </div>
        <button onClick={openForm} className="btn-primary flex items-center gap-2">
          <FiPlus /> Đặt phòng mới
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Tìm theo tên thú cưng, chủ, phòng..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* Booking Table */}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-3 px-3 text-gray-600 font-semibold">Mã</th>
              <th className="text-left py-3 px-3 text-gray-600 font-semibold">Thú cưng</th>
              <th className="text-left py-3 px-3 text-gray-600 font-semibold">Chủ</th>
              <th className="text-left py-3 px-3 text-gray-600 font-semibold">Phòng</th>
              <th className="text-left py-3 px-3 text-gray-600 font-semibold">Nhận</th>
              <th className="text-left py-3 px-3 text-gray-600 font-semibold">Trả</th>
              <th className="text-left py-3 px-3 text-gray-600 font-semibold">Số ngày</th>
              <th className="text-left py-3 px-3 text-gray-600 font-semibold">Trạng thái</th>
              <th className="text-left py-3 px-3 text-gray-600 font-semibold">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((booking) => (
              <tr key={booking.MA_DAT_PHONG} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-3 font-mono text-gray-500">#{booking.MA_DAT_PHONG}</td>
                <td className="py-3 px-3">
                  <div className="font-medium">{booking.TEN_TC}</div>
                  <div className="text-xs text-gray-400">{getPetTypeLabel(booking.LOAI_THU_CUNG)}</div>
                </td>
                <td className="py-3 px-3">
                  <div>{booking.TEN_CHU}</div>
                  <div className="text-xs text-gray-400">{booking.SO_DIEN_THOAI}</div>
                </td>
                <td className="py-3 px-3">
                  <div className="font-medium">{booking.TEN_PHONG}</div>
                  <div className="text-xs text-gray-400">{booking.LOAI_PHONG}</div>
                </td>
                <td className="py-3 px-3">{booking.NGAY_NHAN}</td>
                <td className="py-3 px-3">{booking.NGAY_TRA}</td>
                <td className="py-3 px-3 text-center">{booking.SO_NGAY}</td>
                <td className="py-3 px-3">
                  <span className={getStatusColor(booking.TRANG_THAI)}>
                    {getStatusLabel(booking.TRANG_THAI)}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <div className="flex gap-1 flex-wrap">
                    {booking.TRANG_THAI === 'DA_DAT' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(booking.MA_DAT_PHONG, 'NHAN_PHONG')}
                          className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                        >
                          Nhận phòng
                        </button>
                        <button
                          onClick={() => handleStatusChange(booking.MA_DAT_PHONG, 'HUY')}
                          className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
                        >
                          Hủy
                        </button>
                      </>
                    )}
                    {booking.TRANG_THAI === 'NHAN_PHONG' && (
                      <button
                        onClick={() => handleStatusChange(booking.MA_DAT_PHONG, 'TRA_PHONG')}
                        className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                      >
                        Trả phòng
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredBookings.length === 0 && (
          <p className="text-center py-8 text-gray-400">Không có dữ liệu</p>
        )}
      </div>

      {/* Booking Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">Đặt phòng mới</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Khách hàng */}
              <div>
                <label className="label">Khách hàng *</label>
                <select
                  value={form.maKh}
                  onChange={(e) => handleCustomerChange(e.target.value)}
                  className="select-field"
                  required
                >
                  <option value="">-- Chọn khách hàng --</option>
                  {customers.map((c) => (
                    <option key={c.MA_KH} value={c.MA_KH}>
                      {c.HO_TEN} - {c.SO_DIEN_THOAI}
                    </option>
                  ))}
                </select>
              </div>

              {/* Thú cưng */}
              <div>
                <label className="label">Thú cưng *</label>
                <select
                  value={form.maTc}
                  onChange={(e) => setForm({ ...form, maTc: e.target.value })}
                  className="select-field"
                  required
                  disabled={!form.maKh}
                >
                  <option value="">-- Chọn thú cưng --</option>
                  {filteredPets.map((p) => (
                    <option key={p.MA_TC} value={p.MA_TC}>
                      {p.TEN_TC} ({getPetTypeLabel(p.LOAI)} - {p.GIONG})
                    </option>
                  ))}
                </select>
              </div>

              {/* Ngày nhận / trả */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Ngày nhận phòng *</label>
                  <input
                    type="date"
                    value={form.ngayNhan}
                    onChange={(e) => setForm({ ...form, ngayNhan: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="label">Ngày trả phòng *</label>
                  <input
                    type="date"
                    value={form.ngayTra}
                    onChange={(e) => setForm({ ...form, ngayTra: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              {/* Kiểm tra phòng trống */}
              <button
                type="button"
                onClick={handleSearchRooms}
                disabled={!form.maTc || !form.ngayNhan || !form.ngayTra}
                className="btn-secondary flex items-center gap-2 w-full justify-center"
              >
                <FiSearch /> Kiểm tra phòng trống
              </button>

              {/* Danh sách phòng trống */}
              {availableRooms.length > 0 && (
                <div>
                  <label className="label">Chọn phòng *</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {availableRooms.map((room) => (
                      <label
                        key={room.MA_PHONG}
                        className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                          form.maPhong === String(room.MA_PHONG)
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="room"
                          value={room.MA_PHONG}
                          checked={form.maPhong === String(room.MA_PHONG)}
                          onChange={(e) => setForm({ ...form, maPhong: e.target.value })}
                          className="text-primary-500"
                        />
                        <div>
                          <p className="font-medium">{room.TEN_PHONG} - {room.TEN_LOAI}</p>
                          <p className="text-xs text-gray-500">
                            {formatCurrency(room.GIA_MOI_NGAY)}/ngày | Tầng {room.TANG}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Nhân viên phụ trách */}
              <div>
                <label className="label">Nhân viên phụ trách</label>
                <select
                  value={form.maNv}
                  onChange={(e) => setForm({ ...form, maNv: e.target.value })}
                  className="select-field"
                >
                  <option value="">-- Không chỉ định --</option>
                  {staff.map((s) => (
                    <option key={s.MA_NV} value={s.MA_NV}>
                      {s.HO_TEN} - {s.CHUC_VU}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ghi chú */}
              <div>
                <label className="label">Ghi chú</label>
                <textarea
                  value={form.ghiChu}
                  onChange={(e) => setForm({ ...form, ghiChu: e.target.value })}
                  className="input-field"
                  rows={3}
                  placeholder="Ghi chú đặc biệt (dị ứng, chế độ ăn...)"
                />
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1">
                  Xác nhận đặt phòng
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
