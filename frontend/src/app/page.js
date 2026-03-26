'use client';
import Link from 'next/link';

const featuredDishes = [
  { name: 'ต้มยำกุ้ง',         image: '/images/ต้มยำ.jpg',             price: 150 },
  { name: 'สเต็กเนื้อ',         image: '/images/สเต็ก.jpg',             price: 280 },
  { name: 'ข้าวผัดทะเล',        image: '/images/ข้าวผัดทะเล.jpg',       price: 120 },
  { name: 'ชีสเค้ก',            image: '/images/ชีสเค้ก.jpg',           price: 120 },
  { name: 'มัทฉะลาเต้',         image: '/images/มัทฉะลาเต้.jpg',        price: 95  },
  { name: 'ข้าวเหนียวมะม่วง',   image: '/images/ข้างเหนียวมะม่วง.jpg',  price: 80  },
];

const features = [
  { icon: '🥘', title: 'วัตถุดิบสด',      desc: 'คัดสรรวัตถุดิบคุณภาพสูง สดใหม่ทุกวัน' },
  { icon: '⚡', title: 'สั่งง่าย รวดเร็ว', desc: 'เลือกเมนู ใส่ตะกร้า สั่งได้ทันที' },
  { icon: '📍', title: 'ติดตามออเดอร์',   desc: 'รู้ทุกขั้นตอน แบบ real-time' },
  { icon: '🛵', title: 'บริการจัดส่ง',    desc: 'ทั้งนั่งทาน กลับบ้าน และเดลิเวอรี่' },
];

const delayMap = [
  'animate-scale-in-delay-1',
  'animate-scale-in-delay-2',
  'animate-scale-in-delay-3',
  'animate-scale-in-delay-4',
  'animate-scale-in-delay-5',
];

export default function HomePage() {
  return (
    <div className="min-h-screen">

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden min-h-[92vh] flex items-center justify-center pt-16">

        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/พื้นหลังร้านอาหาร.jpg')" }}
        />

        {/* Overlay — ไล่สีส้มเข้มด้านล่าง + สีเข้มด้านบน */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-orange-900/80" />

        {/* Decorative floating blobs */}
        <div className="absolute top-24 right-10 w-48 h-48 bg-orange-400/20 rounded-full blur-3xl animate-float-slow pointer-events-none" />
        <div className="absolute bottom-32 left-10 w-64 h-64 bg-amber-300/15 rounded-full blur-3xl animate-float pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <span className="animate-fade-in inline-block bg-white/15 backdrop-blur-sm text-white/90 text-sm font-medium px-5 py-2 rounded-full mb-6 border border-white/20">
            🍽️ ร้านอาหาร Made-to-Order
          </span>

          <h1 className="animate-fade-up text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6 drop-shadow-lg">
            อร่อยทุกคำ
            <br/>
            <span className="text-amber-300">สั่งได้ทุกเมนู</span>
          </h1>

          <p className="animate-fade-up-delay-1 text-white/80 text-lg md:text-xl mb-10 max-w-xl mx-auto leading-relaxed">
            อาหารสดใหม่ รสชาติต้นตำรับ เสิร์ฟร้อนๆ ถึงมือคุณ<br/>
            ทั้งนั่งทานที่ร้าน กลับบ้าน และเดลิเวอรี่
          </p>

          <div className="animate-fade-up-delay-2 flex flex-wrap gap-4 justify-center">
            <Link href="/menu"
              className="animate-pulse-glow inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold px-9 py-4 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-200 text-lg">
              🍜 สั่งอาหารเลย
            </Link>
            <Link href="/orders"
              className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white font-semibold px-9 py-4 rounded-2xl border border-white/30 hover:bg-white/25 transition-all duration-200 text-lg">
              📋 ติดตามออเดอร์
            </Link>
          </div>

          {/* Stats */}
          <div className="animate-fade-up-delay-3 flex justify-center gap-10 mt-14 text-white/80">
            {[['18+', 'เมนูอาหาร'], ['4', 'หมวดหมู่'], ['⭐ 4.9', 'คะแนนร้าน']].map(([val, label]) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-extrabold text-white">{val}</p>
                <p className="text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 70" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 70L80 58C160 46 320 22 480 16C640 10 800 22 960 32C1120 42 1280 50 1360 54L1440 58V70H0Z" fill="#f9fafb"/>
          </svg>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────── */}
      <section className="bg-gray-50 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="animate-fade-in text-orange-500 font-semibold text-sm mb-2 uppercase tracking-widest">Why Us</p>
            <h2 className="animate-fade-up text-3xl font-bold text-gray-800">ทำไมต้องเลือกเรา?</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <div key={f.title}
                className={`card p-6 text-center hover:shadow-lg hover:-translate-y-2 transition-all duration-300 ${delayMap[i] ?? ''}`}>
                <span className="text-4xl block mb-3 animate-float">{f.icon}</span>
                <h3 className="font-bold text-gray-800 mb-1 text-sm">{f.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Dishes ───────────────────────────────── */}
      <section className="bg-white py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="animate-slide-left text-orange-500 font-semibold text-sm mb-1 uppercase tracking-widest">Popular</p>
              <h2 className="animate-slide-left-delay-1 text-3xl font-bold text-gray-800">เมนูยอดนิยม</h2>
            </div>
            <Link href="/menu" className="animate-fade-in text-sm text-orange-500 font-semibold hover:underline transition">
              ดูทั้งหมด →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {featuredDishes.map((dish, i) => (
              <Link href="/menu" key={dish.name}
                className={`card overflow-hidden group hover:shadow-xl hover:-translate-y-2 transition-all duration-300 ${delayMap[i] ?? ''}`}>
                <div className="h-44 overflow-hidden bg-gray-100 relative">
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="absolute bottom-3 right-3 bg-orange-500 text-white text-sm font-bold px-3 py-1 rounded-xl shadow opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                    ฿{dish.price}
                  </span>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <span className="font-semibold text-gray-800 text-sm">{dish.name}</span>
                  <span className="font-bold text-orange-500">฿{dish.price}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────── */}
      <section className="bg-gray-50 py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="animate-fade-in text-orange-500 font-semibold text-sm mb-2 uppercase tracking-widest">Simple Steps</p>
          <h2 className="animate-fade-up text-3xl font-bold text-gray-800 mb-14">วิธีสั่งอาหาร</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { step: '01', icon: '🍽️', title: 'เลือกเมนู',       desc: 'เรียกดูเมนูหลากหลาย เลือกสิ่งที่ชอบใส่ตะกร้า' },
              { step: '02', icon: '🛒', title: 'ยืนยันออเดอร์',   desc: 'ตรวจสอบรายการ เลือกประเภทการรับ แล้วกดสั่ง' },
              { step: '03', icon: '✅', title: 'รับอาหาร',        desc: 'ติดตามสถานะแบบ real-time รับอาหารร้อนๆ ได้เลย' },
            ].map((s, i) => (
              <div key={s.step}
                className={`flex flex-col items-center ${i === 0 ? 'animate-slide-left' : i === 1 ? 'animate-fade-up-delay-1' : 'animate-fade-up-delay-2'}`}>
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center text-4xl mb-4 shadow-lg shadow-orange-200 hover:-translate-y-1 transition-transform duration-300">
                  {s.icon}
                </div>
                <span className="text-xs font-bold text-orange-400 mb-1 tracking-widest">STEP {s.step}</span>
                <h3 className="font-bold text-gray-800 mb-2 text-lg">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────── */}
      <section className="relative overflow-hidden py-24 px-4 text-center">
        {/* reuse bg image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/พื้นหลังร้านอาหาร.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/85 to-amber-500/85" />

        <div className="relative z-10">
          <h2 className="animate-fade-up text-4xl font-extrabold text-white mb-3 drop-shadow">หิวแล้วใช่ไหม? 😋</h2>
          <p className="animate-fade-up-delay-1 text-white/85 mb-10 text-xl">เมนูหลากหลาย รสชาติอร่อย รอคุณอยู่</p>
          <Link href="/menu"
            className="animate-fade-up-delay-2 animate-pulse-glow inline-flex items-center gap-2 bg-white text-orange-500 font-bold px-12 py-5 rounded-2xl shadow-2xl hover:shadow-3xl hover:-translate-y-1 transition-all duration-200 text-xl">
            🍜 สั่งเดี๋ยวนี้เลย
          </Link>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4 text-center text-sm">
        <p className="text-white font-bold text-xl mb-1">🍽️ Made-to-Order</p>
        <p className="mb-6 text-gray-500">ร้านอาหารสั่งตามใจ รสชาติต้นตำรับ</p>
        <div className="flex justify-center gap-8 text-sm mb-8">
          <Link href="/menu"     className="hover:text-orange-400 transition-colors">เมนู</Link>
          <Link href="/orders"   className="hover:text-orange-400 transition-colors">ออเดอร์</Link>
          <Link href="/login"    className="hover:text-orange-400 transition-colors">เข้าสู่ระบบ</Link>
          <Link href="/register" className="hover:text-orange-400 transition-colors">สมัครสมาชิก</Link>
        </div>
        <p className="text-xs text-gray-600">© 2024 Made-to-Order Restaurant. All rights reserved.</p>
      </footer>

    </div>
  );
}
