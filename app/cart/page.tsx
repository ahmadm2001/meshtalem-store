'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft } from 'lucide-react';
import { useCartStore, CartItem } from '@/store';
import StoreLayout from '@/components/layout/StoreLayout';

/** Render the selected options for a cart item (supports both legacy and new snapshot formats). */
function OptionTags({ item }: { item: CartItem }) {
  // New-style: selectedOptionSnapshots (from configurator engine)
  if (item.selectedOptionSnapshots && item.selectedOptionSnapshots.length > 0) {
    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {item.selectedOptionSnapshots.map((snap, i) => (
          <span
            key={i}
            className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full"
          >
            {snap.groupName}: {snap.selectedValueLabels.join(', ')}
            {snap.priceModifier > 0 && (
              <span className="text-amber-600 font-semibold"> (+₪{snap.priceModifier.toLocaleString()})</span>
            )}
          </span>
        ))}
      </div>
    );
  }

  // Legacy-style: selectedOptions (flat groupName/selectedValue)
  if (item.selectedOptions && item.selectedOptions.length > 0) {
    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {item.selectedOptions.map((opt, i) => (
          <span
            key={i}
            className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full"
          >
            {opt.groupName}: {opt.selectedValue}
            {opt.priceModifier > 0 && (
              <span className="font-semibold"> (+₪{opt.priceModifier})</span>
            )}
          </span>
        ))}
      </div>
    );
  }

  return null;
}

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQty, total, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return (
      <StoreLayout>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </StoreLayout>
    );
  }

  if (items.length === 0) {
    return (
      <StoreLayout>
        <div className="max-w-2xl mx-auto px-4 py-16 text-center" dir="rtl">
          <ShoppingCart className="w-20 h-20 mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-bold text-gray-700 mb-2">העגלה שלך ריקה</h2>
          <p className="text-gray-500 mb-6">הוסף מוצרים כדי להתחיל לקנות</p>
          <Link href="/products" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />לחנות
          </Link>
        </div>
      </StoreLayout>
    );
  }

  return (
    <StoreLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8" dir="rtl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">עגלת קניות</h1>
          <button
            onClick={clearCart}
            className="text-sm text-red-500 hover:text-red-700 transition-colors"
          >
            נקה עגלה
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item, idx) => (
              <div
                key={`${item.productId}-${idx}`}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-start gap-4"
              >
                {/* Image */}
                <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingCart className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm">{item.name}</h3>

                  {/* Option tags */}
                  <OptionTags item={item} />

                  {/* Price */}
                  <div className="mt-1.5">
                    <span className="text-amber-600 font-bold text-base">
                      ₪{item.price.toLocaleString()}
                    </span>
                    {item.optionsExtraCost && item.optionsExtraCost > 0 && (
                      <span className="text-xs text-gray-400 font-normal mr-2">
                        (בסיס ₪{(item.basePrice || item.price - item.optionsExtraCost).toLocaleString()} + תוספת ₪{item.optionsExtraCost.toLocaleString()})
                      </span>
                    )}
                  </div>
                </div>

                {/* Qty controls */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => updateQty(item.productId, item.quantity - 1, item.selectedOptions)}
                      className="px-2 py-1.5 hover:bg-gray-50 transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-3 py-1.5 text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQty(item.productId, item.quantity + 1, item.selectedOptions)}
                      className="px-2 py-1.5 hover:bg-gray-50 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId, item.selectedOptions)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Line total */}
                <div className="text-sm font-bold text-gray-900 w-20 text-left shrink-0">
                  ₪{(item.price * item.quantity).toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sticky top-24">
              <h2 className="font-bold text-gray-900 mb-4">סיכום הזמנה</h2>

              <div className="space-y-2 mb-4">
                {items.map((item, idx) => (
                  <div
                    key={`${item.productId}-${idx}`}
                    className="flex justify-between text-sm text-gray-600"
                  >
                    <span className="truncate ml-2">{item.name} x{item.quantity}</span>
                    <span className="shrink-0">₪{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-3 mb-4">
                <div className="flex justify-between font-bold text-gray-900">
                  <span>סה"כ משוער</span>
                  <span className="text-amber-600 text-lg">₪{total().toLocaleString()}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  המחיר הסופי ייקבע לאחר מדידה מקצועית
                </p>
              </div>

              <button
                onClick={() => router.push('/checkout')}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl transition-all text-center block"
              >
                המשך לתשלום
              </button>
              <Link
                href="/products"
                className="w-full border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium py-2 rounded-xl transition-all text-center block mt-2 text-sm"
              >
                המשך בקניות
              </Link>
            </div>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
