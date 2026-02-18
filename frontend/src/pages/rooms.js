import { useState, useEffect } from 'react';
import { getAllRooms, getRoomTypes, createRoom, updateRoom, formatCurrency, getStatusLabel, getStatusColor, getPetTypeLabel } from '@/services/api';
import toast from 'react-hot-toast';
import { FiGrid, FiList, FiPlus, FiEdit2, FiX } from 'react-icons/fi';

export default function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [filterStatus, setFilterStatus] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [form, setForm] = useState({
    maLoaiPhong: '', tenPhong: '', tang: '', trangThai: 'TRONG', ghiChu: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [roomsData, typesData] = await Promise.all([getAllRooms(), getRoomTypes()]);
      setRooms(roomsData);
      setRoomTypes(typesData);
    } catch (err) {
      toast.error('Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }

  function openAddForm() {
    setEditingRoom(null);
    setForm({ maLoaiPhong: '', tenPhong: '', tang: '', trangThai: 'TRONG', ghiChu: '' });
    setShowForm(true);
  }

  function openEditForm(room) {
    setEditingRoom(room);
    setForm({
      maLoaiPhong: String(room.MA_LOAI_PHONG),
      tenPhong: room.TEN_PHONG,
      tang: room.TANG,
      trangThai: room.TRANG_THAI,
      ghiChu: room.GHI_CHU || '',
    });
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.maLoaiPhong || !form.tenPhong || !form.tang) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }
    try {
      if (editingRoom) {
        await updateRoom(editingRoom.MA_PHONG, {
          maLoaiPhong: form.maLoaiPhong,
          tenPhong: form.tenPhong,
          tang: form.tang,
          trangThai: form.trangThai,
          ghiChu: form.ghiChu,
        });
        toast.success('Cập nhật phòng thành công!');
      } else {
        await createRoom({
          maLoaiPhong: form.maLoaiPhong,
          tenPhong: form.tenPhong,
          tang: form.tang,
          ghiChu: form.ghiChu,
        });
        toast.success('Thêm phòng thành công!');
      }
      setShowForm(false);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Lỗi lưu phòng');
    }
  }

  const filteredRooms = rooms.filter(r => !filterStatus || r.TRANG_THAI === filterStatus);

  const statusCounts = rooms.reduce((acc, r) => {
    acc[r.TRANG_THAI] = (acc[r.TRANG_THAI] || 0) + 1;
    return acc;
  }, {});

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
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Phòng</h1>
          <p className="text-gray-500 mt-1">Tổng cộng {rooms.length} phòng</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={openAddForm} className="btn-primary flex items-center gap-2">
            <FiPlus /> Thêm phòng
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500'}`}
          >
            <FiGrid size={20} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500'}`}
          >
            <FiList size={20} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterStatus('')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            !filterStatus ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Tất cả ({rooms.length})
        </button>
        {Object.entries(statusCounts).map(([status, count]) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filterStatus === status ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {getStatusLabel(status)} ({count})
          </button>
        ))}
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredRooms.map((room) => (
            <div key={room.MA_PHONG} className="card hover:shadow-md transition-shadow group relative">
              {/* Edit button */}
              <button
                onClick={() => openEditForm(room)}
                className="absolute top-3 right-3 p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Chỉnh sửa"
              >
                <FiEdit2 size={14} />
              </button>

              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-gray-800">{room.TEN_PHONG}</h3>
                <span className={getStatusColor(room.TRANG_THAI)}>
                  {getStatusLabel(room.TRANG_THAI)}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Loại phòng</span>
                  <span className="font-medium">{room.TEN_LOAI}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tầng</span>
                  <span className="font-medium">{room.TANG}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Giá/ngày</span>
                  <span className="font-medium text-primary-600">{formatCurrency(room.GIA_MOI_NGAY)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Thú cưng</span>
                  <span>{getPetTypeLabel(room.LOAI_THU_CUNG)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Sức chứa</span>
                  <span>{room.SUC_CHUA} con</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-3 text-gray-600 font-semibold">Phòng</th>
                <th className="text-left py-3 px-3 text-gray-600 font-semibold">Loại</th>
                <th className="text-left py-3 px-3 text-gray-600 font-semibold">Tầng</th>
                <th className="text-left py-3 px-3 text-gray-600 font-semibold">Thú cưng</th>
                <th className="text-left py-3 px-3 text-gray-600 font-semibold">Sức chứa</th>
                <th className="text-left py-3 px-3 text-gray-600 font-semibold">Giá/ngày</th>
                <th className="text-left py-3 px-3 text-gray-600 font-semibold">Trạng thái</th>
                <th className="text-left py-3 px-3 text-gray-600 font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredRooms.map((room) => (
                <tr key={room.MA_PHONG} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-3 font-bold">{room.TEN_PHONG}</td>
                  <td className="py-3 px-3">{room.TEN_LOAI}</td>
                  <td className="py-3 px-3">{room.TANG}</td>
                  <td className="py-3 px-3">{getPetTypeLabel(room.LOAI_THU_CUNG)}</td>
                  <td className="py-3 px-3">{room.SUC_CHUA}</td>
                  <td className="py-3 px-3 text-primary-600 font-medium">{formatCurrency(room.GIA_MOI_NGAY)}</td>
                  <td className="py-3 px-3">
                    <span className={getStatusColor(room.TRANG_THAI)}>
                      {getStatusLabel(room.TRANG_THAI)}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <button
                      onClick={() => openEditForm(room)}
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                    >
                      Sửa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Room Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg m-4">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">
                {editingRoom ? 'Chỉnh sửa phòng' : 'Thêm phòng mới'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Tên phòng *</label>
                <input
                  type="text"
                  value={form.tenPhong}
                  onChange={(e) => setForm({ ...form, tenPhong: e.target.value })}
                  className="input-field"
                  placeholder="VD: P601, P602..."
                  required
                />
              </div>

              <div>
                <label className="label">Loại phòng *</label>
                <select
                  value={form.maLoaiPhong}
                  onChange={(e) => setForm({ ...form, maLoaiPhong: e.target.value })}
                  className="select-field"
                  required
                >
                  <option value="">-- Chọn loại phòng --</option>
                  {roomTypes.map(rt => (
                    <option key={rt.MA_LOAI_PHONG} value={rt.MA_LOAI_PHONG}>
                      {rt.TEN_LOAI} - {formatCurrency(rt.GIA_MOI_NGAY)}/ngày ({getPetTypeLabel(rt.LOAI_THU_CUNG)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Tầng *</label>
                  <input
                    type="number"
                    value={form.tang}
                    onChange={(e) => setForm({ ...form, tang: e.target.value })}
                    className="input-field"
                    placeholder="1"
                    min="1"
                    required
                  />
                </div>
                {editingRoom && (
                  <div>
                    <label className="label">Trạng thái</label>
                    <select
                      value={form.trangThai}
                      onChange={(e) => setForm({ ...form, trangThai: e.target.value })}
                      className="select-field"
                    >
                      <option value="TRONG">Trống</option>
                      <option value="DA_DAT">Đã đặt</option>
                      <option value="DANG_SU_DUNG">Đang sử dụng</option>
                      <option value="BAO_TRI">Bảo trì</option>
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="label">Ghi chú</label>
                <textarea
                  value={form.ghiChu}
                  onChange={(e) => setForm({ ...form, ghiChu: e.target.value })}
                  className="input-field"
                  rows={2}
                  placeholder="Ghi chú thêm về phòng..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1">
                  {editingRoom ? 'Cập nhật' : 'Thêm phòng'}
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
