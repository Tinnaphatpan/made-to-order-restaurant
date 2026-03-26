'use client';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState, useRef, useEffect } from 'react';

export default function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (!dropdownRef.current?.contains(e.target)) setDropdownOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isAdmin = session?.user?.role === 'admin';
  const avatar  = session?.user?.avatar;
  const name    = session?.user?.name;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-orange-500">
          🍽️ <span className="hidden sm:inline">Made-to-Order</span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-1">
          <li>
            <Link href="/menu" className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-orange-50 hover:text-orange-500 transition-colors">
              เมนู
            </Link>
          </li>
          <li>
            <Link href="/orders" className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-orange-50 hover:text-orange-500 transition-colors">
              ออเดอร์
            </Link>
          </li>
          {isAdmin && (
            <li>
              <Link href="/admin" className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-orange-50 hover:text-orange-500 transition-colors">
                Admin
              </Link>
            </li>
          )}

          {/* User dropdown / Login */}
          {session ? (
            <li className="relative ml-2" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
              >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full overflow-hidden bg-orange-100 border-2 border-orange-200 flex-shrink-0">
                  {avatar ? (
                    <img src={avatar} alt={name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-orange-500 font-bold text-sm">
                      {name?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">{name}</span>
                <svg className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-lg border border-gray-100 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-50 mb-1">
                    <p className="text-sm font-semibold text-gray-800 truncate">{name}</p>
                    <p className="text-xs text-gray-400 truncate">{session.user.email}</p>
                  </div>
                  {!isAdmin && (
                    <Link href="/profile" onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                      👤 โปรไฟล์ของฉัน
                    </Link>
                  )}
                  {isAdmin && (
                    <Link href="/admin" onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                      🛠️ Admin Panel
                    </Link>
                  )}
                  <div className="border-t border-gray-50 mt-1">
                    <button onClick={() => signOut({ callbackUrl: '/' })}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                      🚪 ออกจากระบบ
                    </button>
                  </div>
                </div>
              )}
            </li>
          ) : (
            <li className="flex items-center gap-2 ml-2">
              <Link href="/login" className="btn-secondary text-sm px-4 py-2 rounded-lg">
                เข้าสู่ระบบ
              </Link>
              <Link href="/register" className="btn-primary text-sm px-4 py-2 rounded-lg">
                สมัครสมาชิก
              </Link>
            </li>
          )}
        </ul>

        {/* Mobile toggle */}
        <button className="md:hidden p-2 text-gray-600" onClick={() => setMobileOpen(!mobileOpen)}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d={mobileOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 flex flex-col gap-1">
          {session && (
            <div className="flex items-center gap-3 px-3 py-3 mb-1 border-b border-gray-100">
              <div className="w-9 h-9 rounded-full overflow-hidden bg-orange-100 border-2 border-orange-200 flex-shrink-0">
                {avatar ? (
                  <img src={avatar} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-orange-500 font-bold">
                    {name?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{name}</p>
                <p className="text-xs text-gray-400">{session.user.email}</p>
              </div>
            </div>
          )}

          <Link href="/menu"   onClick={() => setMobileOpen(false)} className="px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-orange-50">🍜 เมนู</Link>
          <Link href="/orders" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-orange-50">📋 ออเดอร์</Link>

          {session ? (
            <>
              {!isAdmin && (
                <Link href="/profile" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-orange-50">👤 โปรไฟล์</Link>
              )}
              {isAdmin && (
                <Link href="/admin" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-orange-50">🛠️ Admin</Link>
              )}
              <button onClick={() => signOut({ callbackUrl: '/' })}
                className="text-left px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50">
                🚪 ออกจากระบบ
              </button>
            </>
          ) : (
            <>
              <Link href="/login"    onClick={() => setMobileOpen(false)} className="px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-orange-50">เข้าสู่ระบบ</Link>
              <Link href="/register" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 rounded-lg text-sm font-medium text-orange-500 hover:bg-orange-50">สมัครสมาชิก</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
