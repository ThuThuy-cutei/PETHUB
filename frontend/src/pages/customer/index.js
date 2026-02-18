import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getAllRooms, getAllServices, getRecentBookings, formatCurrency, getPetTypeLabel } from '@/services/api';
import { FiStar, FiShield, FiHeart, FiClock, FiArrowRight, FiCheckCircle, FiPhone } from 'react-icons/fi';
import { MdPets } from 'react-icons/md';

export default function CustomerHome() {
  const [rooms, setRooms] = useState([]);
  const [services, setServices] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [r, s] = await Promise.all([getAllRooms(), getAllServices()]);
        setRooms(r);
        setServices(s.filter(sv => sv.TRANG_THAI === 'HOAT_DONG').slice(0, 4));
      } catch (e) { console.error(e); }
    }
    loadData();
  }, []);

  const roomTypes = rooms.reduce((acc, r) => {
    if (!acc.find(x => x.TEN_LOAI === r.TEN_LOAI)) {
      acc.push(r);
    }
    return acc;
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-200/30 rounded-full blur-3xl"></div>
          <div className="absolute top-20 -left-20 w-60 h-60 bg-orange-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-yellow-200/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur rounded-full px-4 py-2 text-sm text-amber-700 font-medium shadow-sm mb-6">
                <MdPets /> Khách sạn thú cưng #1 TP.HCM
              </div>
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight">
                Nơi thú cưng được
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent"> yêu thương</span>
                <br />như ở nhà
              </h1>
              <p className="mt-6 text-lg text-gray-600 leading-relaxed max-w-lg">
                PetHub cung cấp dịch vụ lưu trú & chăm sóc thú cưng chuyên nghiệp.
                Phòng sạch sẽ, nhân viên tận tâm, camera 24/7 để bạn yên tâm.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/customer/booking"
                  className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold px-8 py-3.5 rounded-full shadow-lg hover:shadow-xl hover:from-amber-600 hover:to-orange-600 transition-all flex items-center gap-2"
                >
                  Đặt phòng ngay <FiArrowRight />
                </Link>
                <Link
                  href="/customer/rooms"
                  className="bg-white text-gray-700 font-semibold px-8 py-3.5 rounded-full shadow-md hover:shadow-lg transition-all border border-gray-200"
                >
                  Xem phòng & giá
                </Link>
              </div>
              {/* Trust badges */}
              <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <FiCheckCircle className="text-green-500" />
                  <span>500+ khách hàng tin tưởng</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiStar className="text-amber-500" />
                  <span>4.9/5 đánh giá</span>
                </div>
              </div>
            </div>

            {/* Hero visual */}
            <div className="hidden lg:block relative">
              <div className="relative w-full h-[460px]">
                {/* Decorative cards */}
                <div className="absolute top-0 right-0 bg-white rounded-2xl shadow-xl p-6 w-64 animate-float">
                  <div className="text-4xl mb-2">🐕</div>
                  <h3 className="font-bold text-gray-800">Lucky</h3>
                  <p className="text-sm text-gray-500">Golden Retriever • Đang lưu trú</p>
                  <div className="mt-3 flex items-center gap-1">
                    {[1,2,3,4,5].map(i => <FiStar key={i} className="text-amber-400 fill-amber-400" size={14} />)}
                  </div>
                </div>
                <div className="absolute bottom-12 left-0 bg-white rounded-2xl shadow-xl p-6 w-72 animate-float-delay">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <FiCheckCircle className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Đặt phòng thành công!</p>
                      <p className="text-xs text-gray-500">P201 - VIP Cho • 5 ngày</p>
                    </div>
                  </div>
                  <div className="bg-amber-50 rounded-lg px-3 py-2 text-center">
                    <p className="text-xs text-gray-500">Tổng cộng</p>
                    <p className="text-lg font-bold text-amber-600">2.500.000₫</p>
                  </div>
                </div>
                <div className="absolute top-1/3 left-1/4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-xl p-5 w-48 text-white">
                  <MdPets className="text-3xl mb-2 opacity-80" />
                  <p className="text-2xl font-bold">10+</p>
                  <p className="text-sm opacity-90">Phòng hiện đại</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-amber-600 font-semibold text-sm uppercase tracking-wider mb-2">Tại sao chọn PetHub?</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Chúng tôi yêu thú cưng <br className="hidden sm:block" />như bạn yêu chúng
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: '🏠', title: 'Phòng sạch sẽ', desc: 'Phòng được vệ sinh sạch sẽ hàng ngày, đầy đủ tiện nghi theo chuẩn quốc tế.' },
              { icon: '📹', title: 'Camera 24/7', desc: 'Hệ thống camera giám sát để bạn có thể theo dõi thú cưng mọi lúc mọi nơi.' },
              { icon: '👨‍⚕️', title: 'Bác sĩ thú y', desc: 'Đội ngũ bác sĩ thú y chuyên nghiệp luôn sẵn sàng chăm sóc sức khỏe.' },
              { icon: '💝', title: 'Yêu thương tận tâm', desc: 'Nhân viên được đào tạo bài bản, yêu động vật, chăm sóc tận tình.' },
            ].map((item, i) => (
              <div key={i} className="text-center group">
                <div className="w-16 h-16 mx-auto bg-amber-50 rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:bg-amber-100 group-hover:scale-110 transition-all duration-300">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Room Types Preview */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-amber-600 font-semibold text-sm uppercase tracking-wider mb-2">Phòng lưu trú</p>
              <h2 className="text-3xl font-bold text-gray-900">Các loại phòng của chúng tôi</h2>
            </div>
            <Link href="/customer/rooms" className="hidden sm:flex items-center gap-2 text-amber-600 font-semibold hover:text-amber-700 transition-colors">
              Xem tất cả <FiArrowRight />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roomTypes.slice(0, 3).map((room, i) => {
              const emojis = { CHO: '🐕', MEO: '🐈', TAT_CA: '🐾' };
              return (
                <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group">
                  <div className="h-48 bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                    <span className="text-7xl group-hover:scale-110 transition-transform duration-300">{emojis[room.LOAI_THU_CUNG] || '🐾'}</span>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-gray-800">{room.TEN_LOAI}</h3>
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
                        {getPetTypeLabel(room.LOAI_THU_CUNG)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">Sức chứa: {room.SUC_CHUA} con</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-amber-600">{formatCurrency(room.GIA_MOI_NGAY)}</span>
                        <span className="text-sm text-gray-400">/ngày</span>
                      </div>
                      <Link
                        href="/customer/booking"
                        className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium px-4 py-2 rounded-full transition-colors"
                      >
                        Đặt ngay
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-8 sm:hidden">
            <Link href="/customer/rooms" className="inline-flex items-center gap-2 text-amber-600 font-semibold">
              Xem tất cả phòng <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-amber-600 font-semibold text-sm uppercase tracking-wider mb-2">Dịch vụ</p>
            <h2 className="text-3xl font-bold text-gray-900">Dịch vụ chăm sóc chuyên nghiệp</h2>
            <p className="text-gray-500 mt-3 max-w-2xl mx-auto">Đầy đủ dịch vụ từ tắm rửa, cắt tỉa đến khám sức khỏe để thú cưng luôn khỏe mạnh và đẹp đẽ.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((sv) => {
              const icons = { 'Tắm spa': '🛁', 'Cắt tỉa lông': '✂️', 'Khám sức khỏe': '🏥', 'Tiêm phòng': '💉', 'Dắt đi dạo': '🚶', 'Ăn uống đặc biệt': '🍖', 'Huấn luyện cơ bản': '🎓', 'Cắt móng': '💅' };
              return (
                <div key={sv.MA_DV} className="bg-gray-50 rounded-2xl p-6 text-center hover:bg-amber-50 hover:shadow-md transition-all duration-300 group">
                  <div className="w-14 h-14 mx-auto bg-white rounded-xl flex items-center justify-center text-3xl shadow-sm group-hover:shadow-md transition-shadow mb-4">
                    {icons[sv.TEN_DV] || '🐾'}
                  </div>
                  <h3 className="font-bold text-gray-800 mb-1">{sv.TEN_DV}</h3>
                  <p className="text-xs text-gray-500 mb-3 min-h-[32px]">{sv.MO_TA}</p>
                  <p className="text-lg font-bold text-amber-600">{formatCurrency(sv.GIA)}</p>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-10">
            <Link href="/customer/services" className="inline-flex items-center gap-2 bg-gray-900 text-white font-semibold px-8 py-3 rounded-full hover:bg-gray-800 transition-colors">
              Xem tất cả dịch vụ <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-amber-600 font-semibold text-sm uppercase tracking-wider mb-2">Đánh giá</p>
            <h2 className="text-3xl font-bold text-gray-900">Khách hàng nói gì về PetHub?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Hoàng Minh Đức', pet: 'Lucky - Golden Retriever', text: 'PetHub chăm sóc Lucky rất tốt! Nhân viên tận tình, phòng sạch sẽ. Mỗi khi đi công tác tôi đều gửi bé ở đây.', rating: 5 },
              { name: 'Võ Thị Eu', pet: 'Buddy - Corgi', text: 'Buddy rất thích ở PetHub! Bé được đi dạo, tắm rửa sạch sẽ. Camera 24/7 giúp mình yên tâm theo dõi.', rating: 5 },
              { name: 'Đặng Thị Giang', pet: 'Bella - Poodle', text: 'Dịch vụ tuyệt vời, giá cả hợp lý. Bella đang điều trị viêm da và được bác sĩ thú y chăm sóc rất chu đáo.', rating: 5 },
            ].map((review, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-1 mb-3">
                  {Array(review.rating).fill(0).map((_, j) => (
                    <FiStar key={j} className="text-amber-400 fill-amber-400" size={16} />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4 italic">&ldquo;{review.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <span className="text-amber-700 font-bold text-sm">{review.name[0]}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{review.name}</p>
                    <p className="text-xs text-gray-500">{review.pet}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-amber-500 to-orange-500">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <MdPets className="text-5xl mx-auto mb-4 opacity-80" />
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Sẵn sàng đặt phòng cho thú cưng?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Đặt phòng ngay hôm nay để thú cưng của bạn được chăm sóc tốt nhất!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/customer/booking"
              className="bg-white text-amber-600 font-bold px-8 py-3.5 rounded-full shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all"
            >
              Đặt phòng ngay
            </Link>
            <a
              href="tel:0901234567"
              className="border-2 border-white/80 text-white font-semibold px-8 py-3.5 rounded-full hover:bg-white/10 transition-all flex items-center gap-2"
            >
              <FiPhone /> Gọi hotline
            </a>
          </div>
        </div>
      </section>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes float-delay {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        :global(.animate-float) {
          animation: float 4s ease-in-out infinite;
        }
        :global(.animate-float-delay) {
          animation: float-delay 5s ease-in-out infinite;
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}
