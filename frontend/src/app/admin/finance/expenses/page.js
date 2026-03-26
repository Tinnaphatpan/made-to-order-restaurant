'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const CATEGORIES = ['วัตถุดิบ', 'ค่าน้ำไฟ', 'ค่าแรง', 'ค่าเช่า', 'อุปกรณ์', 'การตลาด', 'อื่นๆ'];

const emptyForm = { title: '', amount: '', category: 'วัตถุดิบ', date: new Date().toISOString().split('T')[0], note: '' };

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm]         = useState(emptyForm);
  const [editing, setEditing]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchExpenses = () => {
    fetch('/api/expenses').then(r => r.json()).then(res => {
      setExpenses(res.data || []);
      setLoading(false);
    });
  };

  useEffect(() => { fetchExpenses(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url    = editing ? `/api/expenses/${editing._id}` : '/api/expenses';
    const method = editing ? 'PUT' : 'POST';
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, amount: Number(form.amount) }),
    });
    setForm(emptyForm);
    setEditing(null);
    setShowForm(false);
    fetchExpenses();
  };

  const handleEdit = (exp) => {
    setEditing(exp);
    setForm({ title: exp.title, amount: exp.amount, category: exp.category, date: exp.date?.split('T')[0] || '', note: exp.note || '' });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('ลบรายการนี้?')) return;
    await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
    fetchExpenses();
  };

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="p-6">
      <header className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin/finance" className="text-gray-400 hover:text-gray-600 text-sm">← รายรับรายจ่าย</Link>
          </div>
          <h1 className="page-title">บันทึกค่าใช้จ่าย</h1>
        </div>
        <button onClick={() => { setEditing(null); setForm(emptyForm); setShowForm(true); }} className="btn-primary text-sm">
          + เพิ่มรายการ
        </button>
      </header>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <header className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold">{editing ? 'แก้ไขค่าใช้จ่าย' : 'เพิ่มค่าใช้จ่าย'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </header>
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">รายการ *</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="เช่น ซื้อผัก, ค่าน้ำมัน" required className="input" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">จำนวน (฿) *</label>
                  <input type="number" min="0" step="0.01" value={form.amount}
                    onChange={e => setForm({ ...form, amount: e.target.value })} required className="input" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">วันที่</label>
                  <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="input" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">หมวดหมู่</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">หมายเหตุ</label>
                <input value={form.note} onChange={e => setForm({ ...form, note: e.target.value })}
                  placeholder="รายละเอียดเพิ่มเติม" className="input" />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" className="btn-primary flex-1 justify-center">บันทึก</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1 justify-center">ยกเลิก</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Total */}
      <div className="card p-4 mb-6 flex items-center justify-between bg-red-50 border-red-100">
        <span className="text-sm font-medium text-red-600">ค่าใช้จ่ายทั้งหมด</span>
        <span className="text-xl font-bold text-red-600">฿{total.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16 text-gray-400">
          <div className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">รายการ</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">หมวดหมู่</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">วันที่</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">จำนวน</th>
                <th className="text-center px-4 py-3 font-medium text-gray-500">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map(exp => (
                <tr key={exp._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium">{exp.title}</p>
                    {exp.note && <p className="text-xs text-gray-400">{exp.note}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">{exp.category}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{new Date(exp.date).toLocaleDateString('th-TH')}</td>
                  <td className="px-4 py-3 text-right font-semibold text-red-600">฿{exp.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex gap-3 justify-center">
                      <button onClick={() => handleEdit(exp)} className="text-blue-500 hover:underline">แก้ไข</button>
                      <button onClick={() => handleDelete(exp._id)} className="text-red-500 hover:underline">ลบ</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {expenses.length === 0 && <p className="text-center text-gray-400 py-12">ยังไม่มีรายการค่าใช้จ่าย</p>}
        </div>
      )}
    </div>
  );
}
