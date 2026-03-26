'use client';
import { useState } from 'react';

const STATUS_FLOW = {
  'dine-in':  ['pending', 'confirmed', 'preparing', 'ready', 'completed'],
  'takeaway': ['pending', 'confirmed', 'preparing', 'ready', 'completed'],
  'delivery': ['pending', 'confirmed', 'preparing', 'ready', 'delivering', 'completed'],
};

const STATUS_LABELS = {
  pending:    '⏳ รอยืนยัน',
  confirmed:  '✅ ยืนยันแล้ว',
  preparing:  '👨‍🍳 กำลังทำ',
  ready:      '🔔 พร้อมเสิร์ฟ',
  delivering: '🛵 กำลังจัดส่ง',
  completed:  '🎉 เสร็จสิ้น',
  cancelled:  '❌ ยกเลิก',
};

function readyLabel(orderType) {
  if (orderType === 'takeaway') return '📦 พร้อมรับ';
  if (orderType === 'delivery') return '📦 พร้อมส่ง';
  return '🔔 พร้อมเสิร์ฟ';
}

function getLabel(status, orderType) {
  if (status === 'ready') return readyLabel(orderType);
  return STATUS_LABELS[status] || status;
}

export default function OrderDetailModal({ order, onClose, onStatusChange, onDelete, onRefresh }) {
  const [loadingStatus, setLoadingStatus] = useState('');
  const [error, setError] = useState('');

  const flow            = STATUS_FLOW[order.orderType] || STATUS_FLOW['dine-in'];
  const availableStatus = [...flow.filter(s => s !== order.status), 'cancelled'];

  const handleStatusClick = async (newStatus) => {
    setLoadingStatus(newStatus);
    setError('');
    try {
      await onStatusChange(order._id, newStatus);
    } catch {
      setError('เปลี่ยนสถานะไม่สำเร็จ กรุณาลองใหม่');
    }
    setLoadingStatus('');
  };

  const handleDelete = async () => {
    if (!confirm('ลบออเดอร์นี้?')) return;
    try {
      await onDelete(order._id);
      onClose();
    } catch {
      setError('ลบไม่สำเร็จ กรุณาลองใหม่');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="font-bold text-lg flex items-center gap-2">
              {order.orderNumber}
              <span className="text-sm font-normal text-gray-400">
                {order.orderType === 'delivery' ? '🛵 จัดส่ง' : order.orderType === 'takeaway' ? '🥡 Takeaway' : '🪑 Dine-in'}
              </span>
            </h2>
            <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString('th-TH')}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onRefresh} className="text-gray-400 hover:text-orange-500 transition-colors text-sm" title="รีเฟรช">🔄</button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">✕</button>
          </div>
        </header>

        <div className="p-6 flex flex-col gap-6">

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 text-sm text-center">{error}</div>
          )}

          {/* Info */}
          <section className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-gray-400 text-xs mb-1">ลูกค้า</p>
              <p className="font-medium">{order.customerName}</p>
              {order.customerPhone && (
                <p className="text-gray-500 text-xs mt-0.5">📞 {order.customerPhone}</p>
              )}
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-gray-400 text-xs mb-1">สถานะปัจจุบัน</p>
              <p className="font-medium">{getLabel(order.status, order.orderType)}</p>
              {order.tableNumber && (
                <p className="text-gray-500 text-xs mt-0.5">🪑 โต๊ะ {order.tableNumber}</p>
              )}
            </div>
          </section>

          {/* Delivery info */}
          {order.orderType === 'delivery' && order.delivery?.address && (
            <section className="bg-purple-50 rounded-xl p-4 text-sm">
              <p className="font-semibold text-purple-700 mb-2">🛵 ข้อมูลจัดส่ง</p>
              <p className="text-gray-700">📍 {order.delivery.address}</p>
              {order.delivery.riderName && <p className="text-gray-500 mt-1">🧑 ผู้ส่ง: {order.delivery.riderName}</p>}
              {order.delivery.fee > 0   && <p className="text-gray-500">💳 ค่าส่ง: ฿{order.delivery.fee}</p>}
            </section>
          )}

          {/* Items */}
          <section>
            <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wide mb-3">รายการอาหาร</h3>
            <ul className="flex flex-col gap-2">
              {order.items.map((item, i) => (
                <li key={i} className="flex justify-between text-sm">
                  <span>{item.name} × {item.quantity}</span>
                  <span className="font-medium">฿{(item.price * item.quantity).toFixed(0)}</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-gray-100 mt-3 pt-3 flex flex-col gap-1 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>ค่าอาหาร</span><span>฿{order.totalPrice?.toFixed(0)}</span>
              </div>
              {order.deliveryFee > 0 && (
                <div className="flex justify-between text-gray-500">
                  <span>ค่าจัดส่ง</span><span>฿{order.deliveryFee?.toFixed(0)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base mt-1">
                <span>รวมทั้งหมด</span>
                <span className="text-orange-500">฿{(order.grandTotal || order.totalPrice)?.toFixed(0)}</span>
              </div>
            </div>
          </section>

          {/* Timeline */}
          {Array.isArray(order.timeline) && order.timeline.length > 0 && (
            <section>
              <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wide mb-3">ไทม์ไลน์</h3>
              <ol className="relative border-l-2 border-orange-100 pl-5 flex flex-col gap-4">
                {[...order.timeline].reverse().map((t, i) => (
                  <li key={i} className="relative">
                    <span className="absolute -left-[25px] w-3 h-3 rounded-full bg-orange-400 border-2 border-white top-1" />
                    <p className="text-sm font-medium">{getLabel(t.status, order.orderType)} — {t.message}</p>
                    <p className="text-xs text-gray-400">{new Date(t.timestamp).toLocaleString('th-TH')}</p>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* Status update — เฉพาะสถานะที่อยู่ใน flow ของ orderType */}
          {order.status !== 'completed' && order.status !== 'cancelled' && (
            <section>
              <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wide mb-3">เปลี่ยนสถานะ</h3>
              <div className="flex flex-wrap gap-2">
                {availableStatus.map(s => (
                  <button
                    key={s}
                    onClick={() => handleStatusClick(s)}
                    disabled={!!loadingStatus}
                    className={`text-sm px-4 py-2 rounded-xl border transition-colors disabled:opacity-50 flex items-center gap-1.5 ${
                      s === 'cancelled'
                        ? 'border-red-200 text-red-500 hover:bg-red-50'
                        : 'border-gray-200 text-gray-600 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600'
                    }`}
                  >
                    {loadingStatus === s && (
                      <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    )}
                    {getLabel(s, order.orderType)}
                  </button>
                ))}
              </div>
            </section>
          )}

          {(order.status === 'completed' || order.status === 'cancelled') && (
            <div className="text-center text-sm text-gray-400 bg-gray-50 rounded-xl p-3">
              ออเดอร์นี้{order.status === 'completed' ? 'เสร็จสิ้นแล้ว' : 'ถูกยกเลิกแล้ว'}
            </div>
          )}

          <footer className="pt-2 border-t border-gray-100">
            <button onClick={handleDelete} className="text-sm text-red-500 hover:underline">ลบออเดอร์นี้</button>
          </footer>

        </div>
      </div>
    </div>
  );
}
