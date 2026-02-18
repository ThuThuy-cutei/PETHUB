import { useState, useEffect } from 'react';
import {
  getDashboardStats, getRecentBookings, formatCurrency,
  getStatusLabel, getStatusColor, getPetTypeLabel
} from '@/services/api';
import {
  FiHome, FiCheckCircle, FiAlertCircle, FiTool,
  FiDollarSign, FiTrendingUp
} from 'react-icons/fi';
import { MdPets } from 'react-icons/md';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, bookingsData] = await Promise.all([
          getDashboardStats(),
          getRecentBookings(),
        ]);
        setStats(statsData);
        setRecentBookings(bookingsData);
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!stats) return <p className="text-center text-gray-500">Không có dữ liệu</p>;

  const roomCards = [
    { label: 'Tổng phòng', value: stats.phong.tongPhong, icon: FiHome, color: 'bg-blue-500' },
    { label: 'Phòng trống', value: stats.phong.phongTrong, icon: FiCheckCircle, color: 'bg-green-500' },
    { label: 'Đang sử dụng', value: stats.phong.phongDaDat + stats.phong.phongDangDung, icon: FiAlertCircle, color: 'bg-yellow-500' },
    { label: 'Bảo trì', value: stats.phong.phongBaoTri, icon: FiTool, color: 'bg-red-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 mt-1">Tổng quan quản lý khách sạn thú cưng</p>
      </div>

      {/* Room Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {roomCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="card flex items-center gap-4">
              <div className={`${card.color} w-12 h-12 rounded-xl flex items-center justify-center text-white`}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-2xl font-bold text-gray-800">{card.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Occupancy Rate & Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Occupancy */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FiTrendingUp className="text-primary-500" />
            Mật độ lưu trú
          </h3>
          <div className="flex items-center gap-6">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#e5e7eb" strokeWidth="12" />
                <circle
                  cx="60" cy="60" r="50" fill="none" stroke="#f59e0b" strokeWidth="12"
                  strokeDasharray={`${stats.phong.tiLeSuDung * 3.14} ${314 - stats.phong.tiLeSuDung * 3.14}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-800">{stats.phong.tiLeSuDung}%</span>
              </div>
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Phòng trống</span>
                <span className="font-medium text-green-600">{stats.phong.phongTrong}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Đã đặt</span>
                <span className="font-medium text-blue-600">{stats.phong.phongDaDat}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Đang sử dụng</span>
                <span className="font-medium text-yellow-600">{stats.phong.phongDangDung}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Bảo trì</span>
                <span className="font-medium text-red-600">{stats.phong.phongBaoTri}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FiDollarSign className="text-green-500" />
            Doanh thu
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">Đã thu</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(stats.doanhThu.DOANH_THU)}</p>
              </div>
              <FiCheckCircle className="text-green-500 text-2xl" />
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">Chưa thu</p>
                <p className="text-xl font-bold text-yellow-600">{formatCurrency(stats.doanhThu.CHUA_THU)}</p>
              </div>
              <FiAlertCircle className="text-yellow-500 text-2xl" />
            </div>
            <div className="text-center text-sm text-gray-500">
              Tổng: {stats.doanhThu.TONG_HD} hóa đơn
            </div>
          </div>
        </div>
      </div>

      {/* Pet Stats & Recent Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pets by type */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <MdPets className="text-primary-500" />
            Thú cưng theo loại
          </h3>
          <div className="space-y-3">
            {stats.thuCung.map((pet, i) => (
              <div key={i} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                <span className="text-sm">{getPetTypeLabel(pet.LOAI)}</span>
                <span className="badge-blue">{pet.SO_LUONG}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="card lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Đặt phòng gần đây</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 text-gray-500 font-medium">Thú cưng</th>
                  <th className="text-left py-2 px-3 text-gray-500 font-medium">Chủ</th>
                  <th className="text-left py-2 px-3 text-gray-500 font-medium">Phòng</th>
                  <th className="text-left py-2 px-3 text-gray-500 font-medium">Ngày</th>
                  <th className="text-left py-2 px-3 text-gray-500 font-medium">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((booking) => (
                  <tr key={booking.MA_DAT_PHONG} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2.5 px-3 font-medium">{booking.TEN_TC}</td>
                    <td className="py-2.5 px-3 text-gray-600">{booking.TEN_CHU}</td>
                    <td className="py-2.5 px-3">{booking.TEN_PHONG}</td>
                    <td className="py-2.5 px-3 text-gray-500">
                      {booking.NGAY_NHAN} → {booking.NGAY_TRA}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={getStatusColor(booking.TRANG_THAI)}>
                        {getStatusLabel(booking.TRANG_THAI)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
