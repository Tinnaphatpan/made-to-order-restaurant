'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const PERIODS = [
  { key: 'today', label: 'วันนี้' },
  { key: 'week',  label: 'สัปดาห์นี้' },
  { key: 'month', label: 'เดือนนี้' },
];

export default function FinancePage() {
  const [period, setPeriod] = useState('today');
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/finance?period=${period}`)
      .then(r => r.json())
      .then(res => { setData(res.data); setLoading(false); });
  }, [period]);

  const summaryCards = data ? [
    { label: 'รายรับ',  value: data.revenue,  icon: '💚', color: 'bg-green-50  text-green-600',  prefix: '฿' },
    { label: 'รายจ่าย', value: data.expenses, icon: '🔴', color: 'bg-red-50    text-red-600',    prefix: '฿' },
    { label: 'กำไร',    value: data.profit,   icon: data.profit >= 0 ? '📈' : '📉',
      color: data.profit >= 0 ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600', prefix: '฿' },
    { label: 'ออเดอร์ที่เสร็จ', value: data.revenueOrderCount, icon: '📋', color: 'bg-orange-50 text-orange-600', prefix: '' },
  ] : [];

  return (
    <div className="p-6">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">รายรับ - รายจ่าย</h1>
          <p className="text-sm text-gray-400 mt-0.5">ภาพรวมการเงินของร้าน</p>
        </div>
        <Link href="/admin/finance/expenses" className="btn-primary text-sm">
          + บันทึกค่าใช้จ่าย
        </Link>
      </header>

      {/* Period selector */}
      <div className="flex gap-2 mb-6">
        {PERIODS.map(p => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-colors ${
              period === p.key ? 'bg-orange-500 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="card p-5 h-28 animate-pulse bg-gray-100 rounded-2xl" />
          ))}
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {summaryCards.map(c => (
              <div key={c.label} className={`card p-5 ${c.color}`}>
                <p className="text-2xl mb-2">{c.icon}</p>
                <p className="text-2xl font-bold">
                  {c.prefix}{typeof c.value === 'number' ? c.value.toLocaleString('th-TH', { minimumFractionDigits: 2 }) : c.value}
                </p>
                <p className="text-xs opacity-70 mt-1">{c.label}</p>
              </div>
            ))}
          </section>

          {/* Expense by category */}
          {data?.expenseByCategory?.length > 0 && (
            <section className="card p-6 mb-6">
              <h2 className="font-semibold mb-4">ค่าใช้จ่ายแยกตามหมวดหมู่</h2>
              <div className="flex flex-col gap-3">
                {data.expenseByCategory.map(cat => {
                  const pct = data.expenses > 0 ? (cat.total / data.expenses) * 100 : 0;
                  return (
                    <div key={cat._id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{cat._id}</span>
                        <span className="font-medium">฿{cat.total.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-400 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Daily revenue chart */}
          {data?.dailyRevenue?.length > 0 && (
            <section className="card p-6 mb-6">
              <h2 className="font-semibold mb-4">รายรับรายวัน</h2>
              <div className="flex items-end gap-2 h-32">
                {data.dailyRevenue.map(d => {
                  const maxVal = Math.max(...data.dailyRevenue.map(x => x.revenue));
                  const pct    = maxVal > 0 ? (d.revenue / maxVal) * 100 : 0;
                  return (
                    <div key={d._id} className="flex flex-col items-center gap-1 flex-1 min-w-0">
                      <span className="text-xs text-gray-400 font-medium">฿{(d.revenue/1000).toFixed(1)}k</span>
                      <div className="w-full bg-orange-500 rounded-t-lg transition-all duration-500" style={{ height: `${Math.max(pct, 4)}%` }} />
                      <span className="text-xs text-gray-400 truncate w-full text-center">{d._id.slice(5)}</span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Orders by status */}
          {data?.ordersByStatus?.length > 0 && (
            <section className="card p-6">
              <h2 className="font-semibold mb-4">ออเดอร์แยกตามสถานะ</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {data.ordersByStatus.map(s => (
                  <div key={s._id} className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold">{s.count}</p>
                    <p className="text-xs text-gray-500 mt-1">{s._id}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
