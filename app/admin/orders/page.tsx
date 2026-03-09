'use client';
import { useEffect, useState } from 'react';
import { ShoppingBag, Search, ChevronDown, ChevronUp, TrendingUp } from 'lucide-react';
import { ordersApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { getColorByKey, getDeliveryLabelHe } from '@/lib/colors';

const statusOptions = [
  { value: 'pending',    label: 'ממתין' },
  { value: 'confirmed',  label: 'אושר' },
  { value: 'processing', label: 'בעיבוד' },
  { value: 'shipped',    label: 'נשלח' },
  { value: 'delivered',  label: 'נמסר' },
  { value: 'cancelled',  label: 'בוטל' },
];

const statusCls: Record<string, string> = {
  pending:    'bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full',
  confirmed:  'bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full',
  processing: 'bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full',
  shipped:    'bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full',
  delivered:  'bg-emerald-100 text-emerald-800 text-xs font-medium px-2.5 py-0.5 rounded-full',
  cancelled:  'bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    ordersApi.getAll({ status: filterStatus || undefined, limit: 100 })
      .then((r) => setOrders(r.data?.orders || r.data || []))
      .catch(() => toast.error('שגיאה בטעינת הזמנות'))
      .finally(() => setLoading(false));
  }, [filterStatus]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await ordersApi.updateStatus(id, status);
      setOrders((p) => p.map((o) => o.id === id ? { ...o, status } : o));
      toast.success('סטטוס עודכן');
    } catch {
      toast.error('שגיאה בעדכון סטטוס');
    }
  };

  const filtered = orders.filter((o) =>
    o.id?.toLowerCase().includes(search.toLowerCase()) ||
    (o.shippingFullName || '').toLowerCase().includes(search.toLowerCase()) ||
    (o.shippingCity || '').toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = filtered.reduce((s, o) => s + Number(o.totalCustomerRevenue || o.total || 0), 0);
  const totalProfit = filtered.reduce((s, o) => s + Number(o.profit || 0), 0);
  const totalCost = filtered.reduce((s, o) => s + Number(o.totalVendorCost || 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900">ניהול הזמנות</h1>
        <div className="flex gap-3 text-sm flex-wrap">
          <div className="bg-primary-50 rounded-xl px-4 py-2 text-center min-w-[90px]">
            <p className="text-xs text-gray-500">הכנסות</p>
            <p className="font-bold text-primary-700">₪{totalRevenue.toFixed(0)}</p>
          </div>
          <div className="bg-orange-50 rounded-xl px-4 py-2 text-center min-w-[90px]">
            <p className="text-xs text-gray-500">עלות ספקים</p>
            <p className="font-bold text-orange-600">₪{totalCost.toFixed(0)}</p>
          </div>
          <div className="bg-green-50 rounded-xl px-4 py-2 text-center min-w-[90px]">
            <p className="text-xs text-gray-500">רווח נקי</p>
            <p className="font-bold text-green-700">₪{totalProfit.toFixed(0)}</p>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="חיפוש לפי מספר הזמנה, שם או עיר..." className="input-field pr-9" />
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
        <div className="card text-center py-12">
          <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500">לא נמצאו הזמנות</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((order) => {
            const isExpanded = expandedId === order.id;
            const profit = Number(order.profit || 0);
            const totalVendorCost = Number(order.totalVendorCost || 0);
            const totalCustomerRevenue = Number(order.totalCustomerRevenue || order.total || 0);

            return (
              <div key={order.id} className="card p-0 overflow-hidden border border-gray-100">
                {/* Summary row */}
                <div
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-gray-500">#{order.id.slice(0, 8).toUpperCase()}</span>
                      <span className="font-semibold text-gray-900 text-sm">{order.shippingFullName}</span>
                      <span className="text-xs text-gray-400">{order.shippingCity}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString('he-IL', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="text-left shrink-0">
                    <p className="font-bold text-primary-600 text-sm">₪{totalCustomerRevenue.toFixed(0)}</p>
                    {profit > 0 && (
                      <p className="text-xs text-green-600 flex items-center gap-0.5 justify-end">
                        <TrendingUp className="w-3 h-3" />+₪{profit.toFixed(0)}
                      </p>
                    )}
                  </div>
                  <span className={statusCls[order.status] || statusCls.pending}>
                    {statusOptions.find((s) => s.value === order.status)?.label || order.status}
                  </span>
                  <select
                    value={order.status}
                    onChange={(e) => { e.stopPropagation(); updateStatus(order.id, e.target.value); }}
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500 shrink-0"
                  >
                    {statusOptions.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50 px-4 py-4 space-y-4">

                    {/* Financial summary */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
                        <p className="text-xs text-gray-400 mb-1">הכנסה מלקוח</p>
                        <p className="font-bold text-primary-600">₪{totalCustomerRevenue.toFixed(2)}</p>
                      </div>
                      <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
                        <p className="text-xs text-gray-400 mb-1">עלות ספקים</p>
                        <p className="font-bold text-orange-600">₪{totalVendorCost.toFixed(2)}</p>
                      </div>
                      <div className="bg-green-50 rounded-xl p-3 text-center border border-green-100">
                        <p className="text-xs text-gray-400 mb-1">רווח נקי</p>
                        <p className="font-bold text-green-600">₪{profit.toFixed(2)}</p>
                      </div>
                    </div>

                    {/* Shipping info */}
                    <div className="bg-white rounded-xl p-3 border border-gray-100">
                      <p className="text-xs font-semibold text-gray-500 mb-2">פרטי משלוח</p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                        <div><span className="text-gray-400 text-xs">שם: </span><span className="font-medium">{order.shippingFullName}</span></div>
                        <div><span className="text-gray-400 text-xs">טלפון: </span><span dir="ltr">{order.shippingPhone}</span></div>
                        <div><span className="text-gray-400 text-xs">עיר: </span><span>{order.shippingCity}</span></div>
                        <div><span className="text-gray-400 text-xs">רחוב: </span><span>{order.shippingStreet}{order.shippingApartment ? ` ${order.shippingApartment}` : ''}</span></div>
                        {order.shippingNotes && <div className="col-span-2"><span className="text-gray-400 text-xs">הערות: </span><span className="text-yellow-700">{order.shippingNotes}</span></div>}
                      </div>
                    </div>

                    {/* Items breakdown table */}
                    {order.items && order.items.length > 0 && (
                      <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
                        <p className="text-xs font-semibold text-gray-500 px-3 pt-3 pb-2">פירוט פריטים ורווחיות</p>
                        <table className="w-full text-xs min-w-[800px]">
                          <thead className="bg-gray-50 border-t border-gray-100">
                            <tr>
                              <th className="text-right px-3 py-2 text-gray-400 font-medium">מוצר</th>
                              <th className="text-right px-3 py-2 text-gray-400 font-medium">צבע</th>
                              <th className="text-right px-3 py-2 text-gray-400 font-medium">אספקה</th>
                              <th className="text-right px-3 py-2 text-gray-400 font-medium">ספק</th>
                              <th className="text-center px-3 py-2 text-gray-400 font-medium">כמות</th>
                              <th className="text-left px-3 py-2 text-gray-400 font-medium">מחיר ספק</th>
                              <th className="text-left px-3 py-2 text-gray-400 font-medium">דמי משלוח</th>
                              <th className="text-left px-3 py-2 text-gray-400 font-medium">מחיר לקוח</th>
                              <th className="text-left px-3 py-2 text-gray-400 font-medium">סכום ללקוח</th>
                              <th className="text-left px-3 py-2 text-gray-400 font-medium">עלות</th>
                              <th className="text-left px-3 py-2 text-gray-400 font-medium">רווח</th>
                              <th className="text-left px-3 py-2 text-gray-400 font-medium">סטטוס</th>
                            </tr>
                          </thead>
                          <tbody>
                            {order.items.map((item: any) => {
                              const vp = Number(item.vendorPrice ?? item.vendorPriceAtPurchase ?? 0);
                              const sf = Number(item.shippingFee ?? item.shippingFeeAtPurchase ?? 0);
                              const cp = Number(item.customerPrice ?? item.priceAtPurchase ?? 0);
                              const qty = item.quantity;
                              const customerTotal = Number(item.customerTotal ?? cp * qty);
                              const costTotal = Number(item.costTotal ?? (vp + sf) * qty);
                              const itemProfit = Number(item.itemProfit ?? customerTotal - costTotal);

                              // Color + delivery time
                              const colorInfo = item.selectedColor ? getColorByKey(item.selectedColor) : null;
                              const deliveryLabel = item.deliveryTimeAtPurchase ? getDeliveryLabelHe(item.deliveryTimeAtPurchase) : null;

                              return (
                                <tr key={item.id} className="border-t border-gray-50 hover:bg-gray-50">
                                  <td className="px-3 py-2">
                                    <div className="flex items-center gap-2">
                                      {item.productImageUrl && <img src={item.productImageUrl} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0" />}
                                      <span className="font-medium text-gray-800">{item.productNameHe}</span>
                                    </div>
                                  </td>
                                  <td className="px-3 py-2">
                                    {colorInfo ? (
                                      <div className="flex items-center gap-1.5">
                                        <span
                                          className="inline-block rounded"
                                          style={{
                                            width: 14,
                                            height: 14,
                                            backgroundColor: colorInfo.hex,
                                            border: colorInfo.hex === '#FFFFFF' || colorInfo.hex === '#E5D3B3'
                                              ? '1px solid #d1d5db'
                                              : '1px solid rgba(0,0,0,0.15)',
                                          }}
                                        />
                                        <span className="text-gray-700">{colorInfo.nameHe}</span>
                                      </div>
                                    ) : (
                                      <span className="text-gray-300">—</span>
                                    )}
                                  </td>
                                  <td className="px-3 py-2 text-gray-600">
                                    {deliveryLabel || <span className="text-gray-300">—</span>}
                                  </td>
                                  <td className="px-3 py-2 text-gray-500">{item.vendorName || '—'}</td>
                                  <td className="px-3 py-2 text-center font-medium text-gray-700">{qty}</td>
                                  <td className="px-3 py-2 text-orange-600 font-medium">₪{vp.toFixed(0)}</td>
                                  <td className="px-3 py-2 text-orange-400">{sf > 0 ? `₪${sf.toFixed(0)}` : '—'}</td>
                                  <td className="px-3 py-2 text-primary-600 font-medium">₪{cp.toFixed(0)}</td>
                                  <td className="px-3 py-2 text-primary-700 font-bold">₪{customerTotal.toFixed(0)}</td>
                                  <td className="px-3 py-2 text-orange-600 font-medium">₪{costTotal.toFixed(0)}</td>
                                  <td className="px-3 py-2">
                                    <span className={`font-bold ${itemProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                      {itemProfit >= 0 ? '+' : ''}₪{itemProfit.toFixed(0)}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2">
                                    <span className={statusCls[item.itemStatus] || statusCls.pending}>
                                      {statusOptions.find((s) => s.value === item.itemStatus)?.label || 'ממתין'}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                          <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                            <tr>
                              <td colSpan={8} className="px-3 py-2 text-xs font-semibold text-gray-500 text-right">סה"כ הזמנה</td>
                              <td className="px-3 py-2 text-primary-700 font-bold text-xs">₪{totalCustomerRevenue.toFixed(0)}</td>
                              <td className="px-3 py-2 text-orange-600 font-bold text-xs">₪{totalVendorCost.toFixed(0)}</td>
                              <td className="px-3 py-2 text-green-600 font-bold text-xs">+₪{profit.toFixed(0)}</td>
                              <td></td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
