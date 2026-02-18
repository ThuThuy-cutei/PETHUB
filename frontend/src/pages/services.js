import { useState, useEffect } from 'react';
import { getAllServices, createService, updateService, deleteService, formatCurrency } from '@/services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import { MdPets } from 'react-icons/md';

const serviceIcons = {
  'Tam spa': '🛁',
  'Cat tia long': '✂️',
  'Kham suc khoe': '🏥',
  'Tiem phong': '💉',
  'Dan di dao': '🚶',
  'An uong dac biet': '🍖',
  'Huan luyen co ban': '🎓',
  'Cat mong': '💅',
};

const unitLabels = {
  'LAN': '/lần',
  'GIO': '/giờ',
  'NGAY': '/ngày',
  'LIEU_TRINH': '/liệu trình',
};

const unitOptions = [
  { value: 'LAN', label: 'Lần' },
  { value: 'GIO', label: 'Giờ' },
  { value: 'NGAY', label: 'Ngày' },
  { value: 'LIEU_TRINH', label: 'Liệu trình' },
];

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [form, setForm] = useState({
    tenDv: '', moTa: '', gia: '', donVi: 'LAN', trangThai: 'HOAT_DONG',
  });

  useEffect(() => {
    loadServices();
  }, []);

  async function loadServices() {
    try {
      const data = await getAllServices();
      setServices(data);
    } catch (err) {
      toast.error('Lỗi tải dữ liệu dịch vụ');
    } finally {
      setLoading(false);
    }
  }

  function openAddForm() {
    setEditingService(null);
    setForm({ tenDv: '', moTa: '', gia: '', donVi: 'LAN', trangThai: 'HOAT_DONG' });
    setShowForm(true);
  }

  function openEditForm(service) {
    setEditingService(service);
    setForm({
      tenDv: service.TEN_DV,
      moTa: service.MO_TA || '',
      gia: service.GIA,
      donVi: service.DON_VI,
      trangThai: service.TRANG_THAI,
    });
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.tenDv || !form.gia) {
      toast.error('Vui lòng điền tên dịch vụ và giá');
      return;
    }
    try {
      if (editingService) {
        await updateService(editingService.MA_DV, {
          tenDv: form.tenDv,
          moTa: form.moTa,
          gia: parseFloat(form.gia),
          donVi: form.donVi,
          trangThai: form.trangThai,
        });
        toast.success('Cập nhật dịch vụ thành công!');
      } else {
        await createService({
          tenDv: form.tenDv,
          moTa: form.moTa,
          gia: parseFloat(form.gia),
          donVi: form.donVi,
        });
        toast.success('Thêm dịch vụ thành công!');
      }
      setShowForm(false);
      loadServices();
    } catch (err) {
      toast.error(err.message || 'Lỗi lưu dịch vụ');
    }
  }

  async function handleDelete(service) {
    if (!confirm(`Bạn có chắc muốn xóa dịch vụ "${service.TEN_DV}"?`)) return;
    try {
      await deleteService(service.MA_DV);
      toast.success('Xóa dịch vụ thành công!');
      loadServices();
    } catch (err) {
      toast.error(err.message || 'Không thể xóa dịch vụ');
    }
  }

  async function handleToggleStatus(service) {
    const newStatus = service.TRANG_THAI === 'HOAT_DONG' ? 'NGUNG' : 'HOAT_DONG';
    try {
      await updateService(service.MA_DV, {
        tenDv: service.TEN_DV,
        moTa: service.MO_TA,
        gia: service.GIA,
        donVi: service.DON_VI,
        trangThai: newStatus,
      });
      toast.success(newStatus === 'HOAT_DONG' ? 'Đã kích hoạt dịch vụ' : 'Đã ngưng dịch vụ');
      loadServices();
    } catch (err) {
      toast.error('Lỗi cập nhật trạng thái');
    }
  }

  const filteredServices = services.filter(s =>
    !search || s.TEN_DV.toLowerCase().includes(search.toLowerCase()) ||
    s.MO_TA?.toLowerCase().includes(search.toLowerCase())
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
          <h1 className="text-2xl font-bold text-gray-800">Dịch Vụ Chăm Sóc</h1>
          <p className="text-gray-500 mt-1">Quản lý dịch vụ chăm sóc thú cưng</p>
        </div>
        <button onClick={openAddForm} className="btn-primary flex items-center gap-2">
          <FiPlus /> Thêm dịch vụ
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Tìm kiếm dịch vụ..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* Service Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredServices.map((service) => (
          <div
            key={service.MA_DV}
            className="card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group relative"
          >
            {/* Action buttons */}
            <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => openEditForm(service)}
                className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                title="Chỉnh sửa"
              >
                <FiEdit2 size={14} />
              </button>
              <button
                onClick={() => handleDelete(service)}
                className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                title="Xóa"
              >
                <FiTrash2 size={14} />
              </button>
            </div>

            {/* Icon */}
            <div className="text-center mb-4">
              <div className="w-16 h-16 mx-auto bg-primary-50 rounded-2xl flex items-center justify-center text-3xl group-hover:bg-primary-100 transition-colors">
                {serviceIcons[service.TEN_DV] || '🐾'}
              </div>
            </div>

            {/* Info */}
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-800 mb-1">{service.TEN_DV}</h3>
              <p className="text-sm text-gray-500 mb-4 min-h-[40px]">{service.MO_TA}</p>

              {/* Price */}
              <div className="bg-gradient-to-r from-primary-50 to-amber-50 rounded-xl p-4 mb-3">
                <p className="text-2xl font-bold text-primary-600">{formatCurrency(service.GIA)}</p>
                <p className="text-xs text-gray-500">{unitLabels[service.DON_VI] || service.DON_VI}</p>
              </div>

              {/* Status toggle */}
              <button
                onClick={() => handleToggleStatus(service)}
                className="flex items-center justify-center gap-2 w-full py-1.5 rounded-lg transition-colors hover:bg-gray-50"
              >
                <span className={`w-2 h-2 rounded-full ${service.TRANG_THAI === 'HOAT_DONG' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className="text-sm text-gray-500">
                  {service.TRANG_THAI === 'HOAT_DONG' ? 'Đang hoạt động' : 'Ngưng cung cấp'}
                </span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div className="text-center py-12">
          <MdPets className="text-gray-300 text-6xl mx-auto mb-3" />
          <p className="text-gray-400">Không tìm thấy dịch vụ nào</p>
        </div>
      )}

      {/* Summary */}
      <div className="card bg-gradient-to-r from-amber-50 to-orange-50">
        <div className="flex flex-wrap items-center justify-center gap-8">
          <div className="text-center">
            <p className="text-3xl font-bold text-primary-600">{services.length}</p>
            <p className="text-sm text-gray-500">Tổng dịch vụ</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">
              {services.filter(s => s.TRANG_THAI === 'HOAT_DONG').length}
            </p>
            <p className="text-sm text-gray-500">Đang hoạt động</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-600">
              {services.length > 0 ? formatCurrency(Math.min(...services.map(s => s.GIA))) : '0'}
            </p>
            <p className="text-sm text-gray-500">Giá thấp nhất</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-600">
              {services.length > 0 ? formatCurrency(Math.max(...services.map(s => s.GIA))) : '0'}
            </p>
            <p className="text-sm text-gray-500">Giá cao nhất</p>
          </div>
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg m-4">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">
                {editingService ? 'Chỉnh sửa dịch vụ' : 'Thêm dịch vụ mới'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Tên dịch vụ *</label>
                <input
                  type="text"
                  value={form.tenDv}
                  onChange={(e) => setForm({ ...form, tenDv: e.target.value })}
                  className="input-field"
                  placeholder="VD: Tắm spa, Cắt tỉa lông..."
                  required
                />
              </div>

              <div>
                <label className="label">Mô tả</label>
                <textarea
                  value={form.moTa}
                  onChange={(e) => setForm({ ...form, moTa: e.target.value })}
                  className="input-field"
                  rows={3}
                  placeholder="Mô tả chi tiết dịch vụ..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Giá (VND) *</label>
                  <input
                    type="number"
                    value={form.gia}
                    onChange={(e) => setForm({ ...form, gia: e.target.value })}
                    className="input-field"
                    placeholder="150000"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="label">Đơn vị</label>
                  <select
                    value={form.donVi}
                    onChange={(e) => setForm({ ...form, donVi: e.target.value })}
                    className="select-field"
                  >
                    {unitOptions.map(u => (
                      <option key={u.value} value={u.value}>{u.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {editingService && (
                <div>
                  <label className="label">Trạng thái</label>
                  <select
                    value={form.trangThai}
                    onChange={(e) => setForm({ ...form, trangThai: e.target.value })}
                    className="select-field"
                  >
                    <option value="HOAT_DONG">Hoạt động</option>
                    <option value="NGUNG">Ngưng</option>
                  </select>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1">
                  {editingService ? 'Cập nhật' : 'Thêm dịch vụ'}
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
