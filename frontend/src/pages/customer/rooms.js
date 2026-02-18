import { useState, useEffect } from 'react';
import { getAllRooms, getRoomTypes, formatCurrency, getPetTypeLabel } from '@/services/api';
import { FiCheckCircle, FiWifi, FiMonitor, FiDroplet, FiWind } from 'react-icons/fi';
import { MdPets } from 'react-icons/md';
import Link from 'next/link';

const petEmojis = { CHO: '🐕', MEO: '🐈', TAT_CA: '🐾', CHIM: '🐦', HAMSTER: '🐹', THO: '🐰' };

const roomFeatures = {
  'Phong Standard Cho': ['Điều hòa nhiệt độ', 'Nước uống tự động', 'Khăn trải sạch', 'Giám sát camera'],
  'Phong VIP Cho': ['Sân chơi riêng', 'Camera giám sát', 'Đồ chơi cao cấp', 'Không gian rộng rãi', 'Khăn lông premium'],
  'Phong Standard Meo': ['Cát vệ sinh', 'Cây cào', 'Đồ chơi', 'Giám sát camera'],
  'Phong VIP Meo': ['Ban công riêng', 'Cây cào lớn', 'Đồ chơi cao cấp', 'Giám sát camera', 'View đẹp'],
  'Phong Thu nho': ['Lồng sạch sẽ', 'Đồ chơi phù hợp', 'Nhiệt độ phù hợp', 'Ánh sáng tự nhiên'],
};

export default function CustomerRooms() {
  const [roomTypes, setRoomTypes] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterPet, setFilterPet] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [types, allRooms] = await Promise.all([getRoomTypes(), getAllRooms()]);
        setRoomTypes(types);
        setRooms(allRooms);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredTypes = roomTypes.filter(rt => !filterPet || rt.LOAI_THU_CUNG === filterPet);

  // Count available rooms per type
  function countAvailable(maLoaiPhong) {
    return rooms.filter(r => r.MA_LOAI_PHONG === maLoaiPhong && r.TRANG_THAI === 'TRONG').length;
  }
  function countTotal(maLoaiPhong) {
    return rooms.filter(r => r.MA_LOAI_PHONG === maLoaiPhong).length;
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-amber-50 to-orange-50 py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-amber-600 font-semibold text-sm uppercase tracking-wider mb-2">Phòng & Giá</p>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Phòng lưu trú cho thú cưng
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Đa dạng loại phòng từ Standard đến VIP, phù hợp với mọi loài thú cưng.
            Tất cả đều sạch sẽ, an toàn và được giám sát 24/7.
          </p>
        </div>
      </section>

      {/* Filter by Pet Type */}
      <section className="py-8 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setFilterPet('')}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                !filterPet ? 'bg-amber-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              🐾 Tất cả
            </button>
            {[
              { value: 'CHO', label: '🐕 Chó' },
              { value: 'MEO', label: '🐈 Mèo' },
              { value: 'TAT_CA', label: '🐾 Thú nhỏ' },
            ].map((pet) => (
              <button
                key={pet.value}
                onClick={() => setFilterPet(pet.value)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                  filterPet === pet.value ? 'bg-amber-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {pet.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Room Types */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
            </div>
          ) : (
            <div className="space-y-8">
              {filteredTypes.map((rt) => {
                const available = countAvailable(rt.MA_LOAI_PHONG);
                const total = countTotal(rt.MA_LOAI_PHONG);
                const features = roomFeatures[rt.TEN_LOAI] || ['Sạch sẽ', 'An toàn', 'Camera'];
                const isVIP = rt.TEN_LOAI.includes('VIP');

                return (
                  <div key={rt.MA_LOAI_PHONG} className={`bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 ${isVIP ? 'border-amber-200' : 'border-gray-100'}`}>
                    {isVIP && (
                      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-center text-xs font-bold py-1.5 tracking-wider uppercase">
                        ⭐ Gói VIP - Ưu đãi đặc biệt
                      </div>
                    )}
                    <div className="grid grid-cols-1 lg:grid-cols-3">
                      {/* Image area */}
                      <div className={`h-64 lg:h-auto flex items-center justify-center ${isVIP ? 'bg-gradient-to-br from-amber-100 to-orange-100' : 'bg-gradient-to-br from-gray-100 to-gray-50'}`}>
                        <div className="text-center">
                          <span className="text-8xl block mb-3">{petEmojis[rt.LOAI_THU_CUNG] || '🐾'}</span>
                          <span className="text-sm font-medium text-gray-500">{getPetTypeLabel(rt.LOAI_THU_CUNG)}</span>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="lg:col-span-2 p-8">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                          <div>
                            <h3 className="text-2xl font-bold text-gray-800">{rt.TEN_LOAI}</h3>
                            <p className="text-gray-500 mt-1">{rt.MO_TA}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-3xl font-bold text-amber-600">{formatCurrency(rt.GIA_MOI_NGAY)}</div>
                            <p className="text-sm text-gray-400">/ngày</p>
                          </div>
                        </div>

                        {/* Details grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500">Sức chứa</p>
                            <p className="font-bold text-gray-800">{rt.SUC_CHUA} con</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500">Phòng trống</p>
                            <p className={`font-bold ${available > 0 ? 'text-green-600' : 'text-red-500'}`}>
                              {available}/{total}
                            </p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500">Loại thú cưng</p>
                            <p className="font-bold text-gray-800">{getPetTypeLabel(rt.LOAI_THU_CUNG)}</p>
                          </div>
                        </div>

                        {/* Features */}
                        <div className="mb-6">
                          <p className="text-sm font-semibold text-gray-700 mb-2">Tiện nghi:</p>
                          <div className="flex flex-wrap gap-2">
                            {features.map((f, i) => (
                              <span key={i} className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-full">
                                <FiCheckCircle size={12} /> {f}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Action */}
                        <div className="flex flex-wrap items-center gap-4">
                          <Link
                            href="/customer/booking"
                            className={`font-semibold px-6 py-2.5 rounded-full shadow-md hover:shadow-lg transition-all text-sm ${
                              available > 0
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed pointer-events-none'
                            }`}
                          >
                            {available > 0 ? 'Đặt phòng ngay' : 'Hết phòng'}
                          </Link>
                          {available > 0 && (
                            <span className="text-xs text-green-600 flex items-center gap-1">
                              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                              Còn {available} phòng trống
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredTypes.length === 0 && (
                <div className="text-center py-16">
                  <MdPets className="text-gray-300 text-6xl mx-auto mb-3" />
                  <p className="text-gray-400">Không tìm thấy loại phòng nào</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Price notes */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <h3 className="text-lg font-bold text-gray-800 mb-6 text-center">Lưu ý về giá phòng</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
            {[
              'Giá đã bao gồm thức ăn cơ bản cho thú cưng.',
              'Phòng VIP bao gồm dịch vụ dắt đi dạo 1 lần/ngày (chó).',
              'Giảm giá 10% cho lưu trú trên 7 ngày.',
              'Các dịch vụ chăm sóc thêm được tính riêng.',
            ].map((note, i) => (
              <div key={i} className="flex items-start gap-2 bg-white rounded-lg p-4 shadow-sm">
                <FiCheckCircle className="text-amber-500 mt-0.5 flex-shrink-0" />
                <span>{note}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
