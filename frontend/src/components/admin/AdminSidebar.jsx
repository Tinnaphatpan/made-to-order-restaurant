'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

const navItems = [
  { href: '/admin',             icon: '📊', label: 'Dashboard'       },
  { href: '/admin/orders',      icon: '📋', label: 'ออเดอร์'         },
  { href: '/admin/menu',        icon: '🍜', label: 'เมนูอาหาร'       },
  { href: '/admin/finance',     icon: '💰', label: 'รายรับรายจ่าย'   },
  { href: '/admin/categories',  icon: '🏷️', label: 'หมวดหมู่'        },
  { href: '/admin/tables',      icon: '🪑', label: 'QR Code โต๊ะ'    },
];

// แสดงแค่ 5 รายการแรกใน bottom nav (mobile)
const mobileNavItems = navItems.slice(0, 5);

export default function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="w-56 flex-shrink-0 hidden md:flex flex-col bg-white border-r border-gray-100 min-h-[calc(100vh-64px)] sticky top-16">
        <div className="p-4 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Admin Panel</p>
        </div>

        <nav className="flex-1 p-3 flex flex-col gap-1">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? 'bg-orange-50 text-orange-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-100">
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors w-full"
          >
            <span>🚪</span> ออกจากระบบ
          </button>
        </div>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 flex items-stretch shadow-lg">
        {mobileNavItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors ${
              isActive(item.href)
                ? 'text-orange-500 bg-orange-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="text-lg leading-none">{item.icon}</span>
            <span className="leading-tight">{item.label.length > 6 ? item.label.slice(0, 6) + '…' : item.label}</span>
          </Link>
        ))}
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-medium text-red-400 hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          <span className="text-lg leading-none">🚪</span>
          <span className="leading-tight">ออก</span>
        </button>
      </nav>

    </>
  );
}
