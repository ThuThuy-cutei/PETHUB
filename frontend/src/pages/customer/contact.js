import { useState } from 'react';
import { FiMapPin, FiPhone, FiMail, FiClock, FiSend, FiCheckCircle } from 'react-icons/fi';
import { MdPets } from 'react-icons/md';
import toast from 'react-hot-toast';

export default function CustomerContact() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.phone || !form.message) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }
    // Simulate submission
    toast.success('Gửi liên hệ thành công! Chúng tôi sẽ phản hồi sớm nhất.');
    setSubmitted(true);
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-amber-50 to-orange-50 py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-amber-600 font-semibold text-sm uppercase tracking-wider mb-2">Liên hệ</p>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Liên hệ với chúng tôi</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Bạn có câu hỏi? Cần tư vấn? Hãy liên hệ với PetHub! Chúng tôi luôn sẵn sàng hỗ trợ bạn.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 mx-auto bg-amber-50 rounded-xl flex items-center justify-center mb-3">
                <FiMapPin className="text-amber-600 text-xl" />
              </div>
              <h3 className="font-bold text-gray-800 mb-1">Địa chỉ</h3>
              <p className="text-sm text-gray-500">123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 mx-auto bg-green-50 rounded-xl flex items-center justify-center mb-3">
                <FiPhone className="text-green-600 text-xl" />
              </div>
              <h3 className="font-bold text-gray-800 mb-1">Điện thoại</h3>
              <p className="text-sm text-gray-500">0901 234 567</p>
              <p className="text-xs text-gray-400">Hotline 24/7</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 mx-auto bg-blue-50 rounded-xl flex items-center justify-center mb-3">
                <FiMail className="text-blue-600 text-xl" />
              </div>
              <h3 className="font-bold text-gray-800 mb-1">Email</h3>
              <p className="text-sm text-gray-500">info@pethub.vn</p>
              <p className="text-xs text-gray-400">Phản hồi trong 24h</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 mx-auto bg-purple-50 rounded-xl flex items-center justify-center mb-3">
                <FiClock className="text-purple-600 text-xl" />
              </div>
              <h3 className="font-bold text-gray-800 mb-1">Giờ mở cửa</h3>
              <p className="text-sm text-gray-500">7:00 - 21:00</p>
              <p className="text-xs text-gray-400">Tất cả các ngày</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form + Map */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Gửi tin nhắn</h2>

              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <FiCheckCircle className="text-green-600 text-3xl" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Gửi thành công!</h3>
                  <p className="text-gray-500 mb-6">Chúng tôi sẽ liên hệ lại với bạn trong thời gian sớm nhất.</p>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ name: '', phone: '', email: '', subject: '', message: '' }); }}
                    className="text-amber-600 font-medium hover:text-amber-700"
                  >
                    Gửi tin nhắn khác
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên *</label>
                      <input
                        type="text" required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                        placeholder="Nguyễn Văn A"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại *</label>
                      <input
                        type="tel" required
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                        placeholder="0901234567"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Chủ đề</label>
                    <select
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none bg-white"
                    >
                      <option value="">-- Chọn chủ đề --</option>
                      <option value="booking">Hỏi về đặt phòng</option>
                      <option value="services">Hỏi về dịch vụ</option>
                      <option value="pricing">Hỏi về giá cả</option>
                      <option value="complaint">Khiếu nại / Góp ý</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung *</label>
                    <textarea
                      required
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                      rows={5}
                      placeholder="Nhập nội dung tin nhắn..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold py-3 rounded-full shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <FiSend /> Gửi tin nhắn
                  </button>
                </form>
              )}
            </div>

            {/* Map / Info section */}
            <div className="space-y-6">
              {/* Embedded map placeholder */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="h-64 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center relative">
                  <div className="text-center">
                    <FiMapPin className="text-amber-600 text-4xl mx-auto mb-2" />
                    <p className="text-gray-600 font-medium">123 Nguyễn Huệ, Quận 1</p>
                    <p className="text-gray-500 text-sm">TP. Hồ Chí Minh</p>
                  </div>
                  {/* Grid overlay to simulate map */}
                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
                </div>
                <div className="p-4 text-center">
                  <a
                    href="https://maps.google.com/?q=10.7769,106.7009"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-600 font-medium text-sm hover:text-amber-700 transition-colors"
                  >
                    Xem trên Google Maps →
                  </a>
                </div>
              </div>

              {/* FAQ */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4">Câu hỏi thường gặp</h3>
                <div className="space-y-4 text-sm">
                  {[
                    { q: 'Tôi có thể theo dõi thú cưng không?', a: 'Có, chúng tôi cung cấp camera 24/7 để bạn theo dõi qua điện thoại.' },
                    { q: 'Thú cưng cần tiêm phòng trước khi gửi?', a: 'Có, thú cưng cần có sổ tiêm phòng đầy đủ để đảm bảo an toàn.' },
                    { q: 'Có thể gửi thú cưng trong ngày?', a: 'Có, chúng tôi nhận gửi theo giờ với giá từ 50.000₫/giờ.' },
                    { q: 'Chính sách hủy đặt phòng?', a: 'Hủy miễn phí trước 24h. Hủy trong vòng 24h tính phí 50%.' },
                  ].map((faq, i) => (
                    <div key={i}>
                      <p className="font-medium text-gray-800">{faq.q}</p>
                      <p className="text-gray-500 mt-1">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
