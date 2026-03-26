'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import OrderDetailModal from '@/components/admin/OrderDetailModal';

// สถานะทั้งหมดตามประเภทออเดอร์
export const STATUS_FLOW = {
  'dine-in':  ['pending', 'confirmed', 'preparing', 'ready', 'completed'],
  'takeaway': ['pending', 'confirmed', 'preparing', 'ready', 'completed'],
  'delivery': ['pending', 'confirmed', 'preparing', 'ready', 'delivering', 'completed'],
};

const ALL_STATUSES = ['pending', 'confirmed', 'preparing', 'ready', 'delivering', 'completed', 'cancelled'];

const STATUS_STYLE = {
  pending:    'badge-pending',
  confirmed:  'badge-preparing',
  preparing:  'badge-preparing',
  ready:      'badge-ready',
  delivering: 'badge-ready',
  completed:  'badge-completed',
  cancelled:  'badge-cancelled',
};

export const STATUS_LABELS = {
  pending:    '⏳ รอยืนยัน',
  confirmed:  '✅ ยืนยันแล้ว',
  preparing:  '👨‍🍳 กำลังทำ',
  ready:      '🔔 พร้อมเสิร์ฟ',
  delivering: '🛵 กำลังจัดส่ง',
  completed:  '🎉 เสร็จสิ้น',
  cancelled:  '❌ ยกเลิก',
};

// label ของ ready แยกตาม orderType
function readyLabel(orderType) {
  if (orderType === 'takeaway') return '📦 พร้อมรับ';
  if (orderType === 'delivery') return '📦 พร้อมส่ง';
  return '🔔 พร้อมเสิร์ฟ';
}

// ปุ่ม quick-action ถัดไปตาม flow ของ orderType
function nextStatuses(order) {
  const flow = STATUS_FLOW[order.orderType] || STATUS_FLOW['dine-in'];
  const idx  = flow.indexOf(order.status);
  if (idx === -1 || idx >= flow.length - 1) return [];
  return flow.slice(idx + 1, idx + 3); // แสดงสูงสุด 2 ขั้นถัดไป
}

export default function AdminOrdersPage() {
  const [orders, setOrders]               = useState([]);
  const [filterStatus, setFilter]         = useState('all');
  const [search, setSearch]               = useState('');
  const [loading, setLoading]             = useState(true);
  const [selected, setSelected]           = useState(null);
  const [newOrderAlert, setNewOrderAlert] = useState(0);

  const prevOrderIds = useRef(new Set());
  const isFirstLoad  = useRef(true);

  const fetchOrders = useCallback(() => {
    const url = filterStatus === 'all' ? '/api/orders' : `/api/orders?status=${filterStatus}`;
    fetch(url).then(r => r.json()).then(res => {
      const fetched = res.data || [];
      checkNewOrders(fetched);
      setOrders(fetched);
      setLoading(false);
    });
  }, [filterStatus]);

  const checkNewOrders = (fetched) => {
    if (!isFirstLoad.current) {
      const newOnes = fetched.filter(o => !prevOrderIds.current.has(o._id) && o.status === 'pending');
      if (newOnes.length > 0) {
        setNewOrderAlert(prev => prev + newOnes.length);
        try {
          const ctx  = new (window.AudioContext || window.webkitAudioContext)();
          const osc  = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain); gain.connect(ctx.destination);
          osc.frequency.value = 880; osc.type = 'sine';
          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
          osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.4);
        } catch {}
      }
    }
    prevOrderIds.current = new Set(fetched.map(o => o._id));
    isFirstLoad.current  = false;
  };

  useEffect(() => {
    const es = new EventSource('/api/orders/stream');
    es.onmessage = (e) => {
      try {
        const { orders: all } = JSON.parse(e.data);
        const fetched = filterStatus === 'all'
          ? all
          : all.filter(o => o.status === filterStatus);
        checkNewOrders(fetched);
        setOrders(fetched);
        setLoading(false);
      } catch {}
    };
    es.onerror = () => fetchOrders();
    return () => es.close();
  }, [filterStatus]);

  useEffect(() => {
    const pending = orders.filter(o => o.status === 'pending').length;
    document.title = pending > 0 ? `(${pending}) ออเดอร์ใหม่ — Admin` : 'จัดการออเดอร์ — Admin';
    return () => { document.title = 'Made-to-Order Restaurant'; };
  }, [orders]);

  const handleStatusChange = async (id, status) => {
    const res = await fetch(`/api/orders/${id}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'เปลี่ยนสถานะไม่สำเร็จ');
    if (selected?._id === id) setSelected(data.data);
    fetchOrders();
  };

  const handleDelete = async (id) => {
    if (!confirm('ลบออเดอร์นี้?')) return;
    await fetch(`/api/orders/${id}`, { method: 'DELETE' });
    setSelected(null);
    fetchOrders();
  };

  const filtered = orders.filter(o =>
    o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
    o.customerName?.toLowerCase().includes(search.toLowerCase()) ||
    o.tableNumber?.includes(search)
  );

  const pendingCount = orders.filter(o => o.status === 'pending').length;

  return (
    <div className="p-6">
      <header className="page-header mb-6">
        <div>
          <h1 className="page-title flex items-center gap-3">
            จัดการออเดอร์
            {pendingCount > 0 && (
              <span className="bg-red-500 text-white text-sm font-bold px-2.5 py-0.5 rounded-full animate-pulse">
                {pendingCount} ใหม่
              </span>
            )}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
            Real-time
          </p>
        </div>
        <button onClick={() => { fetchOrders(); setNewOrderAlert(0); }} className="btn-secondary text-sm gap-2 relative">
          🔄 รีเฟรช
          {newOrderAlert > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {newOrderAlert}
            </span>
          )}
        </button>
      </header>

      {newOrderAlert > 0 && (
        <div className="mb-4 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 flex items-center justify-between animate-fade-up">
          <span className="text-orange-700 font-medium text-sm">
            🔔 มีออเดอร์ใหม่ {newOrderAlert} รายการ!
          </span>
          <button onClick={() => setNewOrderAlert(0)} className="text-orange-400 hover:text-orange-600 text-xs">ปิด</button>
        </div>
      )}

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="ค้นหาออเดอร์, ชื่อ, โต๊ะ..."
          className="input max-w-xs"
        />
        <div className="flex gap-2 flex-wrap">
          {['all', ...ALL_STATUSES].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex-shrink-0 ${
                filterStatus === s ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300'
              }`}
            >
              {s === 'all' ? 'ทั้งหมด' : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20 text-gray-400">
          <div className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filtered.length === 0 && (
            <p className="text-center text-gray-400 py-16">ไม่มีออเดอร์</p>
          )}
          {filtered.map(order => (
            <article
              key={order._id}
              onClick={() => setSelected(order)}
              className={`card p-4 cursor-pointer hover:shadow-md hover:border-orange-200 transition-all ${
                order.status === 'pending' ? 'border-orange-300 bg-orange-50/30' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-bold text-base">{order.orderNumber}</span>
                    {order.tableNumber && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">โต๊ะ {order.tableNumber}</span>
                    )}
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                      {order.orderType === 'delivery' ? '🛵 จัดส่ง' : order.orderType === 'takeaway' ? '🥡 Takeaway' : '🪑 Dine-in'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {order.customerName}
                    {order.customerPhone && <span> · 📞 {order.customerPhone}</span>}
                    {' '}• {order.items.length} รายการ •{' '}
                    <span className="text-gray-400 text-xs">{new Date(order.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</span>
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className={STATUS_STYLE[order.status]}>
                    {order.status === 'ready' ? readyLabel(order.orderType) : STATUS_LABELS[order.status]}
                  </span>
                  <span className="font-bold text-orange-500">฿{(order.grandTotal || order.totalPrice)?.toFixed(0)}</span>
                </div>
              </div>

              {/* Quick status — เฉพาะสถานะถัดไปตาม flow */}
              {order.status !== 'completed' && order.status !== 'cancelled' && (
                <footer className="mt-3 pt-3 border-t border-gray-50 flex gap-2 flex-wrap" onClick={e => e.stopPropagation()}>
                  {nextStatuses(order).map(s => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(order._id, s)}
                      className="text-xs px-3 py-1 rounded-full bg-gray-50 border border-gray-200 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600 transition-colors"
                    >
                      → {s === 'ready' ? readyLabel(order.orderType) : STATUS_LABELS[s]}
                    </button>
                  ))}
                  <button
                    onClick={() => handleStatusChange(order._id, 'cancelled')}
                    className="text-xs px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-500 hover:bg-red-100 transition-colors ml-auto"
                  >
                    ยกเลิก
                  </button>
                </footer>
              )}
            </article>
          ))}
        </div>
      )}

      {selected && (
        <OrderDetailModal
          order={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
          onRefresh={() => {
            fetch(`/api/orders/${selected._id}`).then(r => r.json()).then(res => setSelected(res.data));
            fetchOrders();
          }}
        />
      )}
    </div>
  );
}
