import { useState, useEffect } from 'react';
import {
  customerLogin, customerRegister, getPetsByCustomer, getBookingsByCustomer, getBillsByCustomer,
  formatCurrency, getStatusLabel, getStatusColor, getPetTypeLabel
} from '@/services/api';
import {
  FiCalendar, FiFileText, FiChevronDown, FiChevronUp,
  FiPhone, FiMail, FiUser, FiLock, FiEye, FiEyeOff,
  FiMapPin, FiLogOut, FiUserPlus
} from 'react-icons/fi';
import { MdPets } from 'react-icons/md';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';

export default function CustomerAccount() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('bookings');
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [customer, setCustomer] = useState(null);
  const [pets, setPets] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [bills, setBills] = useState([]);
  const [expandedBooking, setExpandedBooking] = useState(null);

  // Auth form state
  const [authMode, setAuthMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', matKhau: '' });
  const [registerForm, setRegisterForm] = useState({
    hoTen: '', email: '', soDienThoai: '', diaChi: '', matKhau: '', xacNhanMatKhau: ''
  });

  // Check localStorage on mount
  useEffect(() => {
    const savedCustomer = localStorage.getItem('pethub_customer');
    if (savedCustomer) {
      try {
        const parsed = JSON.parse(savedCustomer);
        setCustomer(parsed);
        setLoggedIn(true);
        loadCustomerData(parsed);
      } catch {}
    }
  }, []);

  async function loadCustomerData(cust) {
    try {
      const [custPets, custBookings, custBills] = await Promise.all([
        getPetsByCustomer(cust.MA_KH),
        getBookingsByCustomer(cust.MA_KH),
        getBillsByCustomer(cust.MA_KH),
      ]);
      setPets(custPets);
      setBookings(custBookings);
      setBills(custBills);
    } catch (err) {
      toast.error('Lỗi tải dữ liệu');
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    if (!loginForm.email.trim() || !loginForm.matKhau.trim()) {
      toast.error('Vui lòng nhập email và mật khẩu');
      return;
    }
    setLoading(true);
    try {
      const result = await customerLogin(loginForm.email.trim(), loginForm.matKhau.trim());
      if (!result.success) {
        toast.error(result.message || 'Đăng nhập thất bại');
        setLoading(false);
        return;
      }
      setCustomer(result.customer);
      localStorage.setItem('pethub_customer', JSON.stringify(result.customer));
      localStorage.setItem('pethub_token', result.token);
      setLoggedIn(true);
      await loadCustomerData(result.customer);
      toast.success(`Xin chào, ${result.customer.HO_TEN}!`);
    } catch (err) {
      toast.error('Lỗi đăng nhập');
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    const { hoTen, email, soDienThoai, diaChi, matKhau, xacNhanMatKhau } = registerForm;
    if (!hoTen || !email || !soDienThoai || !matKhau) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }
    if (matKhau.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    if (matKhau !== xacNhanMatKhau) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }
    setLoading(true);
    try {
      const result = await customerRegister({ hoTen, email, soDienThoai, diaChi, matKhau });
      if (!result.success) {
        toast.error(result.message || 'Đăng ký thất bại');
        setLoading(false);
        return;
      }
      setCustomer(result.customer);
      localStorage.setItem('pethub_customer', JSON.stringify(result.customer));
      localStorage.setItem('pethub_token', result.token);
      setLoggedIn(true);
      await loadCustomerData(result.customer);
      toast.success('Đăng ký thành công! Chào mừng bạn đến PetHub!');
    } catch (err) {
      toast.error('Lỗi đăng ký');
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    setLoggedIn(false);
    setCustomer(null);
    setLoginForm({ email: '', matKhau: '' });
    setRegisterForm({ hoTen: '', email: '', soDienThoai: '', diaChi: '', matKhau: '', xacNhanMatKhau: '' });
    setPets([]);
    setBookings([]);
    setBills([]);
    localStorage.removeItem('pethub_customer');
    localStorage.removeItem('pethub_token');
    toast.success('Đã đăng xuất');
  }

  // =================== AUTH FORMS ===================
  if (!loggedIn) {
    return (
      <div>
        <section className="bg-gradient-to-br from-amber-50 to-orange-50 min-h-[80vh] py-16">
          <div className="max-w-md mx-auto px-4">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <MdPets className="text-white text-2xl" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                {authMode === 'login' ? 'Đăng nhập' : 'Đăng ký tài khoản'}
              </h1>
              <p className="text-gray-600 mt-2">
                {authMode === 'login'
                  ? 'Đăng nhập để xem lịch sử và theo dõi thú cưng'
                  : 'Tạo tài khoản để sử dụng dịch vụ PetHub'}
              </p>
            </div>

            {/* Tab switch */}
            <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  authMode === 'login'
                    ? 'bg-white text-amber-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <FiUser className="inline mr-1" /> Đăng nhập
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('register')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  authMode === 'register'
                    ? 'bg-white text-amber-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <FiUserPlus className="inline mr-1" /> Đăng ký
              </button>
            </div>

            {/* Login Form */}
            {authMode === 'login' && (
              <form onSubmit={handleLogin} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                    <div className="relative">
                      <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                        placeholder="you@email.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Mật khẩu</label>
                    <div className="relative">
                      <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={loginForm.matKhau}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, matKhau: e.target.value }))}
                        className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                        placeholder="••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold py-3 rounded-full shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </button>

                <div className="mt-6 text-center">
                  <p className="text-xs text-gray-400">Tài khoản mẫu để thử:</p>
                  <div className="flex flex-wrap justify-center gap-2 mt-2">
                    {[
                      { email: 'duc.hm@gmail.com', label: 'Hoang Minh Duc' },
                      { email: 'eu.vt@gmail.com', label: 'Vo Thi Eu' },
                      { email: 'phong.bv@gmail.com', label: 'Bui Van Phong' }
                    ].map(acc => (
                      <button
                        key={acc.email}
                        type="button"
                        onClick={() => setLoginForm({ email: acc.email, matKhau: '123456' })}
                        className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full hover:bg-amber-100 hover:text-amber-700 transition-colors"
                      >
                        {acc.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-300 mt-1">Mật khẩu: 123456</p>
                </div>
              </form>
            )}

            {/* Register Form */}
            {authMode === 'register' && (
              <form onSubmit={handleRegister} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Họ và tên <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={registerForm.hoTen}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, hoTen: e.target.value }))}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                        placeholder="Nguyen Van A"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                        placeholder="you@email.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Số điện thoại <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        value={registerForm.soDienThoai}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, soDienThoai: e.target.value }))}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                        placeholder="0901234567"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Địa chỉ</label>
                    <div className="relative">
                      <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={registerForm.diaChi}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, diaChi: e.target.value }))}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                        placeholder="Địa chỉ (tùy chọn)"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Mật khẩu <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={registerForm.matKhau}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, matKhau: e.target.value }))}
                        className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                        placeholder="Ít nhất 6 ký tự"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Xác nhận mật khẩu <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={registerForm.xacNhanMatKhau}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, xacNhanMatKhau: e.target.value }))}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                        placeholder="Nhập lại mật khẩu"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold py-3 rounded-full shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? 'Đang xử lý...' : 'Đăng ký'}
                </button>
              </form>
            )}
          </div>
        </section>
      </div>
    );
  }

  // =================== ACCOUNT DASHBOARD ===================
  return (
    <div>
      {/* Header */}
      <section className="bg-gradient-to-br from-amber-50 to-orange-50 py-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-md">
                <span className="text-white text-2xl font-bold">{customer?.HO_TEN?.[0]}</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{customer?.HO_TEN}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                  <span className="flex items-center gap-1"><FiPhone size={12} /> {customer?.SO_DIEN_THOAI}</span>
                  {customer?.EMAIL && <span className="flex items-center gap-1"><FiMail size={12} /> {customer?.EMAIL}</span>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/customer/pet-status')}
                className="text-sm bg-amber-100 text-amber-700 hover:bg-amber-200 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-1"
              >
                <MdPets size={16} /> Theo dõi bé yêu
              </button>
              <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-500 transition-colors flex items-center gap-1">
                <FiLogOut size={14} /> Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-6 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white rounded-xl border border-gray-100">
              <p className="text-2xl font-bold text-amber-600">{pets.length}</p>
              <p className="text-xs text-gray-500 mt-1">Thú cưng</p>
            </div>
            <div className="text-center p-4 bg-white rounded-xl border border-gray-100">
              <p className="text-2xl font-bold text-blue-600">{bookings.length}</p>
              <p className="text-xs text-gray-500 mt-1">Lần đặt phòng</p>
            </div>
            <div className="text-center p-4 bg-white rounded-xl border border-gray-100">
              <p className="text-2xl font-bold text-green-600">{bills.length}</p>
              <p className="text-xs text-gray-500 mt-1">Hóa đơn</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-2 border-b border-gray-200 mb-8">
            {[
              { id: 'pets', label: 'Thú cưng', icon: MdPets },
              { id: 'bookings', label: 'Đặt phòng', icon: FiCalendar },
              { id: 'bills', label: 'Hóa đơn', icon: FiFileText },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
                    activeTab === tab.id
                      ? 'border-amber-500 text-amber-700'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon /> {tab.label}
                </button>
              );
            })}
          </div>

          {/* Pets Tab */}
          {activeTab === 'pets' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pets.map(pet => (
                <div key={pet.MA_TC} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-amber-50 rounded-xl flex items-center justify-center text-3xl">
                      {getPetTypeLabel(pet.LOAI).split(' ')[0]}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{pet.TEN_TC}</h3>
                      <p className="text-sm text-gray-500">{pet.GIONG}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Loài</span><span className="font-medium">{getPetTypeLabel(pet.LOAI)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Tuổi</span><span className="font-medium">{pet.TUOI} tuổi</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Cân nặng</span><span className="font-medium">{pet.CAN_NANG} kg</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Giới tính</span><span className="font-medium">{pet.GIOI_TINH === 'DUC' ? '♂ Đực' : '♀ Cái'}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Sức khỏe</span><span className="font-medium text-green-600">{pet.TINH_TRANG_SK}</span></div>
                  </div>
                </div>
              ))}
              {pets.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-400">
                  <MdPets className="text-5xl mx-auto mb-2" />
                  <p>Chưa có thú cưng nào</p>
                </div>
              )}
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <div className="space-y-4">
              {bookings.map(b => (
                <div key={b.MA_DAT_PHONG} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                  <div
                    className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedBooking(expandedBooking === b.MA_DAT_PHONG ? null : b.MA_DAT_PHONG)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                          <FiCalendar className="text-blue-500 text-xl" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800">
                            {b.TEN_TC} • {b.TEN_PHONG}
                          </h3>
                          <p className="text-sm text-gray-500">{b.NGAY_NHAN} → {b.NGAY_TRA} ({b.SO_NGAY} ngày)</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={getStatusColor(b.TRANG_THAI)}>
                          {getStatusLabel(b.TRANG_THAI)}
                        </span>
                        {expandedBooking === b.MA_DAT_PHONG ? <FiChevronUp /> : <FiChevronDown />}
                      </div>
                    </div>
                  </div>
                  {expandedBooking === b.MA_DAT_PHONG && (
                    <div className="px-6 pb-6 border-t border-gray-100 pt-4">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                        <div><span className="text-gray-500 block">Loại phòng</span><span className="font-medium">{b.LOAI_PHONG}</span></div>
                        <div><span className="text-gray-500 block">Giá/ngày</span><span className="font-medium">{formatCurrency(b.GIA_MOI_NGAY)}</span></div>
                        <div><span className="text-gray-500 block">Tổng phòng</span><span className="font-medium text-amber-600">{formatCurrency(b.GIA_MOI_NGAY * b.SO_NGAY)}</span></div>
                        <div><span className="text-gray-500 block">Nhân viên</span><span className="font-medium">{b.TEN_NV || '-'}</span></div>
                      </div>
                      {b.GHI_CHU && (
                        <div className="mt-3 p-3 bg-yellow-50 rounded-lg text-sm text-yellow-700">
                          <strong>Ghi chú:</strong> {b.GHI_CHU}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {bookings.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <FiCalendar className="text-5xl mx-auto mb-2" />
                  <p>Chưa có lần đặt phòng nào</p>
                </div>
              )}
            </div>
          )}

          {/* Bills Tab */}
          {activeTab === 'bills' && (
            <div className="space-y-4">
              {bills.map(bill => (
                <div key={bill.MA_HD} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                        <FiFileText className="text-green-500 text-xl" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">Hóa đơn #{bill.MA_HD}</h3>
                        <p className="text-sm text-gray-500">{bill.TEN_TC} • {bill.TEN_PHONG}</p>
                      </div>
                    </div>
                    <span className={getStatusColor(bill.TRANG_THAI)}>
                      {getStatusLabel(bill.TRANG_THAI)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-4">
                    <div><span className="text-gray-500 block">Tiền phòng</span><span className="font-medium">{formatCurrency(bill.TIEN_PHONG)}</span></div>
                    <div><span className="text-gray-500 block">Tiền DV</span><span className="font-medium">{formatCurrency(bill.TIEN_DICH_VU)}</span></div>
                    <div><span className="text-gray-500 block">Giảm giá</span><span className="font-medium text-red-500">{bill.GIAM_GIA}%</span></div>
                    <div><span className="text-gray-500 block">Tổng cộng</span><span className="font-bold text-amber-600 text-lg">{formatCurrency(bill.TONG_TIEN)}</span></div>
                  </div>
                  <div className="text-xs text-gray-400">
                    Lưu trú: {bill.NGAY_NHAN} → {bill.NGAY_TRA}
                    {bill.NGAY_THANH_TOAN && <span> • Thanh toán: {bill.NGAY_THANH_TOAN}</span>}
                  </div>
                </div>
              ))}
              {bills.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <FiFileText className="text-5xl mx-auto mb-2" />
                  <p>Chưa có hóa đơn nào</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
