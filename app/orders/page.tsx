'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
import { ordersApi } from '@/lib/api';
import { useAuthStore } from '@/store';
import StoreLayout from '@/components/layout/StoreLayout';

const statusMap: Record<string, { label: string; className: string }> = {
  pending:    { label: 'ממתין לאישור', className: 'badge-pending' },
  confirmed:  { label: 'אושר', className: 'badge-approved' },
  processing: { label: 'בעיבוד', className: 'bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full' },
  shipped:    { label: 'נשלח', className: 'bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full' },
  delivered:  { label: 'נמסר', className: 'badge-approved' },
  cancelled:  { label: 'בוטל', className: 'badge-rejected' },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) return;
    ordersApi.getMyOrders().then((r) => setOrders(r.data)).finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <StoreLayout>
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <h2 className="text-xl font-bold mb-4">יש להתחבר כדי לצפות בהזמנות</h2>
          <Link href="/auth/login" className="btn-primary">כניסה לחשבון</Link>
        </div>
      </StoreLayout>
    );
  }

  return (
    <StoreLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">ההזמנות שלי</h1>
        {loading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="card animate-pulse h-24" />)}</div>
        ) : orders.length === 0 ? (
          <div className="card text-center py-12">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium text-gray-700">אין הזמנות עדיין</p>
            <Link href="/products" className="btn-primary inline-block mt-4">לחנות</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = statusMap[order.status] || statusMap.pending;
              return (
                <div key={order.id} className="card">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">הזמנה #{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString('he-IL', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                    <span className={status.className}>{status.label}</span>
                  </div>
                  <div className="space-y-1 mb-3">
                    {order.items?.map((item: any) => (
                      <div key={item.id} className="flex justify-between text-sm text-gray-600">
                        <span>{item.product?.nameHe} ×{item.quantity}</span>
                        <span>₪{(item.unitPrice * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-500"><Truck className="w-4 h-4 inline ml-1" />{order.shippingCity}</p>
                    <p className="font-bold text-primary-600">₪{Number(order.totalAmount).toFixed(2)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </StoreLayout>
  );
}
