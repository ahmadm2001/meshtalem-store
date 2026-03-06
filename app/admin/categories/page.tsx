'use client';
import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';
import { categoriesApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [nameHe, setNameHe] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    categoriesApi.getAll().then((r) => setCategories(r.data || [])).finally(() => setLoading(false));
  }, []);

  const save = async () => {
    if (!nameHe.trim()) return;
    setSaving(true);
    try {
      if (editId) {
        await categoriesApi.update(editId, { nameHe, nameAr });
        setCategories((p) => p.map((c) => c.id === editId ? { ...c, nameHe, nameAr } : c));
        toast.success('קטגוריה עודכנה');
      } else {
        const r = await categoriesApi.create({ nameHe, nameAr });
        setCategories((p) => [...p, r.data]);
        toast.success('קטגוריה נוספה');
      }
      reset();
    } finally { setSaving(false); }
  };

  const del = async (id: string) => {
    if (!confirm('למחוק קטגוריה זו?')) return;
    await categoriesApi.delete(id);
    setCategories((p) => p.filter((c) => c.id !== id));
    toast.success('קטגוריה נמחקה');
  };

  const reset = () => { setShowForm(false); setEditId(null); setNameHe(''); setNameAr(''); };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">ניהול קטגוריות</h1>
        <button onClick={() => { reset(); setShowForm(true); }} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" />קטגוריה חדשה
        </button>
      </div>

      {showForm && (
        <div className="card mb-4 border-2 border-primary-200">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm">{editId ? 'עריכת קטגוריה' : 'קטגוריה חדשה'}</h3>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">שם בעברית *</label>
              <input value={nameHe} onChange={(e) => setNameHe(e.target.value)} className="input-field" placeholder="אלקטרוניקה" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">שם בערבית</label>
              <input value={nameAr} onChange={(e) => setNameAr(e.target.value)} className="input-field" placeholder="إلكترونيات" dir="rtl" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={save} disabled={saving} className="btn-primary text-sm px-5">{saving ? 'שומר...' : 'שמור'}</button>
            <button onClick={reset} className="btn-secondary text-sm px-5">ביטול</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="card animate-pulse h-12" />)}</div>
      ) : categories.length === 0 ? (
        <div className="card text-center py-12"><Tag className="w-12 h-12 mx-auto mb-3 text-gray-300" /><p className="text-gray-500">אין קטגוריות</p></div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">שם בעברית</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">שם בערבית</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{cat.nameHe}</td>
                  <td className="px-4 py-3 text-gray-600" dir="rtl">{cat.nameAr || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setEditId(cat.id); setNameHe(cat.nameHe); setNameAr(cat.nameAr || ''); setShowForm(true); }}
                        className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => del(cat.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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
