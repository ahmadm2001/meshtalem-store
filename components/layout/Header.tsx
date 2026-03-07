'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, LogOut, Package, Search } from 'lucide-react';
import { useAuthStore, useCartStore } from '@/store';
import { useState, useEffect } from 'react';

export default function Header() {
  const { isAuthenticated, logout } = useAuthStore();
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
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/products" className="text-2xl font-bold text-primary-600 shrink-0">
            משתלם
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="חיפוש מוצרים..."
                className="w-full border border-gray-200 rounded-full px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-600">
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Cart */}
            <Link href="/cart" className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors">
              <ShoppingCart className="w-6 h-6" />
              {mounted && count() > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {count()}
                </span>
              )}
            </Link>

            {/* User */}
            {mounted && (isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link href="/orders" className="flex items-center gap-1 text-sm text-gray-600 hover:text-primary-600 transition-colors">
                  <Package className="w-4 h-4" />
                  <span className="hidden sm:inline">הזמנות</span>
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link href="/auth/login" className="btn-primary text-sm py-2 px-4">
                כניסה
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
