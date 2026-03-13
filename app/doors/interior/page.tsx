'use client';
import { useEffect, useState, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { DoorOpen, ChevronLeft } from 'lucide-react';
import { productsApi, categoriesApi } from '@/lib/api';
import StoreLayout from '@/components/layout/StoreLayout';
import CategoryHeader, { DoorTypeId } from '@/components/home/CategoryHeader';

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
  const [products, setProducts] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<{ id: string; nameHe: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubcat, setActiveSubcat] = useState('all');
  const [activeDoorType, setActiveDoorType] = useState<DoorTypeId>('all');

  const activeSubcatLabel = subcategories.find((s) => s.id === activeSubcat)?.nameHe;

  useEffect(() => {
    categoriesApi.getAll().then((r) => {
      const cats = r.data || [];
      const interior = cats.find((c: any) => c.id === INTERIOR_CATEGORY_ID);
      setSubcategories(interior?.children || []);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    // Fetch all products for the main category (backend includes subcategory products)
    productsApi.getPublic({ categoryId: INTERIOR_CATEGORY_ID, limit: 60 })
      .then((r) => setProducts(r.data?.products || r.data || []))
      .finally(() => setLoading(false));
  }, []);

  const subcatFiltered = activeSubcat === 'all'
    ? products
    : products.filter((p) => p.category?.id === activeSubcat);

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
            <p className="text-gray-400 text-sm mb-6">{filteredProducts.length} דגמים</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProducts.map((product) => {
                const price = Number(product.customerPrice || product.baseEstimatedPrice || 0);
                const displayImage = getProductImage(product, activeDoorType);
                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl overflow-hidden shadow-card border border-gray-100 hover:shadow-premium hover:-translate-y-0.5 transition-all duration-200 group flex flex-col"
                  >
                    <Link href={`/products/${product.id}`} className="block">
                      <div className="relative h-56 bg-slate-100 overflow-hidden">
                        {displayImage ? (
                          <Image
                            key={displayImage}
                            src={displayImage}
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
                        {activeDoorType !== 'all' && (
                          <div className="absolute bottom-3 left-3 bg-primary-700/90 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                            {activeDoorType === 'single' ? 'דלת' : activeDoorType === 'single_half' ? 'דלת וחצי' : 'דלת כפולה'}
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

export default function InteriorDoorsPage() {
  return <Suspense><InteriorDoorsContent /></Suspense>;
}
