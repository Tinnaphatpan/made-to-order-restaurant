'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

const ORDER_TYPES = [
  { value: 'dine-in',  icon: '🪑', label: 'ทานที่ร้าน' },
  { value: 'takeaway', icon: '🥡', label: 'กลับบ้าน'  },
  { value: 'delivery', icon: '🛵', label: 'จัดส่ง'    },
];

const DELIVERY_FEE = 40; // ฿

export default function Cart({ cart, setCart, onOrderSuccess, defaultTable }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [orderType, setOrderType]           = useState('dine-in');
  const [tableNumber, setTableNumber]       = useState(defaultTable || '');
  const [customerName, setCustomerName]     = useState('');
  const [customerPhone, setCustomerPhone]   = useState('');
  const [note, setNote]                     = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState('');

  const totalPrice  = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = orderType === 'delivery' ? DELIVERY_FEE : 0;
  const grandTotal  = totalPrice + deliveryFee;

  const updateQty  = (id, delta) =>
    setCart(prev => prev.map(item => item._id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item));
  const removeItem = (id) => setCart(prev => prev.filter(item => item._id !== id));

  // รับเฉพาะตัวเลข ไม่เกิน 10 หลัก
  const handlePhone = (e) =>
    setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10));

  const handleOrder = async () => {
    if (cart.length === 0) return;

    // Validate
    if (!customerName.trim()) { setError('กรุณากรอกชื่อผู้สั่ง'); return; }
    if (customerPhone && customerPhone.length < 9) { setError('เบอร์โทรต้องมีอย่างน้อย 9 หลัก'); return; }
    if (orderType === 'dine-in' && !tableNumber.trim()) { setError('กรุณากรอกเลขโต๊ะ'); return; }
    if (orderType === 'delivery' && !deliveryAddress.trim()) { setError('กรุณากรอกที่อยู่จัดส่ง'); return; }
    if (orderType === 'delivery' && !customerPhone) { setError('กรุณากรอกเบอร์โทรสำหรับการจัดส่ง'); return; }

    setSubmitting(true);
    setError('');

    const payload = {
      orderType,
      tableNumber:   orderType === 'dine-in' ? tableNumber.trim() : '',
      customerName:  customerName.trim(),
      customerPhone: customerPhone.trim(),
      note:          note.trim(),
      deliveryFee,
      delivery:      orderType === 'delivery'
        ? { address: deliveryAddress.trim(), fee: DELIVERY_FEE }
        : null,
      items: cart.map(item => ({
        menuItem: item._id,
        name:     item.name,
        price:    item.price,
        quantity: item.quantity,
      })),
    };

    const res  = await fetch('/api/orders', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });
    const data = await res.json();
    setSubmitting(false);

    if (data.success) {
      const orderId = data.data._id || data.data.id;
      setCart([]);
      setTableNumber(''); setCustomerName(''); setCustomerPhone('');
      setNote(''); setDeliveryAddress('');
      onOrderSuccess?.();
      // redirect ไปหน้าติดตามออเดอร์ทันที
      router.push(`/orders/${orderId}`);
    } else {
      setSubmitting(false);
      setError(data.error || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
    }
  };

  return (
    <div className="card p-5 sticky top-24">
      <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
        🛒 ตะกร้า
        {cart.length > 0 && (
          <span className="bg-orange-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
            {cart.reduce((s, i) => s + i.quantity, 0)}
          </span>
        )}
      </h2>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 text-sm text-center">
          {error}
        </div>
      )}

{cart.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <p className="text-3xl mb-2">🍽️</p>
          <p className="text-sm">ยังไม่มีรายการในตะกร้า</p>
        </div>
      ) : (
        <>
          {/* รายการสินค้า */}
          <ul className="flex flex-col gap-2 mb-4 max-h-64 overflow-y-auto pr-1">
            {cart.map(item => (
              <li key={item._id} className="flex items-center gap-2 text-sm py-1">
                <span className="flex-1 font-medium leading-tight">{item.name}</span>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => updateQty(item._id, -1)}
                    className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-xs font-bold transition-colors">−</button>
                  <span className="w-5 text-center font-semibold">{item.quantity}</span>
                  <button onClick={() => updateQty(item._id, +1)}
                    className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-xs font-bold transition-colors">+</button>
                </div>
                <span className="w-14 text-right text-orange-600 font-semibold flex-shrink-0">
                  ฿{(item.price * item.quantity).toFixed(0)}
                </span>
                <button onClick={() => removeItem(item._id)}
                  className="text-gray-300 hover:text-red-400 transition-colors text-base leading-none flex-shrink-0">✕</button>
              </li>
            ))}
          </ul>

          {/* ยอดรวม */}
          <div className="border-t border-gray-100 pt-3 mb-4">
            <div className="flex justify-between text-sm text-gray-500 mb-1">
              <span>ค่าอาหาร</span>
              <span>฿{totalPrice.toFixed(0)}</span>
            </div>
            {deliveryFee > 0 && (
              <div className="flex justify-between text-sm text-gray-500 mb-1">
                <span>ค่าจัดส่ง</span>
                <span>฿{deliveryFee}</span>
              </div>
            )}
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm font-semibold text-gray-700">รวมทั้งหมด</span>
              <span className="font-bold text-lg text-orange-500">฿{grandTotal.toFixed(0)}</span>
            </div>
          </div>

          {/* ประเภทออเดอร์ */}
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-500 mb-2">ประเภทการสั่ง</p>
            <div className="grid grid-cols-3 gap-1.5">
              {ORDER_TYPES.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setOrderType(t.value)}
                  className={`flex flex-col items-center gap-0.5 py-2 rounded-xl border text-xs font-medium transition-colors ${
                    orderType === t.value
                      ? 'border-orange-400 bg-orange-50 text-orange-600'
                      : 'border-gray-200 bg-white text-gray-500 hover:border-orange-200'
                  }`}
                >
                  <span className="text-base">{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* ข้อมูลผู้สั่ง */}
          <div className="flex flex-col gap-2 mb-4">
            <input
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              placeholder="ชื่อผู้สั่ง *"
              maxLength={50}
              className="input text-sm"
            />
            <div className="relative">
              <input
                value={customerPhone}
                onChange={handlePhone}
                placeholder={orderType === 'delivery' ? 'เบอร์โทร * (10 หลัก)' : 'เบอร์โทร (10 หลัก)'}
                type="tel"
                inputMode="numeric"
                maxLength={10}
                className="input text-sm pr-12"
              />
              <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs ${
                customerPhone.length === 10 ? 'text-green-500' : 'text-gray-400'
              }`}>
                {customerPhone.length}/10
              </span>
            </div>

            {orderType === 'dine-in' && (
              <input
                value={tableNumber}
                onChange={e => setTableNumber(e.target.value)}
                placeholder="เลขโต๊ะ *"
                className="input text-sm"
              />
            )}

            {orderType === 'delivery' && (
              <textarea
                value={deliveryAddress}
                onChange={e => setDeliveryAddress(e.target.value)}
                placeholder="ที่อยู่จัดส่ง * (บ้านเลขที่ ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด)"
                rows={3}
                maxLength={300}
                className="input text-sm resize-none"
              />
            )}

            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="หมายเหตุเพิ่มเติม (เช่น ไม่ใส่ผัก, เผ็ดน้อย)"
              rows={2}
              maxLength={200}
              className="input text-sm resize-none"
            />
          </div>

          <button
            onClick={handleOrder}
            disabled={submitting}
            className="btn-primary w-full justify-center py-3 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                กำลังสั่ง...
              </>
            ) : `${ORDER_TYPES.find(t => t.value === orderType)?.icon} สั่งอาหาร ฿${grandTotal.toFixed(0)}`}
          </button>
        </>
      )}
    </div>
  );
}
