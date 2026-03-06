'use client';
import { useEffect, useState } from 'react';
import { ShoppingBag, Search } from 'lucide-react';
import { ordersApi } from '@/lib/api';
import toast from 'react-hot-toast';

const statusOptions = [
  { value: 'pending',    label: 'ממתין' },
  { value: 'confirmed',  label: 'אושר' },
  { value: 'processing', label: 'בעיבוד' },
  { value: 'shipped',    label: 'נשלח' },
  { value: 'delivered',  label: 'נמסר' },
  { value: 'cancelled',  label: 'בוטל' },
];

const statusCls: Record<string, string> = {
  pending:    'badge-pending',
  confirmed:  'badge-approved',
  processing: 'bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full',
  shipped:    'bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full',
  delivered:  'badge-approved',
  cancelled:  'badge-rejected',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    ordersApi.getAll({ status: filterStatus || undefined, limit: 100 })
      .then((r) => setOrders(r.data?.orders || r.data || []))
      .finally(() => setLoading(false));
  }, [filterStatus]);

  const updateStatus = async (id: string, status: string) => {
    await ordersApi.updateStatus(id, status);
    setOrders((p) => p.map((o) => o.id === id ? { ...o, status } : o));
    toast.success('סטטוס עודכן');
  };

  const filtered = orders.filter((o) =>
    o.id?.toLowerCase().includes(search.toLowerCase()) ||
    o.shippingFullName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">ניהול הזמנות</h1>

      <div className="card mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="חיפוש לפי מספר הזמנה או שם..." className="input-field pr-9" />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input-field w-auto">
            <option value="">כל הסטטוסים</option>
            {statusOptions.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="card animate-pulse h-16" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12"><ShoppingBag className="w-12 h-12 mx-auto mb-3 text-gray-300" /><p className="text-gray-500">לא נמצאו הזמנות</p></div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">מספר הזמנה</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">לקוח</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">עיר</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">סכום</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">סטטוס</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">תאריך</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">#{order.id.slice(0,8).toUpperCase()}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{order.shippingFullName}</td>
                  <td className="px-4 py-3 text-gray-600">{order.shippingCity}</td>
                  <td className="px-4 py-3 font-bold text-primary-600">₪{Number(order.totalAmount).toFixed(2)}</td>
                  <td className="px-4 py-3"><span className={statusCls[order.status] || 'badge-pending'}>{statusOptions.find(s=>s.value===order.status)?.label || order.status}</span></td>
                  <td className="px-4 py-3 text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString('he-IL')}</td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    >
                      {statusOptions.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
