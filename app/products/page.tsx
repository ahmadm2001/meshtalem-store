'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { DoorOpen, Star, Search, ChevronLeft, Shield, Clock, Wrench } from 'lucide-react';
import { productsApi, categoriesApi } from '@/lib/api';
import { useCartStore } from '@/store';
import StoreLayout from '@/components/layout/StoreLayout';
import toast from 'react-hot-toast';

function ProductsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCat, setSelectedCat] = useState('');
  const [selectedSub, setSelectedSub] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const { addItem } = useCartStore();

  useEffect(() => {
    categoriesApi.getAll().then((r) => setCategories(r.data || []));
  }, []);

  const subCategories = categories.find((c: any) => c.id === selectedCat)?.children || [];

  const selectRoot = (id: string) => {
    setSelectedCat(id);
    setSelectedSub('');
  };

  useEffect(() => {
    setLoading(true);
    const filterCatId = selectedSub || selectedCat || undefined;
    productsApi.getPublic({ categoryId: filterCatId, search: search || undefined, limit: 40 })
      .then((r) => setProducts(r.data?.products || r.data || []))
      .finally(() => setLoading(false));
  }, [selectedCat, selectedSub, search]);

  const handleAddToCart = (product: any) => {
    const price = Number(product.customerPrice || product.baseEstimatedPrice || 0);
    addItem({ productId: product.id, name: product.nameHe || product.nameAr, price, basePrice: price, quantity: 1, image: product.images?.[0] });
    toast.success('נוסף לעגלה!');
  };

  return (
    <StoreLayout>
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 text-white overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gray-900 rounded-full opacity-20 -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-gray-500 rounded-full opacity-20 translate-x-1/3 translate-y-1/3" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-primary-100 text-xs font-semibold px-3 py-1.5 rounded-full mb-5 border border-white/20">
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              דלתות פרימיום בהתאמה אישית
            </div>
            <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight tracking-tight">
              הדלת שמגדירה<br />
              <span className="text-yellow-400">את הבית שלך</span>
            </h1>
            <p className="text-gray-300 text-lg mb-8 leading-relaxed">
              עיצוב, איכות ואמינות — בחר מתוך מגוון דלתות פרימיום ותתאים אותן בדיוק לצרכים שלך.
            </p>

            {/* Search bar */}
            <div className="flex gap-3 max-w-lg">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="חפש דלת..."
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-primary-300 rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              <button className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-5 py-3 rounded-xl text-sm transition-all shadow-lg">
                חיפוש
              </button>
            </div>
          </div>
        </div>

        {/* Feature badges */}
        <div className="relative border-t border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex gap-6 overflow-x-auto text-sm text-gray-300">
              <div className="flex items-center gap-2 shrink-0">
                <Shield className="w-4 h-4 text-yellow-400" />
                <span>אחריות עד 10 שנים</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Wrench className="w-4 h-4 text-yellow-400" />
                <span>התקנה מקצועית</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Clock className="w-4 h-4 text-yellow-400" />
                <span>ייצור בהתאמה אישית</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <DoorOpen className="w-4 h-4 text-yellow-400" />
                <span>מגוון עיצובים</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex gap-7">
          {/* Sidebar */}
          <aside className="w-56 shrink-0 hidden md:block">
            <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-4 sticky top-28">
              <h3 className="font-bold text-gray-800 mb-4 text-sm flex items-center gap-2">
                <DoorOpen className="w-4 h-4 text-gray-700" />
                קטגוריות
              </h3>
              <ul className="space-y-0.5">
                <li>
                  <button
                    onClick={() => selectRoot('')}
                    className={`w-full text-right text-sm px-3 py-2.5 rounded-xl transition-all ${
                      !selectedCat ? 'bg-gray-900 text-white font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    כל הדלתות
                  </button>
                </li>
                {categories.map((cat: any) => (
                  <li key={cat.id}>
                    <button
                      onClick={() => selectRoot(cat.id)}
                      className={`w-full text-right text-sm px-3 py-2.5 rounded-xl transition-all flex items-center justify-between ${
                        selectedCat === cat.id ? 'bg-gray-900 text-white font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <span>{cat.nameHe}</span>
                      {(cat.children?.length ?? 0) > 0 && (
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${selectedCat === cat.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                          {cat.children.length}
                        </span>
                      )}
                    </button>
                    {selectedCat === cat.id && (cat.children?.length ?? 0) > 0 && (
                      <ul className="mr-3 mt-1 space-y-0.5 border-r-2 border-gray-200 pr-2">
                        <li>
                          <button
                            onClick={() => setSelectedSub('')}
                            className={`w-full text-right text-xs px-2 py-1.5 rounded-lg transition-all ${
                              !selectedSub ? 'text-gray-900 font-semibold' : 'text-gray-500 hover:bg-gray-50'
                            }`}
                          >הכל</button>
                        </li>
                        {cat.children.map((sub: any) => (
                          <li key={sub.id}>
                            <button
                              onClick={() => setSelectedSub(sub.id)}
                              className={`w-full text-right text-xs px-2 py-1.5 rounded-lg transition-all ${
                                selectedSub === sub.id ? 'text-gray-900 font-semibold bg-gray-50' : 'text-gray-500 hover:bg-gray-50'
                              }`}
                            >{sub.nameHe}</button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1 min-w-0">
            {/* Mobile categories */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4 md:hidden">
              <button
                onClick={() => selectRoot('')}
                className={`shrink-0 text-sm px-4 py-2 rounded-full font-semibold transition-all ${
                  !selectedCat ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600'
                }`}
              >הכל</button>
              {categories.map((cat: any) => (
                <button key={cat.id} onClick={() => selectRoot(cat.id)}
                  className={`shrink-0 text-sm px-4 py-2 rounded-full font-semibold transition-all ${
                    selectedCat === cat.id ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600'
                  }`}
                >{cat.nameHe}</button>
              ))}
            </div>

            {/* Section header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedCat ? categories.find((c: any) => c.id === selectedCat)?.nameHe : 'כל הדלתות'}
                {!loading && <span className="text-sm font-normal text-gray-400 mr-2">({products.length})</span>}
              </h2>
            </div>

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
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DoorOpen className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-lg font-semibold text-gray-700">לא נמצאו דלתות</p>
                <p className="text-gray-400 text-sm mt-1">נסה לשנות את מונחי החיפוש</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {products.map((product) => {
                  const price = Number(product.customerPrice || product.baseEstimatedPrice || 0);
                  const deposit = Number(product.depositAmount || 0);
                  const variants = product.doorVariants?.length || 0;
                  return (
                    <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-card border border-gray-100 hover:shadow-premium hover:-translate-y-0.5 transition-all duration-200 group flex flex-col">
                      <Link href={`/products/${product.id}`} className="block">
                        {/* Image */}
                        <div className="relative h-56 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
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
                          {/* Category badge */}
                          {product.category?.nameHe && (
                            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
                              {product.category.nameHe}
                            </div>
                          )}
                          {/* Variants badge */}
                          {variants > 1 && (
                            <div className="absolute top-3 left-3 bg-gray-900/90 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
                              {variants} וריאנטים
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-4 pb-3">
                          <h3 className="font-bold text-gray-900 text-base leading-snug mb-1 line-clamp-2">
                            {product.nameHe || product.nameAr}
                          </h3>
                          {product.descriptionHe && (
                            <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mb-3">
                              {product.descriptionHe}
                            </p>
                          )}

                          {/* Price */}
                          <div className="flex items-end justify-between mt-2">
                            <div>
                              {price > 0 ? (
                                <>
                                  <span className="text-xs text-gray-400">החל מ-</span>
                                  <div className="text-2xl font-black text-gray-900 leading-none">
                                    ₪{price.toLocaleString()}
                                  </div>
                                </>
                              ) : (
                                <span className="text-sm text-gray-400 font-medium">מחיר לפי הצעה</span>
                              )}
                              {deposit > 0 && (
                                <div className="text-xs text-gray-400 mt-0.5">מקדמה: ₪{deposit.toLocaleString()}</div>
                              )}
                            </div>
                            {product.warranty && product.warranty !== 'none' && (
                              <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-1 rounded-lg">
                                <Shield className="w-3 h-3" />
                                אחריות
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>

                      {/* CTA */}
                      <div className="px-4 pb-4 mt-auto">
                        <Link
                          href={`/products/${product.id}`}
                          className="w-full bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
                        >
                          <span>הגדרה והזמנה</span>
                          <ChevronLeft className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}

export default function ProductsPage() {
  return (
    <Suspense>
      <ProductsContent />
    </Suspense>
  );
}
