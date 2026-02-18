import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { FiMenu, FiX, FiPhone, FiMail, FiMapPin, FiClock } from 'react-icons/fi';
import { MdPets } from 'react-icons/md';

const navItems = [
  { href: '/customer', label: 'Trang chủ' },
  { href: '/customer/rooms', label: 'Phòng & Giá' },
  { href: '/customer/services', label: 'Dịch vụ' },
  { href: '/customer/booking', label: 'Đặt phòng' },
  { href: '/customer/pet-status', label: 'Theo dõi bé yêu' },
  { href: '/customer/account', label: 'Tài khoản' },
  { href: '/customer/contact', label: 'Liên hệ' },
];

export default function CustomerLayout({ children }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Top Bar */}
      <div className="bg-amber-900 text-amber-100 py-2 text-xs hidden sm:block">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1"><FiPhone size={12} /> 0901 234 567</span>
            <span className="flex items-center gap-1"><FiMail size={12} /> info@pethub.vn</span>
          </div>
          <div className="flex items-center gap-1">
            <FiClock size={12} /> Mở cửa: 7:00 - 21:00 hàng ngày
          </div>
        </div>
      </div>

      {/* Header / Navbar */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/customer" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                <MdPets className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">PetHub</h1>
                <p className="text-[10px] text-gray-400 -mt-1">Khách sạn thú cưng</p>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = router.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-amber-50 text-amber-700'
                        : 'text-gray-600 hover:text-amber-700 hover:bg-amber-50/50'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* CTA + Mobile Menu */}
            <div className="flex items-center gap-3">
              <Link
                href="/customer/booking"
                className="hidden sm:inline-flex bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-md hover:shadow-lg hover:from-amber-600 hover:to-orange-600 transition-all"
              >
                Đặt phòng ngay
              </Link>
              <button
                className="md:hidden text-gray-600 hover:text-gray-800"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Nav */}
          {menuOpen && (
            <nav className="md:hidden pb-4 border-t border-gray-100 pt-3">
              {navItems.map((item) => {
                const isActive = router.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={`block px-4 py-2.5 rounded-lg text-sm font-medium ${
                      isActive
                        ? 'bg-amber-50 text-amber-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <Link
                href="/customer/booking"
                onClick={() => setMenuOpen(false)}
                className="block mx-4 mt-3 text-center bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold px-5 py-2.5 rounded-full"
              >
                Đặt phòng ngay
              </Link>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300">
        {/* Main Footer */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <MdPets className="text-white text-2xl" />
                </div>
                <div>
                  <h3 className="text-white text-lg font-bold">PetHub</h3>
                  <p className="text-xs text-gray-500">Khách sạn thú cưng</p>
                </div>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Nơi thú cưng được yêu thương và chăm sóc như ở nhà.
                Dịch vụ lưu trú & chăm sóc chuyên nghiệp hàng đầu.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Khám phá</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/customer/rooms" className="hover:text-amber-400 transition-colors">Phòng & Bảng giá</Link></li>
                <li><Link href="/customer/services" className="hover:text-amber-400 transition-colors">Dịch vụ chăm sóc</Link></li>
                <li><Link href="/customer/booking" className="hover:text-amber-400 transition-colors">Đặt phòng online</Link></li>
                <li><Link href="/customer/contact" className="hover:text-amber-400 transition-colors">Liên hệ</Link></li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-white font-semibold mb-4">Dịch vụ</h4>
              <ul className="space-y-2 text-sm">
                <li className="hover:text-amber-400 transition-colors cursor-default">Lưu trú cho chó & mèo</li>
                <li className="hover:text-amber-400 transition-colors cursor-default">Tắm spa & cắt tỉa</li>
                <li className="hover:text-amber-400 transition-colors cursor-default">Khám sức khỏe</li>
                <li className="hover:text-amber-400 transition-colors cursor-default">Dắt đi dạo</li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-semibold mb-4">Liên hệ</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <FiMapPin className="text-amber-500 mt-0.5 flex-shrink-0" />
                  <span>123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</span>
                </li>
                <li className="flex items-center gap-2">
                  <FiPhone className="text-amber-500 flex-shrink-0" />
                  <span>0901 234 567</span>
                </li>
                <li className="flex items-center gap-2">
                  <FiMail className="text-amber-500 flex-shrink-0" />
                  <span>info@pethub.vn</span>
                </li>
                <li className="flex items-center gap-2">
                  <FiClock className="text-amber-500 flex-shrink-0" />
                  <span>7:00 - 21:00 hàng ngày</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500">
            <p>&copy; 2026 PetHub. All rights reserved.</p>
            <div className="flex gap-4 mt-2 sm:mt-0">
              <Link href="/" className="hover:text-amber-400 transition-colors">Admin Portal</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
