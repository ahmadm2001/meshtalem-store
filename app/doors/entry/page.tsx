'use client';
import { useEffect, useState, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { DoorOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { productsApi } from '@/lib/api';
import StoreLayout from '@/components/layout/StoreLayout';
import DoorCategoryNav from '@/components/home/DoorCategoryNav';

const ENTRY_CATEGORY_ID = '754af081-fa31-423b-adf9-3171140928ea';

const SUBCATEGORIES = [
  { id: 'a7ce1f01-94b9-4f58-a160-5da058762845', nameHe: 'דלתות חלקות' },
  { id: 'acecba77-5476-4769-8e80-4a4715d1f496', nameHe: 'חיפויי עץ/ פורניר ופורמייקה' },
  { id: '94033109-9968-437e-b891-083d7f9c1645', nameHe: 'אלמנטים דקורטיביים' },
  { id: '6f7bd14f-aed8-416d-a737-2f737dc5756d', nameHe: 'חלונות וסורגים' },
];

function EntryDoorsContent() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubcat, setActiveSubcat] = useState('all');

  const activeLabel = activeSubcat === 'all'
    ? null
    : SUBCATEGORIES.find((s) => s.id === activeSubcat)?.nameHe;

  useEffect(() => {
    setLoading(true);
    const categoryId = activeSubcat === 'all' ? ENTRY_CATEGORY_ID : activeSubcat;
    productsApi.getPublic({ categoryId, limit: 40 })
      .then((r) => setProducts(r.data?.products || r.data || []))
      .finally(() => setLoading(false));
  }, [activeSubcat]);

  return (
    <StoreLayout>
      {/* Category Nav with door icons */}
      <DoorCategoryNav
        categories={SUBCATEGORIES}
        active={activeSubcat}
        onChange={setActiveSubcat}
        allLabel="כל הדלתות"
      />

      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          <nav className="flex items-center gap-1.5 text-sm text-gray-500">
            <Link href="/" className="hover:text-primary-700 transition-colors">ראשי</Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            <Link href="/doors/entry" className="hover:text-primary-700 transition-colors">דלתות כניסה</Link>
            {activeLabel && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                <span className="text-gray-800 font-semibold">{activeLabel}</span>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse shadow-card">
                <div className="bg-gray-100 h-56" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-100 rounded-lg" />
                  <div className="h-4 bg-gray-100 rounded-lg w-2/3" />
                  <div className="h-9 bg-gray-100 rounded-xl mt-3" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <DoorOpen className="w-14 h-14 mx-auto text-gray-200 mb-4" />
            <p className="text-gray-500 font-semibold text-lg mb-2">אין דגמים בקטגוריה זו עדיין</p>
            <button
              onClick={() => setActiveSubcat('all')}
              className="text-primary-600 hover:text-primary-700 text-sm font-semibold"
            >
              הצג את כל הדגמים ←
            </button>
          </div>
        ) : (
          <>
            <p className="text-gray-400 text-sm mb-6">{products.length} דגמים</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {products.map((product) => {
                const price = Number(product.customerPrice || product.baseEstimatedPrice || 0);
                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl overflow-hidden shadow-card border border-gray-100 hover:shadow-premium hover:-translate-y-0.5 transition-all duration-200 group flex flex-col"
                  >
                    <Link href={`/products/${product.id}`} className="block">
                      <div className="relative h-56 bg-slate-100 overflow-hidden">
                        {product.images?.[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.nameHe || ''}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2">
                            <DoorOpen className="w-14 h-14" />
                            <span className="text-xs font-medium">Q Door</span>
                          </div>
                        )}
                        {product.category?.nameHe && (
                          <div className="absolute top-3 right-3 bg-white/90 text-primary-700 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
                            {product.category.nameHe}
                          </div>
                        )}
                      </div>
                      <div className="p-4 pb-3">
                        <h3 className="font-bold text-gray-900 text-base mb-1 line-clamp-2">
                          {product.nameHe || product.nameAr}
                        </h3>
                        {product.descriptionHe && (
                          <p className="text-gray-400 text-xs line-clamp-2 mb-2">{product.descriptionHe}</p>
                        )}
                        {price > 0 ? (
                          <div className="text-xl font-black text-primary-700">₪{price.toLocaleString()}</div>
                        ) : (
                          <span className="text-sm text-gray-400">מחיר לפי הצעה</span>
                        )}
                      </div>
                    </Link>
                    <div className="px-4 pb-4 mt-auto">
                      <Link
                        href={`/products/${product.id}`}
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all"
                      >
                        הגדרת הדלת <ChevronLeft className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </StoreLayout>
  );
}

export default function EntryDoorsPage() {
  return <Suspense><EntryDoorsContent /></Suspense>;
}
