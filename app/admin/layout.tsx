'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LayoutDashboard, Store, Package, ShoppingBag, Tag, BarChart2, LogOut, Shield } from 'lucide-react';
import { useAuthStore } from '@/store';

const navItems = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'דשבורד' },
  { href: '/admin/vendors',   icon: Store,           label: 'ספקים' },
  { href: '/admin/products',  icon: Package,         label: 'מוצרים' },
  { href: '/admin/orders',    icon: ShoppingBag,     label: 'הזמנות' },
  { href: '/admin/categories',icon: Tag,             label: 'קטגוריות' },
  { href: '/admin/reports',   icon: BarChart2,       label: 'דוחות' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, user]);

  if (!isAuthenticated || user?.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-gray-50 flex" dir="rtl">
      <aside className="w-60 bg-gray-900 text-white flex flex-col shrink-0 fixed h-full">
        <div className="p-5 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary-400" />
            <div>
              <p className="font-bold text-white">משתלם</p>
              <p className="text-xs text-gray-400">פאנל ניהול</p>
            </div>
          </div>
        </div>
        <div className="px-4 py-3 border-b border-gray-700 bg-gray-800">
          <p className="text-sm font-medium text-white truncate">{user.fullName}</p>
          <p className="text-xs text-gray-400 truncate">{user.email}</p>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}>
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-gray-700">
          <button onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-gray-800 w-full transition-colors">
            <LogOut className="w-4 h-4" />
            התנתקות
          </button>
        </div>
      </aside>
      <main className="flex-1 mr-60 p-6 overflow-auto">{children}</main>
    </div>
  );
}
