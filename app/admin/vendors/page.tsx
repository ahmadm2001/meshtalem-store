'use client';
import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Search, Store, Eye, X, Phone, MapPin, Mail, Calendar, FileText } from 'lucide-react';
import { vendorsApi } from '@/lib/api';
import toast from 'react-hot-toast';

const statusLabels: Record<string, { label: string; cls: string }> = {
  pending:   { label: 'ממתין',   cls: 'badge-pending' },
  approved:  { label: 'מאושר',  cls: 'badge-approved' },
  rejected:  { label: 'נדחה',   cls: 'badge-rejected' },
  suspended: { label: 'מושהה',  cls: 'badge-pending' },
};

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any>(null);

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
    if (selected?.id === id) setSelected((s: any) => ({ ...s, status: 'approved' }));
    toast.success('ספק אושר בהצלחה ✓');
  };

  const reject = async (id: string) => {
    const reason = prompt('סיבת הדחייה:');
    if (!reason) return;
    await vendorsApi.reject(id, reason);
    setVendors((prev) => prev.map((v) => v.id === id ? { ...v, status: 'rejected', rejectionReason: reason } : v));
    if (selected?.id === id) setSelected((s: any) => ({ ...s, status: 'rejected', rejectionReason: reason }));
    toast.success('ספק נדחה');
  };

  const filtered = vendors.filter((v) =>
    v.businessName?.toLowerCase().includes(search.toLowerCase()) ||
    v.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
    v.user?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    v.phone?.includes(search)
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">ניהול ספקים</h1>

      <div className="card mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="חיפוש לפי שם, מייל, טלפון..." className="input-field pr-9" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['all','pending','approved','rejected'].map((s) => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filter === s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {{ all:'הכל', pending:'ממתינים', approved:'מאושרים', rejected:'נדחו' }[s]}
                {s === 'pending' && vendors.filter(v=>v.status==='pending').length > 0 && (
                  <span className="mr-1.5 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                    {vendors.filter(v=>v.status==='pending').length}
                  </span>
                )}
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
                <th className="text-right px-4 py-3 text-gray-500 font-medium">שם מלא</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">מייל</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">טלפון</th>
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
                    <td className="px-4 py-3 text-gray-700">{v.user?.fullName || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{v.user?.email}</td>
                    <td className="px-4 py-3 text-gray-600 dir-ltr">{v.phone || '—'}</td>
                    <td className="px-4 py-3"><span className={s.cls}>{s.label}</span></td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(v.createdAt).toLocaleDateString('he-IL')}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setSelected(v)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg" title="פרטים מלאים">
                          <Eye className="w-4 h-4" />
                        </button>
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

      {/* Vendor Details Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">פרטי ספק</h2>
              <button onClick={() => setSelected(null)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className={statusLabels[selected.status]?.cls || 'badge-pending'}>
                  {statusLabels[selected.status]?.label || 'ממתין'}
                </span>
                <span className="text-xs text-gray-400">
                  נרשם: {new Date(selected.createdAt).toLocaleDateString('he-IL')}
                </span>
              </div>

              {/* Business Info */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <h3 className="font-semibold text-gray-800 text-sm">פרטי העסק</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Store className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">שם העסק (ערבית)</p>
                      <p className="font-medium text-gray-900">{selected.businessName}</p>
                    </div>
                  </div>
                  {selected.businessNameHe && (
                    <div className="flex items-start gap-2">
                      <Store className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">שם העסק (עברית)</p>
                        <p className="font-medium text-gray-900">{selected.businessNameHe}</p>
                      </div>
                    </div>
                  )}
                  {selected.description && (
                    <div className="flex items-start gap-2">
                      <FileText className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">תיאור העסק</p>
                        <p className="text-gray-700 text-sm">{selected.description}</p>
                      </div>
                    </div>
                  )}
                  {selected.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">כתובת</p>
                        <p className="text-gray-700">{selected.address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <h3 className="font-semibold text-gray-800 text-sm">פרטי יצירת קשר</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">מייל</p>
                      <p className="text-gray-900">{selected.user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-gray-400 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">שם מלא</p>
                      <p className="text-gray-900">{selected.user?.fullName || '—'}</p>
                    </div>
                  </div>
                  {selected.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">טלפון</p>
                        <p className="text-gray-900 dir-ltr">{selected.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Rejection reason */}
              {selected.rejectionReason && (
                <div className="bg-red-50 rounded-xl p-4">
                  <p className="text-xs text-red-500 font-medium mb-1">סיבת דחייה</p>
                  <p className="text-red-700 text-sm">{selected.rejectionReason}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            {selected.status === 'pending' && (
              <div className="p-5 border-t border-gray-100 flex gap-3">
                <button onClick={() => approve(selected.id)}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-xl transition-colors">
                  <CheckCircle className="w-4 h-4" />
                  אשר ספק
                </button>
                <button onClick={() => reject(selected.id)}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-medium py-2.5 rounded-xl transition-colors">
                  <XCircle className="w-4 h-4" />
                  דחה ספק
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
