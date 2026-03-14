'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Search, Heart, Phone, User, ChevronDown } from 'lucide-react';
import { useCartStore } from '@/store';
import { useState, useEffect } from 'react';

const NAV_ITEMS = [
  {
    label: 'דלתות כניסה',
    href: '/doors/entry',
    sub: [
      { label: 'כל הדלתות', href: '/doors/entry' },
      { label: 'חלונות וסורגים', href: '/doors/entry?sub=windows' },
      { label: 'אלמנטים דקורטיביים', href: '/doors/entry?sub=decorative' },
      { label: 'חיפויי עץ / פורניר ופורמייקה', href: '/doors/entry?sub=wood' },
      { label: 'דלתות חלקות', href: '/doors/entry?sub=smooth' },
      { label: 'ידיות כניסה ופרזול', href: '/doors/entry?sub=handles' },
    ],
  },
  {
    label: 'דלתות פנים',
    href: '/doors/interior',
    sub: [
      { label: 'כל הדלתות', href: '/doors/interior' },
      { label: 'דלתות עץ', href: '/doors/interior?sub=wood' },
      { label: 'דלתות זכוכית', href: '/doors/interior?sub=glass' },
      { label: 'דלתות הזזה', href: '/doors/interior?sub=sliding' },
    ],
  },
  { label: 'מבצעים', href: '/products?sale=true' },
  { label: 'מתחם העיצוב', href: '/design' },
  { label: 'אולמות תצוגה', href: '/showrooms' },
  { label: 'צור קשר', href: '/contact' },
];

export default function Header() {
  const { count } = useCartStore();
  const [search, setSearch] = useState('');
  const [mounted, setMounted] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) router.push(`/products?search=${encodeURIComponent(search.trim())}`);
  };

  const cartCount = mounted ? count() : 0;

  return (
    <header className="sticky top-0 z-50" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.25)' }}>
      {/* Top bar */}
      <div style={{ background: '#111111' }} className="text-gray-300 text-xs py-1.5 px-4 hidden sm:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="tel:1800800100" className="flex items-center gap-1 hover:text-white transition-colors">
              <Phone className="w-3 h-3" />
              <span>1-800-800-100</span>
            </a>
            <span className="text-gray-600">|</span>
            <span>ייצור ישראלי · אחריות 10 שנה · התקנה מקצועית</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="flex items-center gap-1 hover:text-white transition-colors">
              <User className="w-3 h-3" />
              <span>כניסה</span>
            </Link>
            <span className="text-gray-600">|</span>
            <Link href="/favorites" className="flex items-center gap-1 hover:text-white transition-colors">
              <Heart className="w-3 h-3" />
              <span>המועדפים שלי</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div style={{ background: '#1c1c1c' }} className="px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Link href="/" className="flex-shrink-0 ml-6">
            <div className="flex flex-col items-center leading-none">
              <span className="text-white font-black text-3xl tracking-wider">Q</span>
              <span style={{ color: '#c9a84c', fontSize: '9px', letterSpacing: '4px' }} className="font-bold">DOOR</span>
            </div>
          </Link>

          <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-auto">
            <div className="flex">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="חפש דלת..."
                className="flex-1 bg-white text-gray-900 text-sm px-4 py-2.5 focus:outline-none"
              />
              <button type="submit" className="bg-gray-200 hover:bg-gray-300 transition-colors px-4">
                <Search className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </form>

          <Link href="/cart" className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors">
            <div className="relative">
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span style={{ background: '#c9a84c' }} className="absolute -top-2 -right-2 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-sm hidden sm:block">{cartCount}</span>
          </Link>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ background: '#2a2a2a', borderTop: '1px solid #3a3a3a' }}>
        <div className="max-w-7xl mx-auto">
          <nav className="flex items-center justify-center">
            {NAV_ITEMS.map(item => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.sub && setOpenMenu(item.label)}
                onMouseLeave={() => setOpenMenu(null)}
              >
                <Link
                  href={item.href}
                  className="flex items-center gap-1 text-gray-200 hover:text-white text-sm font-semibold px-4 py-3 transition-colors"
                  style={{ borderBottom: openMenu === item.label ? '2px solid #c9a84c' : '2px solid transparent' }}
                >
                  {item.label}
                  {item.sub && <ChevronDown className="w-3 h-3 opacity-60" />}
                </Link>
                {item.sub && openMenu === item.label && (
                  <div className="absolute top-full right-0 bg-white z-50 min-w-52 py-2" style={{ border: '1px solid #e5e5e5', boxShadow: '0 8px 24px rgba(0,0,0,0.14)' }}>
                    {item.sub.map(sub => (
                      <Link
                        key={sub.label}
                        href={sub.href}
                        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
