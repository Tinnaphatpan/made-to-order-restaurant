'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import MenuCard from '@/components/menu/MenuCard';
import Cart from '@/components/order/Cart';

function MenuContent() {
  const searchParams = useSearchParams();
  const tableFromUrl = searchParams.get('table') || '';

  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems]   = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [cart, setCart]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/categories?active=true').then(r => r.json()),
      fetch('/api/menu?available=true').then(r => r.json()),
    ]).then(([catRes, menuRes]) => {
      setCategories(catRes.data || []);
      setMenuItems(menuRes.data || []);
      setLoading(false);
    });
  }, []);

  const filtered = menuItems
    .filter(item => activeCategory === 'all' || item.category?._id === activeCategory)
    .filter(item => item.name.toLowerCase().includes(search.toLowerCase()));

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(c => c._id === item._id);
      if (existing) return prev.map(c => c._id === item._id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">กำลังโหลดเมนู...</span>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {tableFromUrl && (
        <div className="mb-4 bg-orange-50 border border-orange-200 rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm text-orange-700 animate-fade-up">
          🪑 <strong>โต๊ะ {tableFromUrl}</strong> — กรอกเลขโต๊ะในตะกร้าให้อัตโนมัติแล้ว
        </div>
      )}

      <header className="mb-6">
        <h1 className="text-2xl font-bold mb-4">เมนูอาหาร</h1>

        <div className="relative mb-4 max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ค้นหาเมนู..."
            className="input pl-9"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveCategory('all')}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === 'all' ? 'bg-orange-500 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300'}`}
          >
            ทั้งหมด ({menuItems.length})
          </button>
          {categories.map(cat => (
            <button
              key={cat._id}
              onClick={() => setActiveCategory(cat._id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === cat._id ? 'bg-orange-500 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300'}`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>
      </header>

      <div className="flex gap-6">
        <div className="flex-1 min-w-0">
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-4xl mb-3">🍽️</p>
              <p>ไม่พบเมนูที่ค้นหา</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map(item => (
                <MenuCard key={item._id} item={item} onAddToCart={addToCart} />
              ))}
            </div>
          )}
        </div>

        <aside className="hidden lg:block w-80 flex-shrink-0">
          <Cart cart={cart} setCart={setCart} defaultTable={tableFromUrl} />
        </aside>
      </div>

      {cartCount > 0 && (
        <button
          onClick={() => setShowCart(true)}
          className="lg:hidden fixed bottom-6 right-6 btn-primary rounded-2xl shadow-lg px-5 py-3 text-base z-40"
        >
          🛒 ตะกร้า ({cartCount})
        </button>
      )}

      {showCart && (
        <div className="lg:hidden fixed inset-0 bg-black/40 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl max-h-[85vh] overflow-y-auto p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg">ตะกร้า 🛒</h2>
              <button onClick={() => setShowCart(false)} className="text-gray-400 text-2xl leading-none">✕</button>
            </div>
            <Cart cart={cart} setCart={setCart} defaultTable={tableFromUrl} onOrderSuccess={() => setShowCart(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64 text-gray-400">
        <div className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <MenuContent />
    </Suspense>
  );
}
