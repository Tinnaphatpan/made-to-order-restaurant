'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

const STATUS_LABELS = {
  pending:    { label: 'รอดำเนินการ', class: 'badge-pending' },
  confirmed:  { label: 'ยืนยันแล้ว',  class: 'badge-preparing' },
  preparing:  { label: 'กำลังทำ',    class: 'badge-preparing' },
  ready:      { label: 'พร้อมเสิร์ฟ', class: 'badge-ready' },
  delivering: { label: 'กำลังจัดส่ง', class: 'badge-ready' },
  completed:  { label: 'เสร็จแล้ว',  class: 'badge-completed' },
  cancelled:  { label: 'ยกเลิก',     class: 'badge-cancelled' },
};

export default function OrdersPage() {
  const { data: session, status: authStatus } = useSession();
  const [orders, setOrders]       = useState([]);
  const [filterStatus, setFilter] = useState('all');
  const [loading, setLoading]     = useState(true);

  const fetchOrders = () => {
    const params = new URLSearchParams();
    if (filterStatus !== 'all') params.set('status', filterStatus);
    // ถ้า login อยู่ให้ดูแค่ออเดอร์ตัวเอง
    if (session?.user?.id && session.user.role !== 'admin') params.set('mine', 'true');

    fetch(`/api/orders?${params}`).then(r => r.json()).then(res => {
      setOrders(res.data || []);
      setLoading(false);
    });
  };

  useEffect(() => {
    if (authStatus === 'loading') return;
    fetchOrders();
  }, [filterStatus, authStatus]);

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">กำลังโหลด...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">รายการออเดอร์</h1>
          {session && <p className="text-sm text-gray-400 mt-0.5">ออเดอร์ของคุณ</p>}
        </div>
        <Link href="/menu" className="btn-primary text-sm">+ สั่งอาหาร</Link>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        {['all', ...Object.keys(STATUS_LABELS)].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filterStatus === s ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
          >
            {s === 'all' ? 'ทั้งหมด' : STATUS_LABELS[s].label}
          </button>
        ))}
      </div>

      {/* Orders list */}
      <div className="flex flex-col gap-4">
        {orders.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🍽️</p>
            <p className="text-gray-400">ยังไม่มีออเดอร์</p>
            <Link href="/menu" className="mt-4 inline-block text-orange-500 hover:underline">เริ่มสั่งอาหาร →</Link>
          </div>
        )}
        {orders.map(order => (
          <article key={order._id} className="card p-5 hover:shadow-md transition-shadow animate-fade-up">
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className="font-bold text-lg">{order.orderNumber}</span>
                {order.tableNumber && <span className="ml-2 text-gray-500 text-sm">โต๊ะ {order.tableNumber}</span>}
                <span className="ml-2 text-gray-400 text-sm">{order.customerName}</span>
              </div>
              <span className={STATUS_LABELS[order.status]?.class ?? 'badge-pending'}>
                {STATUS_LABELS[order.status]?.label ?? order.status}
              </span>
            </div>
            <ul className="text-sm text-gray-600 mb-3">
              {order.items.map((item, i) => (
                <li key={i}>{item.name} × {item.quantity} — ฿{(item.price * item.quantity).toFixed(0)}</li>
              ))}
            </ul>
            <footer className="flex justify-between items-center text-sm">
              <span className="text-gray-400">{new Date(order.createdAt).toLocaleString('th-TH')}</span>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-orange-600">฿{(order.grandTotal || order.totalPrice).toFixed(0)}</span>
                <Link href={`/orders/${order._id}`} className="text-orange-500 hover:underline font-medium">
                  ติดตาม →
                </Link>
              </div>
            </footer>
          </article>
        ))}
      </div>
    </div>
  );
}
