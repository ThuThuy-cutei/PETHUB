import { useState, useEffect } from 'react';
import { getAllServices, formatCurrency } from '@/services/api';
import { FiSearch, FiCheckCircle } from 'react-icons/fi';
import { MdPets } from 'react-icons/md';
import Link from 'next/link';

const serviceIcons = {
  'Tắm spa': '🛁',
  'Cắt tỉa lông': '✂️',
  'Khám sức khỏe': '🏥',
  'Tiêm phòng': '💉',
  'Dắt đi dạo': '🚶',
  'Ăn uống đặc biệt': '🍖',
  'Huấn luyện cơ bản': '🎓',
  'Cắt móng': '💅',
};

const unitLabels = {
  'LAN': '/lần',
  'GIO': '/giờ',
  'NGAY': '/ngày',
  'LIEU_TRINH': '/liệu trình',
};

export default function CustomerServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getAllServices();
        setServices(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const activeServices = services.filter(s => s.TRANG_THAI === 'HOAT_DONG');
  const filteredServices = activeServices.filter(s =>
    !search || s.TEN_DV.toLowerCase().includes(search.toLowerCase()) ||
    s.MO_TA?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-amber-50 to-orange-50 py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-amber-600 font-semibold text-sm uppercase tracking-wider mb-2">Dịch vụ</p>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Dịch vụ chăm sóc thú cưng
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Đầy đủ các dịch vụ từ tắm rửa, cắt tỉa lông, khám sức khỏe đến huấn luyện.
            Tất cả được thực hiện bởi đội ngũ chuyên nghiệp, yêu thương động vật.
          </p>
        </div>
      </section>

      {/* Search */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="relative max-w-md mx-auto">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm dịch vụ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-full focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-sm shadow-sm"
            />
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredServices.map((service) => (
                  <div
                    key={service.MA_DV}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden group"
                  >
                    {/* Top colored bar */}
                    <div className="h-2 bg-gradient-to-r from-amber-400 to-orange-400"></div>

                    <div className="p-6">
                      {/* Icon */}
                      <div className="w-16 h-16 mx-auto bg-amber-50 rounded-2xl flex items-center justify-center text-4xl mb-4 group-hover:bg-amber-100 group-hover:scale-110 transition-all duration-300">
                        {serviceIcons[service.TEN_DV] || '🐾'}
                      </div>

                      {/* Info */}
                      <div className="text-center">
                        <h3 className="text-lg font-bold text-gray-800 mb-2">{service.TEN_DV}</h3>
                        <p className="text-sm text-gray-500 mb-4 min-h-[48px] leading-relaxed">{service.MO_TA}</p>

                        {/* Price */}
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 mb-4">
                          <p className="text-2xl font-bold text-amber-600">{formatCurrency(service.GIA)}</p>
                          <p className="text-xs text-gray-500">{unitLabels[service.DON_VI] || service.DON_VI}</p>
                        </div>

                        {/* Features */}
                        <div className="space-y-2 text-left text-xs text-gray-500">
                          <div className="flex items-center gap-2">
                            <FiCheckCircle className="text-green-500 flex-shrink-0" />
                            <span>Nhân viên chuyên nghiệp</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FiCheckCircle className="text-green-500 flex-shrink-0" />
                            <span>An toàn & vệ sinh</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredServices.length === 0 && (
                <div className="text-center py-16">
                  <MdPets className="text-gray-300 text-6xl mx-auto mb-3" />
                  <p className="text-gray-400">Không tìm thấy dịch vụ nào</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Cần tư vấn dịch vụ phù hợp?</h2>
          <p className="text-gray-500 mb-6">Liên hệ ngay để được nhân viên tư vấn miễn phí!</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/customer/booking" className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold px-8 py-3 rounded-full shadow-md hover:shadow-lg transition-all">
              Đặt phòng & dịch vụ
            </Link>
            <Link href="/customer/contact" className="bg-white text-gray-700 font-semibold px-8 py-3 rounded-full shadow-md border border-gray-200 hover:shadow-lg transition-all">
              Liên hệ tư vấn
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
