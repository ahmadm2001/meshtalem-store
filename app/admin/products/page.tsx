'use client';
import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Edit, Search, Package } from 'lucide-react';
import { productsApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [search, setSearch] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editNameHe, setEditNameHe] = useState('');
  const [editDescHe, setEditDescHe] = useState('');

  const load = async (f: string) => {
    setLoading(true);
    try {
      const r = f === 'pending' ? await productsApi.getPending() : await productsApi.getAll({ status: f, limit: 50 });
      setProducts(r.data?.products || r.data || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(filter); }, [filter]);

  const approve = async (id: string) => {
    await productsApi.approve(id);
    setProducts((p) => p.filter((x) => x.id !== id));
    toast.success('מוצר אושר');
  };

  const reject = async (id: string) => {
    const reason = prompt('סיבת הדחייה:');
    if (!reason) return;
    await productsApi.reject(id, reason);
    setProducts((p) => p.filter((x) => x.id !== id));
    toast.success('מוצר נדחה');
  };

  const saveTranslation = async (id: string) => {
    await productsApi.updateTranslation(id, editNameHe, editDescHe);
    setProducts((p) => p.map((x) => x.id === id ? { ...x, nameHe: editNameHe, descriptionHe: editDescHe } : x));
    setEditId(null);
    toast.success('תרגום עודכן');
  };

  const filtered = products.filter((p) =>
    (p.nameHe || p.nameAr || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">ניהול מוצרים</h1>

      <div className="card mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="חיפוש מוצרים..." className="input-field pr-9" />
          </div>
          <div className="flex gap-2">
            {['pending','approved','rejected'].map((s) => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filter === s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {{ pending:'ממתינים', approved:'מאושרים', rejected:'נדחו' }[s]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="card animate-pulse h-16" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12"><Package className="w-12 h-12 mx-auto mb-3 text-gray-300" /><p className="text-gray-500">לא נמצאו מוצרים</p></div>
      ) : (
        <div className="space-y-3">
          {filtered.map((product) => (
            <div key={product.id} className="card">
              {editId === product.id ? (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3 text-sm">עריכת תרגום עברי</h3>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">שם ערבי (מקור)</label>
                      <p className="text-sm bg-gray-50 p-2 rounded" dir="rtl">{product.nameAr}</p>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">שם עברי *</label>
                      <input value={editNameHe} onChange={(e) => setEditNameHe(e.target.value)} className="input-field text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">תיאור ערבי</label>
                      <p className="text-sm bg-gray-50 p-2 rounded max-h-16 overflow-auto" dir="rtl">{product.descriptionAr || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">תיאור עברי</label>
                      <textarea value={editDescHe} onChange={(e) => setEditDescHe(e.target.value)} className="input-field text-sm" rows={2} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => saveTranslation(product.id)} className="btn-primary text-sm px-4 py-1.5">שמור</button>
                    <button onClick={() => setEditId(null)} className="btn-secondary text-sm px-4 py-1.5">ביטול</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 text-sm">{product.nameHe || product.nameAr}</h3>
                      {!product.nameHe && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">ממתין לתרגום</span>}
                    </div>
                    <div className="flex gap-4 mt-1 text-xs text-gray-500">
                      <span>₪{Number(product.price).toFixed(2)}</span>
                      <span>מלאי: {product.stock}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => { setEditId(product.id); setEditNameHe(product.nameHe || ''); setEditDescHe(product.descriptionHe || ''); }}
                      className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    {product.status === 'pending' && (
                      <>
                        <button onClick={() => approve(product.id)} className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-xs font-medium">
                          <CheckCircle className="w-3.5 h-3.5" />אשר
                        </button>
                        <button onClick={() => reject(product.id)} className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-medium">
                          <XCircle className="w-3.5 h-3.5" />דחה
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
