'use client';
import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Search, Store } from 'lucide-react';
import { vendorsApi } from '@/lib/api';
import toast from 'react-hot-toast';

const statusLabels: Record<string, { label: string; cls: string }> = {
  pending:  { label: 'ממתין',  cls: 'badge-pending' },
  approved: { label: 'מאושר', cls: 'badge-approved' },
  rejected: { label: 'נדחה',  cls: 'badge-rejected' },
};

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const load = (f: string) => {
    setLoading(true);
    vendorsApi.getAll(f === 'all' ? undefined : f)
      .then((r) => setVendors(r.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(filter); }, [filter]);

  const approve = async (id: string) => {
    await vendorsApi.approve(id);
    setVendors((prev) => prev.map((v) => v.id === id ? { ...v, status: 'approved' } : v));
    toast.success('ספק אושר');
  };

  const reject = async (id: string) => {
    const reason = prompt('סיבת הדחייה:');
    if (!reason) return;
    await vendorsApi.reject(id, reason);
    setVendors((prev) => prev.map((v) => v.id === id ? { ...v, status: 'rejected' } : v));
    toast.success('ספק נדחה');
  };

  const filtered = vendors.filter((v) =>
    v.businessName?.toLowerCase().includes(search.toLowerCase()) ||
    v.user?.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">ניהול ספקים</h1>

      <div className="card mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="חיפוש..." className="input-field pr-9" />
          </div>
          <div className="flex gap-2">
            {['all','pending','approved','rejected'].map((s) => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filter === s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {{ all:'הכל', pending:'ממתינים', approved:'מאושרים', rejected:'נדחו' }[s]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="card animate-pulse h-14" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12"><Store className="w-12 h-12 mx-auto mb-3 text-gray-300" /><p className="text-gray-500">לא נמצאו ספקים</p></div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">שם העסק</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">מייל</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">סטטוס</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">תאריך</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => {
                const s = statusLabels[v.status] || statusLabels.pending;
                return (
                  <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{v.businessName}</td>
                    <td className="px-4 py-3 text-gray-600">{v.user?.email}</td>
                    <td className="px-4 py-3"><span className={s.cls}>{s.label}</span></td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(v.createdAt).toLocaleDateString('he-IL')}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {v.status === 'pending' && (
                          <>
                            <button onClick={() => approve(v.id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg" title="אשר">
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button onClick={() => reject(v.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg" title="דחה">
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
