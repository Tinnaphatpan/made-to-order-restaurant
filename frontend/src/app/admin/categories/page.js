'use client';
import { useState, useEffect } from 'react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', icon: '🍽️' });
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCategories = () => {
    fetch('/api/categories').then(r => r.json()).then(res => {
      setCategories(res.data || []);
      setLoading(false);
    });
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url    = editing ? `/api/categories/${editing._id}` : '/api/categories';
    const method = editing ? 'PUT' : 'POST';
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setForm({ name: '', description: '', icon: '🍽️' });
    setEditing(null);
    fetchCategories();
  };

  const handleEdit = (cat) => {
    setEditing(cat);
    setForm({ name: cat.name, description: cat.description, icon: cat.icon });
  };

  const handleDelete = async (id) => {
    if (!confirm('ลบหมวดหมู่นี้?')) return;
    await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    fetchCategories();
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">กำลังโหลด...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">จัดการหมวดหมู่</h1>

      {/* Form */}
      <section className="card p-6 mb-8">
        <h2 className="font-semibold mb-4">{editing ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่ใหม่'}</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-4">
            <input value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })}
              placeholder="Icon (emoji)" className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-400" />
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="ชื่อหมวดหมู่" required
              className="col-span-2 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-400" />
          </div>
          <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="คำอธิบาย (ไม่บังคับ)"
            className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-400" />
          <div className="flex gap-2">
            <button type="submit" className="btn-primary">{editing ? 'บันทึก' : 'เพิ่ม'}</button>
            {editing && <button type="button" className="btn-secondary" onClick={() => { setEditing(null); setForm({ name: '', description: '', icon: '🍽️' }); }}>ยกเลิก</button>}
          </div>
        </form>
      </section>

      {/* List */}
      <ul className="flex flex-col gap-3">
        {categories.map(cat => (
          <li key={cat._id} className="card px-5 py-4 flex items-center justify-between">
            <span className="text-lg">{cat.icon} <span className="font-medium ml-1">{cat.name}</span></span>
            <div className="flex gap-3">
              <button onClick={() => handleEdit(cat)} className="text-blue-500 text-sm hover:underline">แก้ไข</button>
              <button onClick={() => handleDelete(cat._id)} className="text-red-500 text-sm hover:underline">ลบ</button>
            </div>
          </li>
        ))}
        {categories.length === 0 && <p className="text-center text-gray-400 py-8">ยังไม่มีหมวดหมู่</p>}
      </ul>
    </div>
  );
}
