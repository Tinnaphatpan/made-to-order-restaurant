'use client';
import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const AVATAR_PLACEHOLDER = '/uploads/default-avatar.png';

export default function ProfilePage() {
  const { data: session, update: updateSession, status } = useSession();
  const router = useRouter();

  const [profile, setProfile]       = useState(null);
  const [form, setForm]             = useState({ name: '', phone: '', address: '' });
  const [pwForm, setPwForm]         = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [saving, setSaving]         = useState(false);
  const [uploading, setUploading]   = useState(false);
  const [toast, setToast]           = useState(null);
  const [tab, setTab]               = useState('info'); // 'info' | 'password'
  const fileInputRef = useRef(null);

  // Redirect if not logged in
  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  // Fetch profile
  useEffect(() => {
    if (status !== 'authenticated') return;
    fetch('/api/users/me')
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          setProfile(res.data);
          setForm({ name: res.data.name || '', phone: res.data.phone || '', address: res.data.address || '' });
          setAvatarPreview(res.data.avatar || '');
        }
      });
  }, [status]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Handle avatar file select → preview
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showToast('ไฟล์ต้องไม่เกิน 5MB', 'error'); return; }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  // Upload avatar → get URL
  const uploadAvatar = async () => {
    if (!avatarFile) return avatarPreview;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', avatarFile);
    const res  = await fetch('/api/upload', { method: 'POST', body: fd });
    const data = await res.json();
    setUploading(false);
    if (!data.success) throw new Error(data.error);
    return data.url;
  };

  // Save profile info
  const handleSaveInfo = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const avatarUrl = await uploadAvatar();
      const res  = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, avatar: avatarUrl }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      // Update NextAuth session
      await updateSession({ name: form.name, avatar: avatarUrl, phone: form.phone });
      setProfile(data.data);
      setAvatarFile(null);
      setAvatarPreview(avatarUrl);
      showToast('บันทึกข้อมูลเรียบร้อยแล้ว ✅');
    } catch (err) {
      showToast(err.message, 'error');
    }
    setSaving(false);
  };

  // Change password
  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) {
      showToast('รหัสผ่านใหม่ไม่ตรงกัน', 'error'); return;
    }
    setSaving(true);
    try {
      const res  = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
      showToast('เปลี่ยนรหัสผ่านเรียบร้อยแล้ว ✅');
    } catch (err) {
      showToast(err.message, 'error');
    }
    setSaving(false);
  };

  if (status === 'loading' || !profile) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const displayAvatar = avatarPreview || AVATAR_PLACEHOLDER;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
          toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Avatar section */}
      <section className="card p-8 mb-6 flex flex-col items-center text-center">
        <div className="relative group mb-4">
          <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100">
            {avatarPreview ? (
              <img src={displayAvatar} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl bg-orange-50 text-orange-300">
                {profile.name?.[0]?.toUpperCase() || '👤'}
              </div>
            )}
          </div>

          {/* Upload overlay */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 rounded-full bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            title="เปลี่ยนรูปโปรไฟล์"
          >
            <span className="text-white text-xl">📷</span>
            <span className="text-white text-xs mt-1">เปลี่ยนรูป</span>
          </button>

          {uploading && (
            <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleAvatarChange}
        />

        <h1 className="text-xl font-bold">{profile.name}</h1>
        <p className="text-gray-400 text-sm">{profile.email}</p>
        {profile.phone && <p className="text-gray-400 text-sm mt-0.5">📞 {profile.phone}</p>}

        {avatarFile && (
          <p className="mt-3 text-xs text-orange-500 bg-orange-50 px-3 py-1.5 rounded-full">
            📎 {avatarFile.name} — กด "บันทึก" เพื่ออัพโหลด
          </p>
        )}
      </section>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6">
        {[
          { key: 'info',     label: '👤 ข้อมูลส่วนตัว' },
          { key: 'password', label: '🔒 เปลี่ยนรหัสผ่าน' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              tab === t.key ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Info */}
      {tab === 'info' && (
        <section className="card p-6">
          <form onSubmit={handleSaveInfo} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">ชื่อ - นามสกุล *</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                required className="input" placeholder="ชื่อของคุณ" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">อีเมล</label>
              <input value={profile.email} disabled
                className="input bg-gray-50 text-gray-400 cursor-not-allowed" />
              <p className="text-xs text-gray-400">ไม่สามารถเปลี่ยนอีเมลได้</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">เบอร์โทรศัพท์</label>
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                placeholder="08x-xxx-xxxx" type="tel" className="input" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">ที่อยู่จัดส่ง</label>
              <textarea value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
                rows={3} placeholder="บ้านเลขที่, ถนน, แขวง, เขต, จังหวัด, รหัสไปรษณีย์"
                className="input resize-none" />
            </div>

            <button type="submit" disabled={saving}
              className="btn-primary w-full justify-center py-3 disabled:opacity-60">
              {saving ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> กำลังบันทึก...</>
              ) : 'บันทึกข้อมูล'}
            </button>
          </form>
        </section>
      )}

      {/* Tab: Password */}
      {tab === 'password' && (
        <section className="card p-6">
          <form onSubmit={handleSavePassword} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">รหัสผ่านเดิม *</label>
              <input type="password" value={pwForm.currentPassword}
                onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                required placeholder="••••••••" className="input" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">รหัสผ่านใหม่ *</label>
              <input type="password" value={pwForm.newPassword}
                onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })}
                required minLength={6} placeholder="อย่างน้อย 6 ตัวอักษร" className="input" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">ยืนยันรหัสผ่านใหม่ *</label>
              <input type="password" value={pwForm.confirm}
                onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })}
                required placeholder="พิมพ์รหัสผ่านใหม่อีกครั้ง" className="input" />
            </div>

            <button type="submit" disabled={saving}
              className="btn-primary w-full justify-center py-3 disabled:opacity-60">
              {saving ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> กำลังบันทึก...</>
              ) : 'เปลี่ยนรหัสผ่าน'}
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
