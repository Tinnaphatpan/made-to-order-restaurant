'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const statCards = (data) => [
  { label: 'ออเดอร์ทั้งหมด', value: data.totalOrders,    icon: '📋', color: 'bg-blue-50   text-blue-600'   },
  { label: 'รอดำเนินการ',    value: data.pendingOrders,  icon: '⏳', color: 'bg-yellow-50 text-yellow-600' },
  { label: 'กำลังทำ',        value: data.preparingOrders,icon: '👨‍🍳', color: 'bg-orange-50 text-orange-600' },
  { label: 'รายได้รวม (฿)',  value: data.totalRevenue?.toFixed(2) ?? '0.00', icon: '💰', color: 'bg-green-50  text-green-600'  },
];

const menuCards = [
  { href: '/admin/menu',       icon: '🍜', label: 'จัดการเมนู',     desc: 'เพิ่ม / แก้ไข / ลบ รายการอาหาร' },
  { href: '/admin/orders',     icon: '📋', label: 'จัดการออเดอร์',  desc: 'ดูและอัพเดทสถานะออเดอร์' },
  { href: '/admin/categories', icon: '🏷️', label: 'จัดการหมวดหมู่', desc: 'เพิ่ม / แก้ไข หมวดหมู่' },
  { href: '/admin/finance',    icon: '💰', label: 'รายรับรายจ่าย',  desc: 'สรุปรายได้ กำไร และค่าใช้จ่าย' },
  { href: '/admin/tables',     icon: '🪑', label: 'QR Code โต๊ะ',   desc: 'สร้าง QR Code สำหรับแต่ละโต๊ะ' },
];

export default function AdminPage() {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(res => {
      setStats(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">ภาพรวมร้านอาหารวันนี้</p>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {loading
          ? Array(4).fill(0).map((_, i) => (
              <div key={i} className="card p-5 animate-pulse h-24 bg-gray-100 rounded-xl" />
            ))
          : statCards(stats || {}).map(s => (
              <div key={s.label} className={`card p-5 flex flex-col gap-2`}>
                <span className="text-2xl">{s.icon}</span>
                <span className="text-2xl font-bold">{s.value ?? 0}</span>
                <span className="text-xs text-gray-500">{s.label}</span>
              </div>
            ))
        }
      </section>

      {/* Quick access */}
      <section>
        <h2 className="font-semibold text-lg mb-4 text-gray-700">จัดการ</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {menuCards.map(c => (
            <Link key={c.href} href={c.href}
              className="card p-6 hover:shadow-md hover:border-orange-200 transition-all group">
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform inline-block">{c.icon}</div>
              <h3 className="font-semibold text-base mb-1">{c.label}</h3>
              <p className="text-sm text-gray-400">{c.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
