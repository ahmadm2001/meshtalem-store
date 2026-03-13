'use client';
import { useEffect, useState, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { DoorOpen, ChevronLeft, ArrowRight } from 'lucide-react';
import { productsApi } from '@/lib/api';
import StoreLayout from '@/components/layout/StoreLayout';

const ENTRY_CATEGORY_ID = '754af081-fa31-423b-adf9-3171140928ea';

function EntryDoorsContent() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productsApi.getPublic({ categoryId: ENTRY_CATEGORY_ID, limit: 40 })
      .then((r) => setProducts(r.data?.products || r.data || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <StoreLayout>
      {/* Category Hero */}
      <div className="relative h-64 sm:h-80 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/doors/cat-entry.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-l from-black/70 via-black/50 to-black/30" />
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <nav className="flex items-center gap-2 text-white/60 text-sm mb-4">
              <Link href="/" className="hover:text-white transition-colors">בית</Link>
              <ArrowRight className="w-3 h-3" />
              <span className="text-white">דלתות כניסה</span>
            </nav>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">דלתות כניסה</h1>
            <p className="text-white/80 text-lg">אבטחה, עיצוב וטכנולוגיה חכמה</p>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse shadow-card">
                <div className="bg-gray-100 h-56" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-100 rounded-lg" />
                  <div className="h-9 bg-gray-100 rounded-xl mt-3" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <DoorOpen className="w-14 h-14 mx-auto text-gray-200 mb-4" />
            <p className="text-gray-500 font-semibold text-lg mb-2">אין דגמים בקטגוריה זו עדיין</p>
            <Link href="/products" className="text-primary-600 hover:text-primary-700 text-sm font-semibold">
              לכל הדגמים ←
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((product) => {
              const price = Number(product.customerPrice || product.baseEstimatedPrice || 0);
              return (
                <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-card border border-gray-100 hover:shadow-premium hover:-translate-y-0.5 transition-all duration-200 group flex flex-col">
                  <Link href={`/products/${product.id}`} className="block">
                    <div className="relative h-56 bg-slate-100 overflow-hidden">
                      {product.images?.[0] ? (
                        <Image src={product.images[0]} alt={product.nameHe || ''} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300"><DoorOpen className="w-14 h-14" /></div>
                      )}
                    </div>
                    <div className="p-4 pb-3">
                      <h3 className="font-bold text-gray-900 text-base mb-1">{product.nameHe || product.nameAr}</h3>
                      {price > 0 && <div className="text-xl font-black text-primary-700">₪{price.toLocaleString()}</div>}
                    </div>
                  </Link>
                  <div className="px-4 pb-4 mt-auto">
                    <Link href={`/products/${product.id}`} className="w-full bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all">
                      הגדרת הדלת <ChevronLeft className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </StoreLayout>
  );
}

export default function EntryDoorsPage() {
  return <Suspense><EntryDoorsContent /></Suspense>;
}
