'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

// step ตามประเภทออเดอร์
const STEPS = {
  'dine-in': [
    { key: 'pending',   icon: '⏳', label: 'รับออเดอร์'        },
    { key: 'confirmed', icon: '✅', label: 'ยืนยันออเดอร์'     },
    { key: 'preparing', icon: '👨‍🍳', label: 'กำลังเตรียมอาหาร' },
    { key: 'ready',     icon: '🔔', label: 'พร้อมเสิร์ฟ'       },
    { key: 'completed', icon: '🎉', label: 'เสร็จสิ้น'         },
  ],
  'takeaway': [
    { key: 'pending',   icon: '⏳', label: 'รับออเดอร์'         },
    { key: 'confirmed', icon: '✅', label: 'ยืนยันออเดอร์'      },
    { key: 'preparing', icon: '👨‍🍳', label: 'กำลังเตรียมอาหาร' },
    { key: 'ready',     icon: '📦', label: 'พร้อมรับ'           },
    { key: 'completed', icon: '🎉', label: 'เสร็จสิ้น'          },
  ],
  'delivery': [
    { key: 'pending',    icon: '⏳', label: 'รับออเดอร์'         },
    { key: 'confirmed',  icon: '✅', label: 'ยืนยันออเดอร์'      },
    { key: 'preparing',  icon: '👨‍🍳', label: 'กำลังเตรียมอาหาร' },
    { key: 'ready',      icon: '📦', label: 'พร้อมส่ง'           },
    { key: 'delivering', icon: '🛵', label: 'กำลังจัดส่ง'        },
    { key: 'completed',  icon: '🎉', label: 'เสร็จสิ้น'          },
  ],
};

export default function OrderTrackingPage() {
  const { id } = useParams();
  const [order, setOrder]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then(r => r.json())
      .then(res => {
        if (res.success && res.data) { setOrder(res.data); setError(''); }
        else setError(res.error || 'ไม่พบออเดอร์นี้');
        setLoading(false);
      })
      .catch(() => { setError('ไม่สามารถโหลดข้อมูลได้'); setLoading(false); });

    const es = new EventSource(`/api/orders/${id}/stream`);
    es.onopen    = () => setConnected(true);
    es.onmessage = (e) => {
      try {
        const { order: updated, error: err } = JSON.parse(e.data);
        if (err)     { setError(err); return; }
        if (updated) { setOrder(updated); setError(''); setLoading(false); }
      } catch {}
    };
    es.onerror = () => setConnected(false);
    return () => es.close();
  }, [id]);

  if (loading) return (
    <div className="flex justify-center items-center h-64 text-gray-400">
      <div className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error || !order) return (
    <div className="text-center py-20">
      <p className="text-4xl mb-3">😕</p>
      <p className="text-gray-500 mb-4">{error || 'ไม่พบออเดอร์นี้'}</p>
      <Link href="/orders" className="text-orange-500 hover:underline text-sm">← กลับไปดูออเดอร์</Link>
    </div>
  );

  const steps          = STEPS[order.orderType] || STEPS['dine-in'];
  const currentStepIdx = steps.findIndex(s => s.key === order.status);

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <Link href="/orders" className="text-sm text-gray-400 hover:text-gray-600 mb-6 inline-block">← ออเดอร์ทั้งหมด</Link>

      {/* Order header */}
      <header className="card p-6 mb-6 text-center animate-fade-up">
        <p className="text-sm text-gray-400 mb-1">หมายเลขออเดอร์</p>
        <h1 className="text-3xl font-bold text-orange-500 mb-2">{order.orderNumber}</h1>
        <p className="text-sm text-gray-500">
          {order.customerName}
          {order.customerPhone && <span> · 📞 {order.customerPhone}</span>}
          {order.tableNumber   && <span> · โต๊ะ {order.tableNumber}</span>}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {order.orderType === 'delivery' ? '🛵 จัดส่ง' : order.orderType === 'takeaway' ? '🥡 กลับบ้าน' : '🪑 ทานที่ร้าน'}
        </p>
        <p className="text-xs mt-2 flex items-center justify-center gap-1.5 text-gray-400">
          <span className={`w-2 h-2 rounded-full inline-block ${connected ? 'bg-green-400 animate-pulse' : 'bg-gray-300'}`} />
          {connected ? 'Real-time' : 'กำลังเชื่อมต่อ...'}
        </p>
      </header>

      {/* Progress stepper */}
      {order.status !== 'cancelled' && (
        <section className="card p-6 mb-6 animate-fade-up">
          <h2 className="font-semibold mb-6 text-center text-gray-700">ติดตามสถานะ</h2>
          <ol className="flex flex-col gap-0">
            {steps.map((step, i) => {
              const isDone    = i < currentStepIdx;
              const isCurrent = i === currentStepIdx;
              const isPending = i > currentStepIdx;
              return (
                <li key={step.key} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 flex-shrink-0 ${
                      isDone    ? 'bg-green-500 border-green-500 text-white' :
                      isCurrent ? 'bg-orange-500 border-orange-500 text-white animate-pulse' :
                                  'bg-white border-gray-200 text-gray-300'
                    }`}>
                      {isDone ? '✓' : step.icon}
                    </div>
                    {i < steps.length - 1 && (
                      <div className={`w-0.5 h-8 mt-1 ${isDone ? 'bg-green-400' : 'bg-gray-100'}`} />
                    )}
                  </div>
                  <div className="pt-2 pb-6">
                    <p className={`font-medium text-sm ${isCurrent ? 'text-orange-600' : isPending ? 'text-gray-400' : 'text-gray-700'}`}>
                      {step.label}
                      {isCurrent && <span className="ml-2 text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">ตอนนี้</span>}
                    </p>
                    {Array.isArray(order.timeline) && order.timeline.filter(t => t.status === step.key).map((t, ti) => (
                      <p key={ti} className="text-xs text-gray-400 mt-0.5">
                        {new Date(t.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                        {t.message && ` · ${t.message}`}
                      </p>
                    ))}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {order.status === 'cancelled' && (
        <div className="card p-6 mb-6 text-center bg-red-50 border-red-100 animate-fade-up">
          <p className="text-4xl mb-2">❌</p>
          <p className="font-semibold text-red-600">ออเดอร์ถูกยกเลิก</p>
        </div>
      )}

      {/* Delivery info */}
      {order.orderType === 'delivery' && order.delivery?.address && (
        <section className="card p-5 mb-6 animate-fade-up">
          <h2 className="font-semibold mb-3">🛵 ข้อมูลการจัดส่ง</h2>
          <div className="text-sm text-gray-600 flex flex-col gap-1.5">
            <p>📍 {order.delivery.address}</p>
            {order.delivery.riderName    && <p>🧑 ผู้ส่ง: {order.delivery.riderName}</p>}
            {order.delivery.trackingNote && <p>📝 {order.delivery.trackingNote}</p>}
            {order.delivery.fee > 0      && <p>💳 ค่าส่ง: ฿{order.delivery.fee}</p>}
          </div>
        </section>
      )}

      {/* Items */}
      <section className="card p-5 mb-4 animate-fade-up">
        <h2 className="font-semibold mb-3">รายการอาหาร</h2>
        <ul className="flex flex-col gap-2 text-sm">
          {order.items.map((item, i) => (
            <li key={i} className="flex justify-between">
              <span>{item.name} × {item.quantity}</span>
              <span className="font-medium">฿{(item.price * item.quantity).toFixed(0)}</span>
            </li>
          ))}
        </ul>
        <div className="border-t border-gray-100 mt-3 pt-3 text-sm flex flex-col gap-1">
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
    </div>
  );
}
