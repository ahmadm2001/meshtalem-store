'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Search, Phone } from 'lucide-react';
import { useCartStore } from '@/store';
import { useState, useEffect } from 'react';

export default function Header() {
  const { count } = useCartStore();
  const [search, setSearch] = useState('');
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) router.push(`/products?search=${encodeURIComponent(search.trim())}`);
  };

  return (
    <header className="sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-primary-900 text-primary-200 text-xs py-1.5 px-4 text-center hidden sm:block">
        <span>דלתות פרימיום בהתאמה אישית · משלוח והתקנה עד הבית · </span>
        <a href="tel:+972501234567" className="text-yellow-400 font-semibold hover:text-yellow-300 transition-colors inline-flex items-center gap-1 mr-1">
          <Phone className="w-3 h-3" />
          050-123-4567
        </a>
      </div>

      {/* Main header */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">

            {/* Logo */}
            <Link href="/products" className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center shadow-sm group-hover:bg-primary-700 transition-colors">
                <span className="text-white font-black text-base tracking-tight">Q</span>
              </div>
              <div className="leading-tight">
                <span className="text-xl font-black text-primary-800 tracking-tight">Q Door</span>
                <span className="block text-[9px] text-primary-400 font-semibold tracking-widest uppercase -mt-0.5">Premium Doors</span>
              </div>
            </Link>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-xl">
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="חפש דלת..."
                  className="w-full border border-gray-200 rounded-full px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent bg-slate-50 transition-all"
                />
                <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-600 transition-colors">
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Cart */}
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/cart"
                className="relative flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-full text-sm font-semibold transition-all shadow-sm"
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden sm:inline">עגלה</span>
                {mounted && count() > 0 && (
                  <span className="bg-yellow-400 text-primary-900 text-xs w-5 h-5 rounded-full flex items-center justify-center font-black">
                    {count()}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
