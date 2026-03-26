'use client';
import { useState, useEffect } from 'react';
import MenuForm from '@/components/menu/MenuForm';

export default function AdminMenuPage() {
  const [items, setItems]         = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm]   = useState(false);
  const [editing, setEditing]     = useState(null);
  const [loading, setLoading]     = useState(true);

  const fetchData = () => {
    Promise.all([
      fetch('/api/menu').then(r => r.json()),
      fetch('/api/categories').then(r => r.json()),
    ]).then(([menuRes, catRes]) => {
      setItems(menuRes.data || []);
      setCategories(catRes.data || []);
      setLoading(false);
    });
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('ลบรายการนี้?')) return;
    await fetch(`/api/menu/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const handleToggleAvailable = async (item) => {
    await fetch(`/api/menu/${item._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isAvailable: !item.isAvailable }),
    });
    fetchData();
  };

  const handleSave = async (data) => {
    const url    = editing ? `/api/menu/${editing._id}` : '/api/menu';
    const method = editing ? 'PUT' : 'POST';
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setShowForm(false);
    setEditing(null);
    fetchData();
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">กำลังโหลด...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">จัดการเมนู</h1>
        <button className="btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}>
          + เพิ่มเมนู
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <MenuForm
          categories={categories}
          initial={editing}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">ชื่อ</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">หมวดหมู่</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">ราคา</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">สถานะ</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{item.name}</td>
                <td className="px-4 py-3 text-gray-500">{item.category?.icon} {item.category?.name}</td>
                <td className="px-4 py-3 text-right">฿{item.price.toFixed(2)}</td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => handleToggleAvailable(item)} className={`text-xs px-3 py-1 rounded-full font-medium ${item.isAvailable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {item.isAvailable ? 'มีจำหน่าย' : 'หมด'}
                  </button>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex gap-2 justify-center">
                    <button onClick={() => { setEditing(item); setShowForm(true); }} className="text-blue-500 hover:underline">แก้ไข</button>
                    <button onClick={() => handleDelete(item._id)} className="text-red-500 hover:underline">ลบ</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <p className="text-center text-gray-400 py-12">ยังไม่มีเมนู</p>}
      </div>
    </div>
  );
}
