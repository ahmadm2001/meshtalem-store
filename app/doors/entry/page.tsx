'use client';
import { useEffect, useState, Suspense } from 'react';
import { DoorOpen } from 'lucide-react';
import { productsApi } from '@/lib/api';
import StoreLayout from '@/components/layout/StoreLayout';
import CategoryHeader, { DoorTypeId } from '@/components/home/CategoryHeader';
import DoorProductCard from '@/components/home/DoorProductCard';

// All category IDs that belong to "דלתות כניסה" (parent + all subcategories)
const ENTRY_ALL_IDS = new Set([
  '754af081-fa31-423b-adf9-3171140928ea',
  'a7ce1f01-94b9-4f58-a160-5da058762845',
  'acecba77-5476-4769-8e80-4a4715d1f496',
  '94033109-9968-437e-b891-083d7f9c1645',
  '6f7bd14f-aed8-416d-a737-2f737dc5756d',
]);

const SUBCATEGORIES = [
  { id: 'a7ce1f01-94b9-4f58-a160-5da058762845', nameHe: 'דלתות חלקות' },
  { id: 'acecba77-5476-4769-8e80-4a4715d1f496', nameHe: 'חיפויי עץ/ פורניר ופורמייקה' },
  { id: '94033109-9968-437e-b891-083d7f9c1645', nameHe: 'אלמנטים דקורטיביים' },
  { id: '6f7bd14f-aed8-416d-a737-2f737dc5756d', nameHe: 'חלונות וסורגים' },
];

function getProductImage(product: any, doorType: DoorTypeId): string | null {
  if (doorType === 'all') return product.images?.[0] || null;
  const variants: any[] = product.doorVariants || [];
  const variant = variants.find((v: any) => v.id === doorType);
  return variant?.image || product.images?.[0] || null;
}

function productHasDoorType(product: any, doorType: DoorTypeId): boolean {
  if (doorType === 'all') return true;
  return (product.doorVariants || []).some((v: any) => v.id === doorType);
}

function EntryDoorsContent() {
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubcat, setActiveSubcat] = useState('all');
  const [activeDoorType, setActiveDoorType] = useState<DoorTypeId>('all');

  const activeSubcatLabel = SUBCATEGORIES.find((s) => s.id === activeSubcat)?.nameHe;

  useEffect(() => {
    setLoading(true);
    productsApi.getPublic({ limit: 100 })
      .then((r) => {
        const products = r.data?.products || r.data || [];
        const entryProducts = products.filter((p: any) => {
          const catId = p.category?.id;
          return catId && ENTRY_ALL_IDS.has(catId);
        });
        setAllProducts(entryProducts);
      })
      .finally(() => setLoading(false));
  }, []);

  const subcatFiltered = activeSubcat === 'all'
    ? allProducts
    : allProducts.filter((p) => p.category?.id === activeSubcat);

  const filteredProducts = activeDoorType === 'all'
    ? subcatFiltered
    : subcatFiltered.filter((p) => productHasDoorType(p, activeDoorType));

  return (
    <StoreLayout>
      <CategoryHeader
        mainCategoryId="entry"
        mainCategoryName="דלתות כניסה"
        subcategories={SUBCATEGORIES}
        activeSubcat={activeSubcat}
        onSubcatChange={(id) => { setActiveSubcat(id); setActiveDoorType('all'); }}
        activeDoorType={activeDoorType}
        onDoorTypeChange={setActiveDoorType}
        breadcrumbLabel={activeSubcatLabel}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 animate-pulse">
                <div className="h-12 bg-gray-50 m-4" />
                <div className="bg-gray-100 mx-4" style={{ aspectRatio: '3/4' }} />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-100 rounded" />
                  <div className="h-6 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <DoorOpen className="w-14 h-14 mx-auto text-gray-200 mb-4" />
            <p className="text-gray-500 font-semibold text-lg mb-2">
              {activeDoorType !== 'all' ? 'אין דגמים עם סוג דלת זה' : 'אין דגמים בקטגוריה זו עדיין'}
            </p>
            <button
              onClick={() => { setActiveSubcat('all'); setActiveDoorType('all'); }}
              className="text-primary-600 hover:text-primary-700 text-sm font-semibold"
            >
              הצג את כל הדגמים ←
            </button>
          </div>
        ) : (
          <>
            <p className="text-gray-400 text-sm mb-5">{filteredProducts.length} דגמים</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <DoorProductCard
                  key={product.id}
                  product={product}
                  displayImage={getProductImage(product, activeDoorType)}
                  activeDoorType={activeDoorType !== 'all' ? activeDoorType : undefined}
                />
              ))}
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
