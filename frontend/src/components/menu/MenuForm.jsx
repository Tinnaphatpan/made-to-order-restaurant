'use client';
import { useState, useRef } from 'react';

export default function MenuForm({ categories, initial, onSave, onCancel }) {
  const [form, setForm] = useState({
    name:            initial?.name            || '',
    description:     initial?.description     || '',
    price:           initial?.price           || '',
    category:        initial?.category?._id   || initial?.category || '',
    image:           initial?.image           || '',
    preparationTime: initial?.preparationTime || 15,
    isAvailable:     initial?.isAvailable     ?? true,
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError('');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res  = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'อัพโหลดไม่สำเร็จ');
      setForm(prev => ({ ...prev, image: data.url }));
    } catch (err) {
      setUploadError(err.message);
    }
    setUploading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...form, price: Number(form.price), preparationTime: Number(form.preparationTime) });
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <header className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-lg">{initial ? 'แก้ไขเมนู' : 'เพิ่มเมนูใหม่'}</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </header>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {/* ชื่อเมนู */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">ชื่อเมนู *</label>
            <input name="name" value={form.name} onChange={handleChange} required
              className="input" />
          </div>

          {/* คำอธิบาย */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">คำอธิบาย</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={2}
              className="input resize-none" />
          </div>

          {/* ราคา + เวลาทำ */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">ราคา (฿) *</label>
              <input name="price" type="number" min="0" value={form.price} onChange={handleChange} required className="input" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">เวลาทำ (นาที)</label>
              <input name="preparationTime" type="number" min="1" value={form.preparationTime} onChange={handleChange} className="input" />
            </div>
          </div>

          {/* หมวดหมู่ */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">หมวดหมู่ *</label>
            <select name="category" value={form.category} onChange={handleChange} required className="input">
              <option value="">-- เลือกหมวดหมู่ --</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.icon} {cat.name}</option>
              ))}
            </select>
          </div>

          {/* รูปภาพ */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">รูปภาพ</label>

            {/* Preview */}
            {form.image && (
              <div className="relative">
                <img src={form.image} alt="preview"
                  className="h-36 w-full object-cover rounded-xl border border-gray-100"
                  onError={e => e.target.style.display = 'none'} />
                <button type="button" onClick={() => setForm(prev => ({ ...prev, image: '' }))}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 text-white text-xs flex items-center justify-center hover:bg-black/70">
                  ✕
                </button>
              </div>
            )}

            {/* อัพโหลดหรือใส่ URL */}
            <div className="flex gap-2">
              <input name="image" value={form.image} onChange={handleChange}
                placeholder="https://... หรืออัพโหลดไฟล์ →"
                className="input flex-1 text-sm" />
              <button type="button" onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="btn-secondary text-sm px-3 py-2 flex-shrink-0 disabled:opacity-50">
                {uploading ? (
                  <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin inline-block" />
                ) : '📁 เลือกไฟล์'}
              </button>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden" onChange={handleFileChange} />
            </div>

            {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}
          </div>

          {/* มีจำหน่าย */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input name="isAvailable" type="checkbox" checked={form.isAvailable} onChange={handleChange}
              className="w-4 h-4 accent-orange-500" />
            <span className="text-sm text-gray-700">มีจำหน่าย</span>
          </label>

          <footer className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1 justify-center">บันทึก</button>
            <button type="button" onClick={onCancel} className="btn-secondary flex-1 justify-center">ยกเลิก</button>
          </footer>
        </form>
      </div>
    </div>
  );
}
