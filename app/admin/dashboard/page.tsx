'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TrendingUp, Store, Package, ShoppingBag, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { ordersApi, vendorsApi, productsApi } from '@/lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [pendingVendors, setPendingVendors] = useState<any[]>([]);
  const [pendingProducts, setPendingProducts] = useState<any[]>([]);

  useEffect(() => {
    ordersApi.getDashboardStats().then((r) => setStats(r.data)).catch(() => {});
    vendorsApi.getAll('pending').then((r) => setPendingVendors(r.data?.slice(0, 5) || [])).catch(() => {});
    productsApi.getPending().then((r) => setPendingProducts((r.data?.products || r.data || []).slice(0, 5))).catch(() => {});
  }, []);

  const cards = [
    { label: 'סה"כ הזמנות', value: stats?.totalOrders, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'הכנסות', value: stats ? `₪${Number(stats.totalRevenue || 0).toFixed(0)}` : null, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'ספקים פעילים', value: stats?.activeVendors, icon: Store, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'מוצרים פעילים', value: stats?.activeProducts, icon: Package, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">דשבורד ניהול</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map((c) => (
          <div key={c.label} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">{c.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{c.value ?? '...'}</p>
              </div>
              <div className={`${c.bg} p-3 rounded-xl`}>
                <c.icon className={`w-5 h-5 ${c.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Vendors */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-yellow-500" />
              ספקים ממתינים
              {pendingVendors.length > 0 && <span className="badge-pending">{pendingVendors.length}</span>}
            </h2>
            <Link href="/admin/vendors" className="text-xs text-primary-600 hover:underline">הצג הכל</Link>
          </div>
          {pendingVendors.length === 0 ? (
            <div className="text-center py-6"><CheckCircle className="w-8 h-8 mx-auto mb-1 text-green-300" /><p className="text-xs text-gray-400">אין ממתינים</p></div>
          ) : (
            <div className="space-y-2">
              {pendingVendors.map((v) => (
                <div key={v.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{v.businessName}</p>
                    <p className="text-xs text-gray-400">{v.user?.email}</p>
                  </div>
                  <Link href={`/admin/vendors`} className="text-xs bg-primary-600 text-white px-2 py-1 rounded-lg">בדיקה</Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Products */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4 text-orange-500" />
              מוצרים ממתינים
              {pendingProducts.length > 0 && <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-0.5 rounded-full">{pendingProducts.length}</span>}
            </h2>
            <Link href="/admin/products" className="text-xs text-primary-600 hover:underline">הצג הכל</Link>
          </div>
          {pendingProducts.length === 0 ? (
            <div className="text-center py-6"><CheckCircle className="w-8 h-8 mx-auto mb-1 text-green-300" /><p className="text-xs text-gray-400">אין ממתינים</p></div>
          ) : (
            <div className="space-y-2">
              {pendingProducts.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{p.nameHe || p.nameAr}</p>
                    <p className="text-xs text-gray-400">₪{Number(p.price).toFixed(2)}</p>
                  </div>
                  <Link href={`/admin/products`} className="text-xs bg-primary-600 text-white px-2 py-1 rounded-lg">בדיקה</Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
