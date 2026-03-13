'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { DoorOpen, ChevronLeft, Shield } from 'lucide-react';
import { productsApi } from '@/lib/api';

export default function FeaturedDoors() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productsApi.getPublic({ limit: 6 })
      .then((r) => setProducts(r.data?.products || r.data || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-20 sm:py-28 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <p className="text-primary-600 text-sm font-bold tracking-widest uppercase mb-3">הדגמים שלנו</p>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
              דגמים מובחרים
            </h2>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold text-sm transition-colors shrink-0"
          >
            לכל הדגמים
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </div>

        {/* Products grid */}
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
          <div className="text-center py-16">
            <DoorOpen className="w-14 h-14 mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400">הדגמים יתווספו בקרוב</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((product) => {
              const price = Number(product.customerPrice || product.baseEstimatedPrice || 0);
              const deposit = Number(product.depositAmount || 0);
              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-card border border-gray-100 hover:shadow-premium hover:-translate-y-0.5 transition-all duration-200 group flex flex-col"
                >
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
                      {product.category?.nameHe && (
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-primary-700 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
                          {product.category.nameHe}
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
                      <div className="flex items-end justify-between mt-2">
                        <div>
                          {price > 0 ? (
                            <>
                              <span className="text-xs text-gray-400">החל מ-</span>
                              <div className="text-2xl font-black text-primary-700 leading-none">
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
                      className="w-full bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
                    >
                      <span>הגדרת הדלת</span>
                      <ChevronLeft className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
