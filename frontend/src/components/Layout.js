import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import {
  FiHome, FiCalendar, FiGrid, FiFileText, FiMenu, FiX,
  FiUsers, FiHeart, FiCamera
} from 'react-icons/fi';
import { MdPets } from 'react-icons/md';

const navItems = [
  { href: '/', label: 'Dashboard', icon: FiHome },
  { href: '/booking', label: 'Đặt Phòng', icon: FiCalendar },
  { href: '/rooms', label: 'Phòng', icon: FiGrid },
  { href: '/services', label: 'Dịch Vụ', icon: FiHeart },
  { href: '/pet-updates', label: 'Cập Nhật Thú Cưng', icon: FiCamera },
  { href: '/billing', label: 'Hóa Đơn', icon: FiFileText },
  { href: '/customers', label: 'Khách Hàng', icon: FiUsers },
];

export default function Layout({ children }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-amber-600 to-orange-700 text-white transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/20">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
            <MdPets className="text-amber-600 text-2xl" />
          </div>
          <div>
            <h1 className="text-xl font-bold">PetHub</h1>
            <p className="text-xs text-amber-200">Khách sạn thú cưng</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3">
          {navItems.map((item) => {
            const isActive = router.pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-all duration-200 ${
                  isActive
                    ? 'bg-white/20 text-white font-semibold shadow-lg'
                    : 'text-amber-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="text-lg" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/20">
          <div className="text-xs text-amber-200 text-center">
            <p>Pet Hotel Management</p>
            <p className="mt-1">Oracle DB &bull; v1.0</p>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <button
            className="lg:hidden text-gray-600 hover:text-gray-800"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>

          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-800 hidden lg:block">
              {navItems.find((item) => item.href === router.pathname)?.label || 'PetHub'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
              <span className="text-amber-700 text-sm font-bold">A</span>
            </div>
            <span className="text-sm text-gray-600 hidden sm:block">Admin</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
