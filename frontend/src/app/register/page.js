'use client';
import { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm]     = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm) {
      setError('รหัสผ่านไม่ตรงกัน');
      return;
    }

    setLoading(true);
    const res  = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone, password: form.password }),
    });
    const data = await res.json();
    setLoading(false);

    if (!data.success) {
      setError(data.error || 'สมัครสมาชิกไม่สำเร็จ');
      return;
    }

    // Auto login after register
    await signIn('credentials', { email: form.email, password: form.password, redirect: false });
    router.push('/profile');
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 bg-gray-50 py-10">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-5xl">👤</span>
          <h1 className="mt-3 text-2xl font-bold text-gray-900">สมัครสมาชิก</h1>
          <p className="text-gray-500 text-sm mt-1">สร้างบัญชีเพื่อสั่งอาหารได้ง่ายขึ้น</p>
        </div>

        <div className="card p-8">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-sm font-medium text-gray-700">ชื่อ - นามสกุล *</label>
              <input id="name" name="name" type="text" required value={form.name}
                onChange={handleChange} placeholder="สมชาย ใจดี" className="input" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">อีเมล *</label>
              <input id="email" name="email" type="email" required value={form.email}
                onChange={handleChange} placeholder="example@email.com" className="input" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="phone" className="text-sm font-medium text-gray-700">เบอร์โทร</label>
              <input id="phone" name="phone" type="tel" value={form.phone}
                onChange={handleChange} placeholder="08x-xxx-xxxx" className="input" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">รหัสผ่าน *</label>
              <input id="password" name="password" type="password" required minLength={6}
                value={form.password} onChange={handleChange} placeholder="อย่างน้อย 6 ตัวอักษร" className="input" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirm" className="text-sm font-medium text-gray-700">ยืนยันรหัสผ่าน *</label>
              <input id="confirm" name="confirm" type="password" required value={form.confirm}
                onChange={handleChange} placeholder="พิมพ์รหัสผ่านอีกครั้ง" className="input" />
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full justify-center py-3 rounded-xl mt-1 disabled:opacity-60">
              {loading ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}
            </button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-3 text-gray-400">หรือสมัครด้วย</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => signIn('google', { callbackUrl: '/profile' })}
            className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.14 0 5.95 1.08 8.17 2.86l6.09-6.09C34.46 3.09 29.5 1 24 1 14.82 1 7.07 6.48 3.64 14.22l7.08 5.5C12.46 13.37 17.76 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.5 24.5c0-1.64-.15-3.22-.42-4.75H24v9h12.67c-.55 2.97-2.2 5.48-4.67 7.17l7.19 5.58C43.27 37.6 46.5 31.48 46.5 24.5z"/>
              <path fill="#FBBC05" d="M10.72 28.28A14.56 14.56 0 0 1 9.5 24c0-1.49.26-2.93.72-4.28l-7.08-5.5A23.94 23.94 0 0 0 0 24c0 3.86.92 7.51 2.55 10.72l8.17-6.44z"/>
              <path fill="#34A853" d="M24 47c5.5 0 10.12-1.82 13.5-4.95l-7.19-5.58c-1.88 1.26-4.28 2.03-6.31 2.03-6.24 0-11.54-3.87-13.28-9.22l-8.17 6.44C7.07 41.52 14.82 47 24 47z"/>
            </svg>
            สมัครสมาชิกด้วย Google
          </button>

          <p className="text-center text-sm text-gray-500 mt-5">
            มีบัญชีแล้ว?{' '}
            <Link href="/login" className="text-orange-500 font-medium hover:underline">เข้าสู่ระบบ</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
