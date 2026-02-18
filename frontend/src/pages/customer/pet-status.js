import { useState, useEffect } from 'react';
import {
  getAllBookings, getPetUpdatesByBooking, getPetTypeLabel,
  getStatusLabel, getStatusColor, formatCurrency
} from '@/services/api';
import {
  FiCalendar, FiCamera, FiActivity, FiUser, FiImage,
  FiChevronDown, FiChevronUp, FiAlertCircle, FiArrowLeft
} from 'react-icons/fi';
import { MdPets } from 'react-icons/md';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function PetStatus() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState(null);
  const [activeBookings, setActiveBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [updates, setUpdates] = useState({});
  const [expandedBooking, setExpandedBooking] = useState(null);
  const [viewMode, setViewMode] = useState('active'); // 'active' or 'all'

  useEffect(() => {
    const savedCustomer = localStorage.getItem('pethub_customer');
    if (!savedCustomer) {
      toast.error('Vui lòng đăng nhập để theo dõi thú cưng');
      router.push('/customer/account');
      return;
    }
    try {
      const parsed = JSON.parse(savedCustomer);
      setCustomer(parsed);
      loadData(parsed);
    } catch {
      router.push('/customer/account');
    }
  }, []);

  async function loadData(cust) {
    try {
      const bookings = await getAllBookings();
      const customerBookings = bookings.filter(b => b.TEN_CHU === cust.HO_TEN);
      const active = customerBookings.filter(b => b.TRANG_THAI === 'NHAN_PHONG');
      
      setActiveBookings(active);
      setAllBookings(customerBookings);

      // Load updates for all customer bookings
      const updatesMap = {};
      for (const b of customerBookings) {
        const bu = await getPetUpdatesByBooking(b.MA_DAT_PHONG);
        if (bu.length > 0) {
          updatesMap[b.MA_DAT_PHONG] = bu.sort((a, b) => b.NGAY.localeCompare(a.NGAY));
        }
      }
      setUpdates(updatesMap);

      // Auto-expand first active booking
      if (active.length > 0) {
        setExpandedBooking(active[0].MA_DAT_PHONG);
      }
    } catch (err) {
      toast.error('Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }

  function getTinhTrangColor(status) {
    const map = {
      'Tot': 'bg-green-100 text-green-700 border-green-200',
      'Binh thuong': 'bg-blue-100 text-blue-700 border-blue-200',
      'Can theo doi': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'Benh': 'bg-red-100 text-red-700 border-red-200'
    };
    return map[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  }

  function getTinhTrangIcon(status) {
    const map = { 'Tot': '😊', 'Binh thuong': '😐', 'Can theo doi': '⚠️', 'Benh': '🏥' };
    return map[status] || '📋';
  }

  function getTinhTrangLabel(status) {
    const map = { 'Tot': 'Tốt', 'Binh thuong': 'Bình thường', 'Can theo doi': 'Cần theo dõi', 'Benh': 'Bệnh' };
    return map[status] || status;
  }

  const displayBookings = viewMode === 'active' ? activeBookings : allBookings;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-500">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Header */}
      <section className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-12">
        <div className="max-w-5xl mx-auto px-4">
          <Link href="/customer/account" className="inline-flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700 mb-4">
            <FiArrowLeft size={14} /> Quay lại tài khoản
          </Link>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
              <MdPets className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Theo dõi bé yêu</h1>
              <p className="text-gray-600 mt-0.5">Xem tình trạng và hình ảnh thú cưng đang ở PetHub</p>
            </div>
          </div>
        </div>
      </section>

      {/* Filter */}
      <section className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex gap-1 py-3">
            <button
              onClick={() => setViewMode('active')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === 'active'
                  ? 'bg-amber-100 text-amber-700'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              Đang ở ({activeBookings.length})
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === 'all'
                  ? 'bg-amber-100 text-amber-700'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              Tất cả ({allBookings.length})
            </button>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-8">
        <div className="max-w-5xl mx-auto px-4">
          {displayBookings.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MdPets className="text-gray-300 text-4xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                {viewMode === 'active' ? 'Không có thú cưng nào đang ở' : 'Chưa có lần đặt phòng nào'}
              </h3>
              <p className="text-gray-500 mb-6">
                {viewMode === 'active'
                  ? 'Khi bé yêu nhận phòng tại PetHub, bạn sẽ thấy cập nhật hàng ngày tại đây.'
                  : 'Hãy đặt phòng cho bé yêu để bắt đầu trải nghiệm dịch vụ của PetHub.'}
              </p>
              <Link
                href="/customer/booking"
                className="inline-flex bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all"
              >
                Đặt phòng ngay
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {displayBookings.map(booking => {
                const bookingUpdates = updates[booking.MA_DAT_PHONG] || [];
                const isExpanded = expandedBooking === booking.MA_DAT_PHONG;
                const latestUpdate = bookingUpdates[0];
                const isActive = booking.TRANG_THAI === 'NHAN_PHONG';

                return (
                  <div key={booking.MA_DAT_PHONG} className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${
                    isActive ? 'border-amber-200' : 'border-gray-100'
                  }`}>
                    {/* Booking Card Header */}
                    <div
                      className="p-6 cursor-pointer hover:bg-gray-50/50 transition-colors"
                      onClick={() => setExpandedBooking(isExpanded ? null : booking.MA_DAT_PHONG)}
                    >
                      <div className="flex items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl ${
                            isActive ? 'bg-amber-50' : 'bg-gray-50'
                          }`}>
                            {getPetTypeLabel(booking.LOAI_THU_CUNG).split(' ')[0]}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-bold text-gray-800">{booking.TEN_TC}</h3>
                              <span className={getStatusColor(booking.TRANG_THAI)}>
                                {getStatusLabel(booking.TRANG_THAI)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-0.5">
                              {booking.TEN_PHONG} • {booking.LOAI_PHONG}
                            </p>
                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                              <FiCalendar size={11} />
                              {booking.NGAY_NHAN} → {booking.NGAY_TRA} ({booking.SO_NGAY} ngày)
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {/* Latest status badge */}
                          {latestUpdate && (
                            <div className={`hidden sm:flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border ${getTinhTrangColor(latestUpdate.TINH_TRANG)}`}>
                              <span>{getTinhTrangIcon(latestUpdate.TINH_TRANG)}</span>
                              <span className="font-medium">{getTinhTrangLabel(latestUpdate.TINH_TRANG)}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-gray-400">
                            <FiCamera size={14} />
                            <span className="text-xs">{bookingUpdates.length}</span>
                          </div>
                          {isExpanded ? <FiChevronUp className="text-gray-400" /> : <FiChevronDown className="text-gray-400" />}
                        </div>
                      </div>
                    </div>

                    {/* Expanded: Daily Updates Timeline */}
                    {isExpanded && (
                      <div className="border-t border-gray-100">
                        {bookingUpdates.length === 0 ? (
                          <div className="p-8 text-center text-gray-400">
                            <FiCamera className="text-4xl mx-auto mb-2" />
                            <p className="font-medium">Chưa có cập nhật nào</p>
                            <p className="text-sm mt-1">Nhân viên sẽ cập nhật tình trạng bé yêu hàng ngày</p>
                          </div>
                        ) : (
                          <div className="p-6">
                            <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                              <FiActivity size={14} className="text-amber-500" /> Nhật ký chăm sóc
                            </h4>
                            <div className="space-y-5">
                              {bookingUpdates.map((update, idx) => (
                                <div key={update.MA_CAP_NHAT} className="relative pl-10">
                                  {/* Timeline */}
                                  {idx < bookingUpdates.length - 1 && (
                                    <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gradient-to-b from-amber-200 to-transparent" />
                                  )}
                                  <div className="absolute left-0 top-0 w-8 h-8 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center text-base shadow-sm border border-amber-200">
                                    {getTinhTrangIcon(update.TINH_TRANG)}
                                  </div>

                                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-100">
                                    {/* Date & Status & Staff */}
                                    <div className="flex flex-wrap items-center gap-2 mb-3">
                                      <span className="font-bold text-gray-800 flex items-center gap-1.5">
                                        <FiCalendar className="text-amber-500" size={14} />
                                        {update.NGAY}
                                      </span>
                                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${getTinhTrangColor(update.TINH_TRANG)}`}>
                                        {getTinhTrangLabel(update.TINH_TRANG)}
                                      </span>
                                      <span className="text-xs text-gray-400 flex items-center gap-1 ml-auto">
                                        <FiUser size={11} /> {update.TEN_NV}
                                      </span>
                                    </div>

                                    {/* Notes */}
                                    <p className="text-sm text-gray-700 leading-relaxed mb-3">{update.GHI_CHU}</p>

                                    {/* Activities */}
                                    {update.HOAT_DONG && (
                                      <div className="flex items-start gap-2 text-xs text-gray-500 mb-4 bg-white rounded-lg p-3 border border-gray-100">
                                        <FiActivity size={13} className="text-amber-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                          <span className="font-medium text-gray-600 block mb-1">Hoạt động:</span>
                                          <span>{update.HOAT_DONG}</span>
                                        </div>
                                      </div>
                                    )}

                                    {/* Photos */}
                                    {update.HINH_ANH && update.HINH_ANH.length > 0 && (
                                      <div>
                                        <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                                          <FiImage size={12} /> Hình ảnh ({update.HINH_ANH.length})
                                        </p>
                                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                          {update.HINH_ANH.map((img, i) => (
                                            <img
                                              key={i}
                                              src={img.startsWith('http') ? img : `http://localhost:5000${img}`}
                                              alt={`${update.TEN_TC} - Ảnh ${i + 1}`}
                                              className="aspect-square object-cover rounded-xl border border-amber-200 hover:shadow-md transition-shadow cursor-pointer"
                                              onClick={() => window.open(img.startsWith('http') ? img : `http://localhost:5000${img}`, '_blank')}
                                            />
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Info Note */}
      {activeBookings.length > 0 && (
        <section className="pb-12">
          <div className="max-w-5xl mx-auto px-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <FiAlertCircle className="text-amber-500 flex-shrink-0 mt-0.5" size={18} />
              <div className="text-sm text-amber-700">
                <p className="font-medium mb-1">Cập nhật hàng ngày</p>
                <p className="text-amber-600">
                  Nhân viên PetHub sẽ cập nhật tình trạng sức khỏe và hình ảnh bé yêu hàng ngày.
                  Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ hotline: <strong>0901 234 567</strong>
                </p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
