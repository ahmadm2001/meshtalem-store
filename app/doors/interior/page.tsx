'use client';
import { useEffect, useState, Suspense } from 'react';
import { DoorOpen } from 'lucide-react';
import { productsApi, categoriesApi } from '@/lib/api';
import StoreLayout from '@/components/layout/StoreLayout';
import CategoryHeader, { DoorTypeId } from '@/components/home/CategoryHeader';
import DoorProductCard from '@/components/home/DoorProductCard';

const INTERIOR_CATEGORY_ID = '8760bdc1-bfbb-408a-9735-790b6685728e';

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

function InteriorDoorsContent() {
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<{ id: string; nameHe: string }[]>([]);
  const [interiorIds, setInteriorIds] = useState<Set<string>>(new Set([INTERIOR_CATEGORY_ID]));
  const [loading, setLoading] = useState(true);
  const [activeSubcat, setActiveSubcat] = useState('all');
  const [activeDoorType, setActiveDoorType] = useState<DoorTypeId>('all');

  const activeSubcatLabel = subcategories.find((s) => s.id === activeSubcat)?.nameHe;

  useEffect(() => {
    categoriesApi.getAll().then((r) => {
      const cats = r.data || [];
      const interior = cats.find((c: any) => c.id === INTERIOR_CATEGORY_ID);
      const children = interior?.children || [];
      setSubcategories(children);
      setInteriorIds(new Set([INTERIOR_CATEGORY_ID, ...children.map((c: any) => c.id)]));
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    productsApi.getPublic({ limit: 100 })
      .then((r) => {
        setAllProducts(r.data?.products || r.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const entryProducts = allProducts.filter((p) => {
    const catId = p.category?.id;
    return catId && interiorIds.has(catId);
  });

  const subcatFiltered = activeSubcat === 'all'
    ? entryProducts
    : entryProducts.filter((p) => p.category?.id === activeSubcat);

  const filteredProducts = activeDoorType === 'all'
    ? subcatFiltered
    : subcatFiltered.filter((p) => productHasDoorType(p, activeDoorType));

  return (
    <StoreLayout>
      <CategoryHeader
        mainCategoryId="interior"
        mainCategoryName="דלתות פנים"
        subcategories={subcategories}
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
              className="text-gray-900 hover:text-gray-800 text-sm font-semibold"
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

export default function InteriorDoorsPage() {
  return <Suspense><InteriorDoorsContent /></Suspense>;
}
