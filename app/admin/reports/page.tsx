'use client';
import { useEffect, useState } from 'react';
import { BarChart2, TrendingUp, Store, ShoppingBag } from 'lucide-react';
import { ordersApi, vendorsApi } from '@/lib/api';

export default function AdminReportsPage() {
  const [report, setReport] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [selectedVendor, setSelectedVendor] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    vendorsApi.getAll('approved').then((r) => setVendors(r.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    ordersApi.getReportByVendor(selectedVendor || undefined)
      .then((r) => setReport(r.data?.vendors || r.data || []))
      .finally(() => setLoading(false));
  }, [selectedVendor]);

  const totalRevenue = report.reduce((s, v) => s + Number(v.totalRevenue || 0), 0);
  const totalOrders = report.reduce((s, v) => s + Number(v.totalOrders || 0), 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">דוחות מכירות</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card flex items-center gap-4">
          <div className="bg-green-50 p-3 rounded-xl"><TrendingUp className="w-5 h-5 text-green-600" /></div>
          <div><p className="text-xs text-gray-500">סה"כ הכנסות</p><p className="text-xl font-bold text-gray-900">₪{totalRevenue.toFixed(0)}</p></div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="bg-blue-50 p-3 rounded-xl"><ShoppingBag className="w-5 h-5 text-blue-600" /></div>
          <div><p className="text-xs text-gray-500">סה"כ הזמנות</p><p className="text-xl font-bold text-gray-900">{totalOrders}</p></div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="bg-purple-50 p-3 rounded-xl"><Store className="w-5 h-5 text-purple-600" /></div>
          <div><p className="text-xs text-gray-500">ספקים פעילים</p><p className="text-xl font-bold text-gray-900">{report.length}</p></div>
        </div>
      </div>

      {/* Filter */}
      <div className="card mb-4">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">סינון לפי ספק:</label>
          <select value={selectedVendor} onChange={(e) => setSelectedVendor(e.target.value)} className="input-field w-auto">
            <option value="">כל הספקים</option>
            {vendors.map((v) => <option key={v.id} value={v.id}>{v.businessName}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="card animate-pulse h-14" />)}</div>
      ) : report.length === 0 ? (
        <div className="card text-center py-12"><BarChart2 className="w-12 h-12 mx-auto mb-3 text-gray-300" /><p className="text-gray-500">אין נתונים</p></div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">שם הספק</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">הזמנות</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">פריטים שנמכרו</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">הכנסות</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">ממוצע להזמנה</th>
              </tr>
            </thead>
            <tbody>
              {report.map((v: any) => (
                <tr key={v.vendorId} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{v.businessName}</td>
                  <td className="px-4 py-3 text-gray-600">{v.totalOrders}</td>
                  <td className="px-4 py-3 text-gray-600">{v.totalItems || '-'}</td>
                  <td className="px-4 py-3 font-bold text-green-600">₪{Number(v.totalRevenue).toFixed(2)}</td>
                  <td className="px-4 py-3 text-gray-600">
                    ₪{v.totalOrders > 0 ? (Number(v.totalRevenue) / Number(v.totalOrders)).toFixed(2) : '0.00'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t border-gray-200">
              <tr>
                <td className="px-4 py-3 font-bold text-gray-900">סה"כ</td>
                <td className="px-4 py-3 font-bold text-gray-900">{totalOrders}</td>
                <td className="px-4 py-3"></td>
                <td className="px-4 py-3 font-bold text-green-600">₪{totalRevenue.toFixed(2)}</td>
                <td className="px-4 py-3"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
