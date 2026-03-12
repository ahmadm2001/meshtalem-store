'use client';
import { useEffect, useState } from 'react';
import {
  CheckCircle, XCircle, Edit, Search, Package, Eye, EyeOff,
  Trash2, X, ShoppingBag, Star, ChevronLeft, ChevronRight,
  Save, AlertTriangle, Plus, Settings, DoorOpen, Clock, Banknote, Wrench
} from 'lucide-react';
import { productsApi, categoriesApi } from '@/lib/api';
import toast from 'react-hot-toast';
import AdminOptionGroupBuilder, { AdminOptionGroup } from '@/components/admin/AdminOptionGroupBuilder';

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  pending: 'ממתין', approved: 'מאושר', rejected: 'נדחה', draft: 'טיוטה'
};
const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  draft: 'bg-gray-100 text-gray-600',
};

const WARRANTY_OPTIONS = [
  { value: 'none',    label: 'ללא אחריות' },
  { value: '6months', label: '6 חודשים' },
  { value: '1year',   label: 'שנה אחת' },
  { value: '2years',  label: 'שנתיים' },
  { value: '3years',  label: '3 שנים' },
  { value: '5years',  label: '5 שנים' },
  { value: '10years', label: '10 שנים' },
];

const MANUFACTURING_TIME_OPTIONS = [
  { value: '',          label: 'לא צוין' },
  { value: '2-4 weeks', label: '2-4 שבועות' },
  { value: '4-6 weeks', label: '4-6 שבועות' },
  { value: '6-8 weeks', label: '6-8 שבועות' },
  { value: '8-12 weeks',label: '8-12 שבועות' },
  { value: 'custom',    label: 'לפי הזמנה (מותאם אישית)' },
];

// ─── Empty form factory ───────────────────────────────────────────────────────

const emptyCreateForm = () => ({
  name: '',
  description: '',
  baseEstimatedPrice: '',
  depositAmount: '',
  manufacturingTime: '',
  warranty: 'none',
  categoryId: '',
  images: '',
  productOptions: [] as AdminOptionGroup[],
});

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('approved');
  const [search, setSearch] = useState('');

  // Preview modal
  const [previewProduct, setPreviewProduct] = useState<any | null>(null);
  const [previewImageIdx, setPreviewImageIdx] = useState(0);

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState(emptyCreateForm());
  const [createSaving, setCreateSaving] = useState(false);
  const [createTab, setCreateTab] = useState<'basic' | 'options' | 'images'>('basic');

  // Edit modal
  const [editProduct, setEditProduct] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [editSaving, setEditSaving] = useState(false);
  const [editTab, setEditTab] = useState<'basic' | 'options' | 'images'>('basic');

  // Reject modal
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // ── Data loading ─────────────────────────────────────────────────────────────

  const load = async (f: string) => {
    setLoading(true);
    try {
      const r = f === 'pending'
        ? await productsApi.getPending()
        : await productsApi.getAll({ status: f });
      setProducts(r.data?.products || r.data || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(filter); }, [filter]);

  useEffect(() => {
    categoriesApi.getFlat().then((r) => setCategories(r.data || [])).catch(() => {});
  }, []);

  // ── Preview ──────────────────────────────────────────────────────────────────

  const openPreview = async (product: any) => {
    try {
      const r = await productsApi.getByIdAdmin(product.id);
      setPreviewProduct(r.data);
    } catch {
      setPreviewProduct(product);
    }
    setPreviewImageIdx(0);
  };

  // ── Approve / Reject / Delete / Hide ─────────────────────────────────────────

  const approve = async (id: string) => {
    try {
      await productsApi.approve(id);
      setProducts((p) => p.filter((x) => x.id !== id));
      setPreviewProduct(null);
      toast.success('✅ מוצר אושר ופורסם בחנות');
    } catch (err: any) {
      toast.error(`שגיאה: ${err?.response?.data?.message || err?.message || 'שגיאה באישור'}`);
    }
  };

  const submitReject = async () => {
    if (!rejectId || !rejectReason.trim()) return;
    await productsApi.reject(rejectId, rejectReason);
    setProducts((p) => p.filter((x) => x.id !== rejectId));
    setRejectId(null);
    setRejectReason('');
    setPreviewProduct(null);
    toast.success('מוצר נדחה');
  };

  const toggleHide = async (id: string) => {
    const r = await productsApi.toggleHide(id);
    setProducts((p) => p.map((x) => x.id === id ? { ...x, isHidden: r.data.isHidden } : x));
    toast.success(r.data.isHidden ? '🙈 מוצר הוסתר' : '👁 מוצר הוצג מחדש');
  };

  const deleteProduct = async (id: string, name: string) => {
    if (!confirm(`למחוק את "${name}"? פעולה זו לא ניתנת לביטול.`)) return;
    await productsApi.adminDelete(id);
    setProducts((p) => p.filter((x) => x.id !== id));
    toast.success('מוצר נמחק');
  };

  // ── Create ───────────────────────────────────────────────────────────────────

  const openCreate = () => {
    setCreateForm(emptyCreateForm());
    setCreateTab('basic');
    setShowCreate(true);
  };

  const saveCreate = async () => {
    if (!createForm.name.trim()) { toast.error('שם דגם הדלת הוא שדה חובה'); return; }
    setCreateSaving(true);
    try {
      const basePrice = Number(createForm.baseEstimatedPrice) || 0;
      const deposit = Number(createForm.depositAmount) || 0;
      const payload = {
        name: createForm.name.trim(),
        description: createForm.description.trim(),
        baseEstimatedPrice: basePrice || null,
        depositAmount: deposit || null,
        manufacturingTime: createForm.manufacturingTime || null,
        warranty: createForm.warranty || null,
        categoryId: createForm.categoryId || null,
        images: createForm.images.split('\n').map((s) => s.trim()).filter(Boolean),
        productOptions: createForm.productOptions.length > 0 ? createForm.productOptions : null,
      };
      const r = await productsApi.adminCreate(payload);
      setProducts((p) => [r.data, ...p]);
      setShowCreate(false);
      toast.success('✅ דגם הדלת נוצר ופורסם בחנות');
    } catch (err: any) {
      toast.error(`שגיאה: ${err?.response?.data?.message || err?.message || 'שגיאה ביצירה'}`);
    } finally { setCreateSaving(false); }
  };

  // ── Edit ─────────────────────────────────────────────────────────────────────

  const openEdit = async (product: any) => {
    setEditTab('basic');
    try {
      const r = await productsApi.getByIdAdmin(product.id);
      const p = r.data;
      setEditProduct(p);
      setEditForm({
        nameHe: p.nameHe || p.nameAr || '',
        descriptionHe: p.descriptionHe || p.descriptionAr || '',
        baseEstimatedPrice: p.baseEstimatedPrice ?? p.customerPrice ?? p.price ?? '',
        depositAmount: p.depositAmount ?? '',
        manufacturingTime: p.manufacturingTime || '',
        warranty: p.warranty || 'none',
        categoryId: p.categoryId || '',
        images: (p.images || []).join('\n'),
        productOptions: (p.productOptions || []) as AdminOptionGroup[],
      });
    } catch {
      setEditProduct(product);
      setEditForm({
        nameHe: product.nameHe || product.nameAr || '',
        descriptionHe: product.descriptionHe || product.descriptionAr || '',
        baseEstimatedPrice: product.baseEstimatedPrice ?? product.customerPrice ?? product.price ?? '',
        depositAmount: product.depositAmount ?? '',
        manufacturingTime: product.manufacturingTime || '',
        warranty: product.warranty || 'none',
        categoryId: product.categoryId || '',
        images: (product.images || []).join('\n'),
        productOptions: (product.productOptions || []) as AdminOptionGroup[],
      });
    }
  };

  const saveEdit = async () => {
    if (!editProduct) return;
    setEditSaving(true);
    try {
      const basePrice = Number(editForm.baseEstimatedPrice) || null;
      const deposit = Number(editForm.depositAmount) || null;
      const payload = {
        nameHe: editForm.nameHe,
        nameAr: editForm.nameHe,
        descriptionHe: editForm.descriptionHe,
        descriptionAr: editForm.descriptionHe,
        baseEstimatedPrice: basePrice,
        depositAmount: deposit,
        manufacturingTime: editForm.manufacturingTime || null,
        warranty: editForm.warranty || null,
        categoryId: editForm.categoryId || null,
        images: editForm.images.split('\n').map((s: string) => s.trim()).filter(Boolean),
        productOptions: editForm.productOptions.length > 0 ? editForm.productOptions : null,
      };
      const r = await productsApi.adminUpdate(editProduct.id, payload);
      setProducts((p) => p.map((x) => x.id === editProduct.id ? { ...x, ...r.data } : x));
      setEditProduct(null);
      toast.success('✅ דגם הדלת עודכן בהצלחה');
    } catch (err: any) {
      toast.error(`שגיאה: ${err?.response?.data?.message || err?.message || 'שגיאה בשמירה'}`);
    } finally { setEditSaving(false); }
  };

  // ── Derived ──────────────────────────────────────────────────────────────────

  const filtered = products.filter((p) => {
    return (p.nameHe || p.nameAr || '').toLowerCase().includes(search.toLowerCase());
  });

  // ── Tab component helper ──────────────────────────────────────────────────────

  const TabBar = ({
    active, onChange, optionsCount
  }: { active: string; onChange: (t: any) => void; optionsCount: number }) => (
    <div className="flex border-b mb-4">
      {[
        { key: 'basic',   label: 'פרטי הדגם' },
        { key: 'options', label: `קונפיגורטור${optionsCount > 0 ? ` (${optionsCount})` : ''}` },
        { key: 'images',  label: 'תמונות' },
      ].map((tab) => (
        <button key={tab.key} type="button"
          onClick={() => onChange(tab.key)}
          className={`flex-1 py-2.5 text-sm font-medium border-b-2 transition-colors ${active === tab.key ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          {tab.label}
        </button>
      ))}
    </div>
  );

  // ── Door basic fields shared between create & edit ────────────────────────────

  const DoorBasicFields = ({
    form, setForm, isCreate = false
  }: { form: any; setForm: (f: any) => void; isCreate?: boolean }) => (
    <div className="space-y-5">
      {/* Model name */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          שם דגם הדלת <span className="text-red-500">*</span>
        </label>
        <input
          value={isCreate ? form.name : form.nameHe}
          onChange={(e) => setForm(isCreate
            ? { ...form, name: e.target.value }
            : { ...form, nameHe: e.target.value }
          )}
          placeholder="לדוגמה: דלת כניסה פרמיום TITAN 900"
          className="input-field" dir="rtl"
        />
        <p className="text-xs text-gray-400 mt-1">שם הדגם שיוצג ללקוחות בחנות</p>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">תיאור הדגם</label>
        <textarea
          value={isCreate ? form.description : form.descriptionHe}
          onChange={(e) => setForm(isCreate
            ? { ...form, description: e.target.value }
            : { ...form, descriptionHe: e.target.value }
          )}
          placeholder="תיאור מפורט של הדלת — חומרים, עיצוב, תכונות בטיחות..."
          className="input-field" rows={4} dir="rtl"
        />
      </div>

      {/* Pricing section */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
        <h3 className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
          <Banknote className="w-4 h-4" /> תמחור
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              מחיר בסיס משוער (₪)
            </label>
            <input type="number" min={0}
              value={form.baseEstimatedPrice}
              onChange={(e) => setForm({ ...form, baseEstimatedPrice: e.target.value })}
              placeholder="0"
              className="input-field"
            />
            <p className="text-xs text-gray-400 mt-1">לפני הוספת אפשרויות קונפיגורציה</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              דמי מקדמה (₪)
            </label>
            <input type="number" min={0}
              value={form.depositAmount}
              onChange={(e) => setForm({ ...form, depositAmount: e.target.value })}
              placeholder="0"
              className="input-field"
            />
            <p className="text-xs text-gray-400 mt-1">סכום שהלקוח משלם בהזמנה</p>
          </div>
        </div>
      </div>

      {/* Manufacturing & warranty */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Wrench className="w-4 h-4" /> ייצור ואחריות
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              זמן ייצור
            </label>
            <select
              value={form.manufacturingTime}
              onChange={(e) => setForm({ ...form, manufacturingTime: e.target.value })}
              className="input-field text-sm"
            >
              {MANUFACTURING_TIME_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              אחריות
            </label>
            <select
              value={form.warranty}
              onChange={(e) => setForm({ ...form, warranty: e.target.value })}
              className="input-field text-sm"
            >
              {WARRANTY_OPTIONS.map((w) => (
                <option key={w.value} value={w.value}>{w.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Category */}
      {categories.length > 0 && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">קטגוריה</label>
          <select
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            className="input-field"
          >
            <option value="">— ללא קטגוריה —</option>
            {categories.map((c: any) => (
              <option key={c.id} value={c.id}>{c.nameHe || c.nameAr}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div dir="rtl">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <DoorOpen className="w-6 h-6 text-blue-600" />
            דגמי דלתות
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">ניהול קטלוג הדלתות של Q DOOR</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          דגם חדש
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="חיפוש דגמים..." className="input-field pr-9" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['pending', 'approved', 'rejected'].map((s) => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filter === s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {{ pending: 'ממתינים', approved: 'פעילים', rejected: 'נדחו' }[s]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products List */}
      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="card animate-pulse h-20" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12">
          <DoorOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500 mb-4">לא נמצאו דגמים</p>
          <button onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium">
            <Plus className="w-4 h-4" /> הוסף דגם ראשון
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((product) => (
            <div key={product.id} className={`card ${product.isHidden ? 'opacity-60 border-dashed' : ''}`}>
              <div className="flex items-start gap-4">
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <DoorOpen className="w-6 h-6 text-gray-300" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900 text-sm truncate">{product.nameHe || product.nameAr}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[product.status]}`}>
                      {STATUS_LABELS[product.status]}
                    </span>
                    {product.isHidden && (
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">מוסתר</span>
                    )}
                    {product.productOptions?.length > 0 && (
                      <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Settings className="w-3 h-3" /> {product.productOptions.length} קבוצות
                      </span>
                    )}
                  </div>
                  <div className="flex gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                    {(product.baseEstimatedPrice || product.customerPrice || product.price) && (
                      <span className="flex items-center gap-1">
                        <Banknote className="w-3 h-3" />
                        מחיר בסיס: ₪{Number(product.baseEstimatedPrice ?? product.customerPrice ?? product.price).toLocaleString()}
                      </span>
                    )}
                    {product.depositAmount && (
                      <span className="flex items-center gap-1 text-green-600">
                        מקדמה: ₪{Number(product.depositAmount).toLocaleString()}
                      </span>
                    )}
                    {product.manufacturingTime && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {product.manufacturingTime}
                      </span>
                    )}
                    {product.category?.nameHe && (
                      <span>קטגוריה: {product.category.nameHe}</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0 flex-wrap justify-end">
                  <button onClick={() => openPreview(product)} title="תצוגה מקדימה"
                    className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button onClick={() => openEdit(product)} title="עריכה"
                    className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => toggleHide(product.id)}
                    title={product.isHidden ? 'הצג דגם' : 'הסתר דגם'}
                    className={`p-1.5 rounded-lg transition-colors ${product.isHidden ? 'text-green-500 hover:bg-green-50' : 'text-orange-400 hover:bg-orange-50'}`}>
                    {product.isHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  {product.status === 'pending' && (
                    <>
                      <button onClick={() => approve(product.id)}
                        className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-xs font-medium">
                        <CheckCircle className="w-3.5 h-3.5" />אשר
                      </button>
                      <button onClick={() => { setRejectId(product.id); setRejectReason(''); }}
                        className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-medium">
                        <XCircle className="w-3.5 h-3.5" />דחה
                      </button>
                    </>
                  )}
                  <button onClick={() => deleteProduct(product.id, product.nameHe || product.nameAr)} title="מחיקה"
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== CREATE MODAL ===== */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
              <div>
                <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                  <DoorOpen className="w-5 h-5 text-blue-600" />
                  הוספת דגם דלת חדש
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">הדגם יפורסם מיד בחנות (מאושר אוטומטית)</p>
              </div>
              <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <TabBar active={createTab} onChange={setCreateTab} optionsCount={createForm.productOptions.length} />

              {/* Basic Tab */}
              {createTab === 'basic' && (
                <DoorBasicFields form={createForm} setForm={setCreateForm} isCreate={true} />
              )}

              {/* Options Tab */}
              {createTab === 'options' && (
                <div>
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-4 text-sm text-blue-700">
                    <strong>קונפיגורטור הדלת</strong> — הגדר את אפשרויות הבחירה שהלקוח יעבור בעת הזמנת הדלת.
                    כל קבוצה מייצגת שלב בבחירה (סוג דלת, גובה, צבע, מנעול וכו׳).
                  </div>
                  <AdminOptionGroupBuilder
                    value={createForm.productOptions}
                    onChange={(groups) => setCreateForm({ ...createForm, productOptions: groups })}
                  />
                </div>
              )}

              {/* Images Tab */}
              {createTab === 'images' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    תמונות הדגם <span className="text-gray-400 text-xs font-normal">(URL אחד בכל שורה)</span>
                  </label>
                  <textarea
                    value={createForm.images}
                    onChange={(e) => setCreateForm({ ...createForm, images: e.target.value })}
                    className="input-field font-mono text-xs" rows={8}
                    placeholder="https://example.com/door-front.jpg&#10;https://example.com/door-side.jpg&#10;https://example.com/door-detail.jpg"
                    dir="ltr"
                  />
                  {createForm.images && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {createForm.images.split('\n').map((url, i) => url.trim() && (
                        <div key={i} className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                          <img src={url.trim()} alt="" className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t flex gap-3 sticky bottom-0 bg-white">
              <button onClick={saveCreate} disabled={createSaving}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold disabled:opacity-50 transition-colors">
                <DoorOpen className="w-5 h-5" />
                {createSaving ? 'מוסיף דגם...' : 'הוסף ופרסם דגם'}
              </button>
              <button onClick={() => setShowCreate(false)}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium">
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== PREVIEW MODAL ===== */}
      {previewProduct && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setPreviewProduct(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
              <div>
                <h2 className="font-bold text-gray-900">תצוגה מקדימה</h2>
                <p className="text-xs text-gray-500 mt-0.5">כך הלקוח יראה את הדגם</p>
              </div>
              <button onClick={() => setPreviewProduct(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Images */}
              {previewProduct.images?.length > 0 && (
                <div className="relative mb-6">
                  <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                    <img src={previewProduct.images[previewImageIdx]} alt="" className="w-full h-full object-contain" />
                  </div>
                  {previewProduct.images.length > 1 && (
                    <>
                      <button onClick={() => setPreviewImageIdx((i) => Math.max(0, i - 1))}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-1 shadow">
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button onClick={() => setPreviewImageIdx((i) => Math.min(previewProduct.images.length - 1, i + 1))}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-1 shadow">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                        {previewProduct.images.map((img: string, i: number) => (
                          <button key={i} onClick={() => setPreviewImageIdx(i)}
                            className={`w-14 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-colors ${i === previewImageIdx ? 'border-primary-500' : 'border-gray-200'}`}>
                            <img src={img} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              <div className="space-y-4">
                <h1 className="text-2xl font-bold text-gray-900">{previewProduct.nameHe || previewProduct.nameAr}</h1>

                {/* Pricing info */}
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex flex-wrap gap-4">
                    {(previewProduct.baseEstimatedPrice || previewProduct.customerPrice) && (
                      <div>
                        <p className="text-xs text-blue-600 font-medium mb-0.5">מחיר בסיס משוער</p>
                        <p className="text-2xl font-bold text-blue-800">
                          ₪{Number(previewProduct.baseEstimatedPrice ?? previewProduct.customerPrice).toLocaleString()}
                        </p>
                      </div>
                    )}
                    {previewProduct.depositAmount && (
                      <div>
                        <p className="text-xs text-green-600 font-medium mb-0.5">דמי מקדמה</p>
                        <p className="text-2xl font-bold text-green-700">
                          ₪{Number(previewProduct.depositAmount).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Meta info */}
                <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                  {previewProduct.manufacturingTime && (
                    <span className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-200">
                      <Clock className="w-4 h-4 text-gray-400" />
                      זמן ייצור: {previewProduct.manufacturingTime}
                    </span>
                  )}
                  {previewProduct.warranty && previewProduct.warranty !== 'none' && (
                    <span className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-200">
                      <Star className="w-4 h-4 text-yellow-400" />
                      אחריות: {WARRANTY_OPTIONS.find((w) => w.value === previewProduct.warranty)?.label || previewProduct.warranty}
                    </span>
                  )}
                  {previewProduct.category?.nameHe && (
                    <span className="bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-200">
                      קטגוריה: {previewProduct.category.nameHe}
                    </span>
                  )}
                </div>

                {(previewProduct.descriptionHe || previewProduct.descriptionAr) && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">תיאור הדגם</h3>
                    <p className="text-gray-600 text-sm leading-relaxed" dir="rtl">
                      {previewProduct.descriptionHe || previewProduct.descriptionAr}
                    </p>
                  </div>
                )}

                {/* Product Options Preview */}
                {previewProduct.productOptions?.length > 0 && (
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <h3 className="font-semibold text-blue-800 mb-3 text-sm">
                      ⚙️ קונפיגורטור הדלת ({previewProduct.productOptions.length} קבוצות)
                    </h3>
                    <div className="space-y-3">
                      {previewProduct.productOptions.map((group: any, gi: number) => (
                        <div key={gi} className="bg-white rounded-lg p-3 border border-blue-100">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0">
                              {group.step ?? gi + 1}
                            </span>
                            <p className="text-sm font-semibold text-blue-800">{group.name}</p>
                            {group.type && (
                              <span className="text-xs bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded-full border border-blue-100">
                                {group.type === 'visual_card' ? 'כרטיסים' : group.type === 'color_grid' ? 'צבעים' : group.type === 'multi_checkbox' ? 'מרובה' : 'בחירה'}
                              </span>
                            )}
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${group.required !== false ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                              {group.required !== false ? 'חובה' : 'אופציונלי'}
                            </span>
                            {group.dependsOn?.groupId && (
                              <span className="text-xs bg-yellow-50 text-yellow-600 px-1.5 py-0.5 rounded-full">
                                תלוי ב: {group.dependsOn.groupId}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {group.values.map((val: any, vi: number) => (
                              <span key={vi} className="text-xs bg-blue-50 border border-blue-200 text-blue-700 px-2 py-1 rounded-lg flex items-center gap-1">
                                {group.type === 'color_grid' && val.colorCode && (
                                  <span className="w-3 h-3 rounded-full border border-blue-200 shrink-0" style={{ backgroundColor: val.colorCode }} />
                                )}
                                {val.label}
                                {val.priceModifier > 0 && <span className="text-green-600 font-medium"> +₪{val.priceModifier}</span>}
                              </span>
                            ))}
                          </div>
                          {group.id && <p className="text-xs text-gray-300 font-mono mt-1.5">ID: {group.id}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button className="w-full btn-primary flex items-center justify-center gap-2 py-3 pointer-events-none opacity-90">
                  <ShoppingBag className="w-5 h-5" />
                  הזמן עכשיו — שלם מקדמה (תצוגה בלבד)
                </button>
              </div>
            </div>

            {previewProduct.status === 'pending' && (
              <div className="p-4 border-t bg-gray-50 flex gap-3">
                <button onClick={() => approve(previewProduct.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-colors">
                  <CheckCircle className="w-5 h-5" /> אשר ופרסם בחנות
                </button>
                <button onClick={() => { setRejectId(previewProduct.id); setRejectReason(''); setPreviewProduct(null); }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-semibold border border-red-200 transition-colors">
                  <XCircle className="w-5 h-5" /> דחה דגם
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== EDIT MODAL ===== */}
      {editProduct && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setEditProduct(null)}>
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
              <div>
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                  <Edit className="w-4 h-4 text-gray-500" />
                  עריכת דגם דלת
                </h2>
                <p className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">{editProduct.nameHe || editProduct.nameAr}</p>
              </div>
              <button onClick={() => setEditProduct(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <TabBar active={editTab} onChange={setEditTab} optionsCount={editForm.productOptions?.length || 0} />

              {/* Basic Tab */}
              {editTab === 'basic' && (
                <DoorBasicFields form={editForm} setForm={setEditForm} isCreate={false} />
              )}

              {/* Options Tab */}
              {editTab === 'options' && (
                <div>
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-4 text-sm text-blue-700">
                    <strong>קונפיגורטור הדלת</strong> — הגדר את אפשרויות הבחירה שהלקוח יעבור בעת הזמנת הדלת.
                  </div>
                  <AdminOptionGroupBuilder
                    value={editForm.productOptions || []}
                    onChange={(groups) => setEditForm({ ...editForm, productOptions: groups })}
                  />
                </div>
              )}

              {/* Images Tab */}
              {editTab === 'images' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    תמונות הדגם <span className="text-gray-400 text-xs font-normal">(URL אחד בכל שורה)</span>
                  </label>
                  <textarea value={editForm.images}
                    onChange={(e) => setEditForm({ ...editForm, images: e.target.value })}
                    className="input-field font-mono text-xs" rows={8} dir="ltr"
                    placeholder="https://example.com/image1.jpg" />
                  {editForm.images && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {editForm.images.split('\n').map((url: string, i: number) => url.trim() && (
                        <div key={i} className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                          <img src={url.trim()} alt="" className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 border-t flex gap-3 sticky bottom-0 bg-white">
              <button onClick={saveEdit} disabled={editSaving}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold disabled:opacity-50 transition-colors">
                <Save className="w-5 h-5" />
                {editSaving ? 'שומר...' : 'שמור שינויים'}
              </button>
              <button onClick={() => setEditProduct(null)}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium">
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== REJECT MODAL ===== */}
      {rejectId && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h2 className="font-bold text-gray-900">דחיית דגם</h2>
            </div>
            <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
              placeholder="סיבת הדחייה..." className="input-field mb-4" rows={3} />
            <div className="flex gap-3">
              <button onClick={submitReject} disabled={!rejectReason.trim()}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold disabled:opacity-40">
                דחה דגם
              </button>
              <button onClick={() => setRejectId(null)}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl">
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
