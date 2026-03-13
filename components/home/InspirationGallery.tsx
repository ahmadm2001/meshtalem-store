'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { productsApi } from '@/lib/api';

const FALLBACK_IMAGES = [
  { src: '/images/doors/gallery-1.jpg', alt: 'דלת כניסה פרימיום' },
  { src: '/images/doors/gallery-2.jpg', alt: 'דלת עץ מעוצבת' },
  { src: '/images/doors/gallery-3.png', alt: 'דלת פנים מודרנית' },
  { src: '/images/doors/gallery-4.jpg', alt: 'דלת לבנה אלגנטית' },
  { src: '/images/doors/gallery-5.jpg', alt: 'דלת זכוכית' },
  { src: '/images/doors/gallery-6.jpg', alt: 'דלת עץ קלאסית' },
];

export default function InspirationGallery() {
  const [galleryItems, setGalleryItems] = useState<{ src: string; alt: string; href?: string }[]>(FALLBACK_IMAGES);

  useEffect(() => {
    productsApi.getPublic({ limit: 12 })
      .then((r) => {
        const products = r.data?.products || r.data || [];
        const items = products
          .filter((p: any) => p.images?.[0])
          .slice(0, 6)
          .map((p: any) => ({
            src: p.images[0],
            alt: p.nameHe || p.nameAr || 'דלת',
            href: `/products/${p.id}`,
          }));
        if (items.length >= 4) setGalleryItems(items);
      })
      .catch(() => {});
  }, []);

  return (
    <section className="py-20 sm:py-28 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-primary-600 text-sm font-bold tracking-widest uppercase mb-3">גלריית השראה</p>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight mb-4">
            עיצובים שמדברים בעד עצמם
          </h2>
          <p className="text-gray-500 text-lg max-w-lg mx-auto">
            כל דלת היא יצירת אמנות — בחר את הסגנון שמתאים לך.
          </p>
        </div>

        {/* Masonry-style grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {galleryItems.map((item, i) => {
            const isTall = i === 0 || i === 3; // first and fourth items are taller
            const content = (
              <div
                className={`relative overflow-hidden rounded-2xl bg-gray-100 group cursor-pointer ${
                  isTall ? 'row-span-2' : ''
                }`}
                style={{ height: isTall ? '480px' : '220px' }}
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <div className="bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 text-sm font-semibold text-gray-900">
                    {item.alt}
                  </div>
                </div>
              </div>
            );

            return item.href ? (
              <Link key={i} href={item.href}>{content}</Link>
            ) : (
              <div key={i}>{content}</div>
            );
          })}
        </div>

        {/* View all */}
        <div className="text-center mt-10">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white font-bold px-8 py-3 rounded-xl transition-all text-sm"
          >
            לכל הדגמים
          </Link>
        </div>
      </div>
    </section>
  );
}
