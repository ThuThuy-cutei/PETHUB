import { useState, useEffect } from 'react';
import {
  getAllCustomers, getAllPets, createCustomer,
  formatCurrency, getPetTypeLabel
} from '@/services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiSearch, FiUser, FiX, FiPhone, FiMail, FiMapPin } from 'react-icons/fi';
import { MdPets } from 'react-icons/md';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [expandedCustomer, setExpandedCustomer] = useState(null);

  const [form, setForm] = useState({
    hoTen: '', email: '', soDienThoai: '', diaChi: '', ghiChu: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [custs, allPets] = await Promise.all([getAllCustomers(), getAllPets()]);
      setCustomers(custs);
      setPets(allPets);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await createCustomer(form);
      toast.success('Thêm khách hàng thành công!');
      setShowForm(false);
      setForm({ hoTen: '', email: '', soDienThoai: '', diaChi: '', ghiChu: '' });
      loadData();
    } catch (err) {
      toast.error(err.message || 'Lỗi thêm khách hàng');
    }
  }

  function getCustomerPets(maKh) {
    return pets.filter(p => p.MA_KH === maKh);
  }

  const filteredCustomers = customers.filter(c =>
    !search ||
    c.HO_TEN?.toLowerCase().includes(search.toLowerCase()) ||
    c.SO_DIEN_THOAI?.includes(search) ||
    c.EMAIL?.toLowerCase().includes(search.toLowerCase())
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
          <h1 className="text-2xl font-bold text-gray-800">Khách Hàng</h1>
          <p className="text-gray-500 mt-1">{customers.length} khách hàng | {pets.length} thú cưng</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <FiPlus /> Thêm khách hàng
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Tìm theo tên, SĐT, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* Customer Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredCustomers.map((customer) => {
          const custPets = getCustomerPets(customer.MA_KH);
          const isExpanded = expandedCustomer === customer.MA_KH;

          return (
            <div key={customer.MA_KH} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FiUser className="text-primary-600 text-xl" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-800">{customer.HO_TEN}</h3>
                    <span className="text-xs text-gray-400">#{customer.MA_KH}</span>
                  </div>

                  <div className="mt-2 space-y-1 text-sm text-gray-600">
                    <p className="flex items-center gap-2">
                      <FiPhone className="text-gray-400" /> {customer.SO_DIEN_THOAI}
                    </p>
                    {customer.EMAIL && (
                      <p className="flex items-center gap-2">
                        <FiMail className="text-gray-400" /> {customer.EMAIL}
                      </p>
                    )}
                    {customer.DIA_CHI && (
                      <p className="flex items-center gap-2">
                        <FiMapPin className="text-gray-400" /> {customer.DIA_CHI}
                      </p>
                    )}
                  </div>

                  {/* Pets summary */}
                  <div className="mt-3">
                    <button
                      onClick={() => setExpandedCustomer(isExpanded ? null : customer.MA_KH)}
                      className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700"
                    >
                      <MdPets />
                      {custPets.length} thú cưng
                      <span className="text-xs">{isExpanded ? '▲' : '▼'}</span>
                    </button>

                    {isExpanded && custPets.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {custPets.map((pet) => (
                          <div key={pet.MA_TC} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg text-sm">
                            <span className="text-lg">{getPetTypeLabel(pet.LOAI).split(' ')[0]}</span>
                            <div>
                              <p className="font-medium">{pet.TEN_TC}</p>
                              <p className="text-xs text-gray-400">
                                {pet.GIONG} | {pet.TUOI} tuổi | {pet.CAN_NANG}kg |{' '}
                                {pet.GIOI_TINH === 'DUC' ? '♂' : '♀'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <FiUser className="text-gray-300 text-6xl mx-auto mb-3" />
          <p className="text-gray-400">Không tìm thấy khách hàng</p>
        </div>
      )}

      {/* Add Customer Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md m-4">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">Thêm khách hàng</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Họ tên *</label>
                <input
                  type="text" required
                  value={form.hoTen}
                  onChange={(e) => setForm({ ...form, hoTen: e.target.value })}
                  className="input-field"
                  placeholder="Nguyễn Văn A"
                />
              </div>
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="label">Số điện thoại *</label>
                <input
                  type="text" required
                  value={form.soDienThoai}
                  onChange={(e) => setForm({ ...form, soDienThoai: e.target.value })}
                  className="input-field"
                  placeholder="0901234567"
                />
              </div>
              <div>
                <label className="label">Địa chỉ</label>
                <input
                  type="text"
                  value={form.diaChi}
                  onChange={(e) => setForm({ ...form, diaChi: e.target.value })}
                  className="input-field"
                  placeholder="123 Đường ABC, Quận 1, TP.HCM"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1">Thêm</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
