'use client';
import Image from 'next/image';
import Link from 'next/link';
import { DoorOpen } from 'lucide-react';

interface Props {
  product: any;
  displayImage: string | null;
  activeDoorType?: string;
}

export default function DoorProductCard({ product, displayImage, activeDoorType }: Props) {
  const basePrice = Number(product.baseEstimatedPrice || 0);
  const customerPrice = Number(product.customerPrice || 0);
  const price = customerPrice || basePrice;

  // Determine discount: if customerPrice < baseEstimatedPrice show discount
  const hasDiscount = basePrice > 0 && customerPrice > 0 && customerPrice < basePrice;
  const discountPct = hasDiscount ? Math.round((1 - customerPrice / basePrice) * 100) : 0;

  // Badge logic: "חדש" if created in last 30 days, "במבצע" if discounted
  const isNew = product.createdAt
    ? Date.now() - new Date(product.createdAt).getTime() < 30 * 24 * 60 * 60 * 1000
    : false;
  const badge = hasDiscount ? 'במבצע' : isNew ? 'חדש' : null;
  const badgeColor = badge === 'חדש' ? 'bg-amber-500' : 'bg-gray-800';

  const doorTypeLabel =
    activeDoorType === 'single' ? 'דלת' :
    activeDoorType === 'single_half' ? 'דלת וחצי' :
    activeDoorType === 'double' ? 'דלת כפולה' : null;

  return (
    <Link href={`/products/${product.id}`} className="group block">
      <div className="bg-white border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200 relative flex flex-col">

        {/* Top: product name + badge */}
        <div className="flex items-start justify-between px-4 pt-4 pb-2 min-h-[52px]">
          <div className="flex-1 pr-2">
            <h3 className="font-bold text-gray-900 text-base leading-snug">
              {product.nameHe || product.nameAr}
            </h3>
            {product.descriptionHe && (
              <p className="text-gray-400 text-xs mt-0.5 line-clamp-1">{product.descriptionHe}</p>
            )}
          </div>
          {badge && (
            <div className={`${badgeColor} text-white text-xs font-bold px-2.5 py-1 shrink-0 leading-tight text-center`}>
              {badge}
            </div>
          )}
        </div>

        {/* Door image — tall portrait ratio */}
        <div className="relative mx-4 mb-0" style={{ aspectRatio: '3/4' }}>
          {displayImage ? (
            <Image
              src={displayImage}
              alt={product.nameHe || ''}
              fill
              className="object-contain group-hover:scale-[1.02] transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-200 gap-2 bg-gray-50">
              <DoorOpen className="w-16 h-16" />
              <span className="text-xs text-gray-300 font-medium">Q Door</span>
            </div>
          )}
          {doorTypeLabel && (
            <div className="absolute bottom-2 left-2 bg-primary-700/85 text-white text-xs font-bold px-2 py-0.5 rounded">
              {doorTypeLabel}
            </div>
          )}
        </div>

        {/* Bottom: discount + price */}
        <div className="px-4 pt-3 pb-4 mt-auto border-t border-gray-100">
          {hasDiscount && (
            <div className="bg-amber-50 text-amber-700 text-xs font-semibold px-2.5 py-1 inline-block mb-2">
              {discountPct}% הנחה בכפוף לתנאי המבצע
            </div>
          )}
          {price > 0 ? (
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-gray-400 text-xs">החל מ-</span>
              {hasDiscount && (
                <span className="text-gray-400 text-sm line-through">
                  ₪{basePrice.toLocaleString()}
                </span>
              )}
              <span className="text-primary-700 font-black text-xl">
                {customerPrice > 0 ? customerPrice.toLocaleString() : basePrice.toLocaleString()} ₪
              </span>
            </div>
          ) : (
            <span className="text-gray-400 text-sm">מחיר לפי הצעה</span>
          )}
        </div>
      </div>
    </Link>
  );
}
