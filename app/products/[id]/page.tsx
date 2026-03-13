'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Shield, Truck, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { productsApi } from '@/lib/api';
import { useCartStore } from '@/store';
import { useConfiguratorStore } from '@/store/configurator';
import { ConfiguratorPanel } from '@/components/configurator/ConfiguratorPanel';
import StoreLayout from '@/components/layout/StoreLayout';
import toast from 'react-hot-toast';
import { getDeliveryLabelHe, getEstimatedArrivalHe } from '@/lib/colors';

const WARRANTY_LABELS: Record<string, string> = {
  '6_months': 'חצי שנה',
  '1_year': 'שנה',
  '1.5_years': 'שנה וחצי',
  '2_years': 'שנתיים',
  '2.5_years': 'שנתיים וחצי',
  '3_years': 'שלוש שנים',
  '3.5_years': 'שלוש שנים וחצי',
  '4_years': 'ארבע שנים',
  '4.5_years': 'ארבע שנים וחצי',
  '5_years': 'חמש שנים',
};

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);

  const { addItem } = useCartStore();
  const configurator = useConfiguratorStore();

  // ── Load product ──────────────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    productsApi.getById(id)
      .then((r) => {
        const p = r.data;
        setProduct(p);

        const basePrice = Number(p.customerPrice || p.price || 0);
        const defaultImage = Array.isArray(p.images) && p.images.length > 0
          ? p.images[0]
          : '';

        // Build door variants from product.doorVariants
        const doorVariants = Array.isArray(p.doorVariants)
          ? p.doorVariants.map((v: any) => ({
              id: v.id,
              label: v.label,
              basePrice: Number(v.basePrice ?? 0),
            }))
          : [];

        configurator.init({
          productId: p.id,
          productName: p.nameHe || p.nameAr || '',
          basePrice,
          defaultImage,
          rawOptions: p.productOptions ?? [],
          doorVariants,
        });
      })
      .catch(() => router.push('/products'))
      .finally(() => setLoading(false));

    return () => configurator.reset();
  }, [id]);

  // ── Derived values ────────────────────────────────────────────────────────
  const images: string[] = Array.isArray(product?.images)
    ? product.images.filter(Boolean)
    : [];

  // Use configurator imageOverride if set, otherwise the active thumbnail
  const overrideImage = configurator.getPreviewImage();
  const previewImage = overrideImage || images[activeImg] || '';

  const estimatedTotal = configurator.getEstimatedTotal();
  const extraCost = configurator.getOptionsExtraCost();
  const basePrice = configurator.getEffectiveBasePrice
    ? configurator.getEffectiveBasePrice()
    : configurator.basePrice;
  const hasDoorVariants = (configurator.doorVariants ?? []).length > 0;
  const hasOptions = (product?.productOptions ?? []).length > 0 || hasDoorVariants;

  // ── Add to cart ───────────────────────────────────────────────────────────
  const handleAddToCart = () => {
    if (hasOptions && !configurator.isConfigurationComplete()) {
      toast.error('יש להשלים את כל הבחירות הנדרשות');
      return;
    }

    setAddingToCart(true);
    try {
      const snapshot = configurator.buildSnapshot();
      addItem({
        productId: product.id,
        name: product.nameHe || product.nameAr,
        price: estimatedTotal,
        basePrice,
        quantity: qty,
        image: images[0],
        selectedOptions: snapshot.length > 0
          ? snapshot.map((s) => ({
              groupName: s.groupName,
              selectedValue: s.selectedValueLabels.join(', '),
              priceModifier: s.priceModifier,
            }))
          : undefined,
        optionsExtraCost: extraCost > 0 ? extraCost : undefined,
        doorVariant: configurator.getSelectedDoorVariant
          ? configurator.getSelectedDoorVariant()?.label
          : undefined,
      });
      toast.success(`${qty} יחידות נוספו לעגלה!`);
    } finally {
      setAddingToCart(false);
    }
  };

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <StoreLayout>
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-pulse">
            <div className="bg-gray-200 rounded-2xl h-[480px]" />
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-3/4" />
              <div className="h-8 bg-gray-200 rounded w-1/3" />
              <div className="h-20 bg-gray-200 rounded" />
              <div className="h-12 bg-gray-200 rounded" />
              <div className="h-12 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </StoreLayout>
    );
  }

  if (!product) return null;

  const deliveryLabel = product.deliveryTime ? getDeliveryLabelHe(product.deliveryTime) : null;
  const estimatedArrival = product.deliveryTime ? getEstimatedArrivalHe(product.deliveryTime) : null;
  const warrantyLabel = WARRANTY_LABELS[product.warranty] ?? null;
  const showWarranty = product.warranty && product.warranty !== 'none' && warrantyLabel;

  return (
    <StoreLayout>
      <div className="max-w-6xl mx-auto px-4 py-8" dir="rtl">

        {/* ── Breadcrumb ── */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <button
            onClick={() => router.push('/products')}
            className="hover:text-gray-800 transition-colors"
          >
            מוצרים
          </button>
          <ChevronLeft className="w-4 h-4" />
          <span className="text-gray-800 font-medium">
            {product.nameHe || product.nameAr}
          </span>
        </nav>

        {/* ── Main split layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

          {/* ── LEFT: Sticky image panel ── */}
          <div className="lg:sticky lg:top-24">
            {/* Main preview image */}
            <div className="relative bg-gray-50 rounded-2xl overflow-hidden aspect-[3/4] mb-3 border border-gray-100">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt={product.nameHe || product.nameAr}
                  className="w-full h-full object-contain transition-all duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <svg viewBox="0 0 80 120" className="w-20 opacity-30" fill="currentColor">
                    <rect x="10" y="5" width="60" height="110" rx="2" />
                    <circle cx="62" cy="62" r="4" fill="white" />
                  </svg>
                </div>
              )}

              {/* Thumbnail navigation arrows */}
              {images.length > 1 && !overrideImage && (
                <>
                  <button
                    onClick={() => setActiveImg((i) => Math.max(0, i - 1))}
                    disabled={activeImg === 0}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow hover:bg-white disabled:opacity-30 transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveImg((i) => Math.min(images.length - 1, i + 1))}
                    disabled={activeImg === images.length - 1}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow hover:bg-white disabled:opacity-30 transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                      activeImg === i && !overrideImage
                        ? 'border-amber-500'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Illustration disclaimer */}
            {hasOptions && (
              <p className="text-xs text-gray-400 text-center mt-3 leading-relaxed">
                * התמונה להמחשה בלבד. המחיר הסופי ייקבע לאחר מדידה בשטח.
              </p>
            )}
          </div>

          {/* ── RIGHT: Product info + Configurator ── */}
          <div>
            {/* Product name */}
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {product.nameHe || product.nameAr}
            </h1>

            {/* Category */}
            {product.category?.name && (
              <p className="text-sm text-gray-500 mb-3">{product.category.name}</p>
            )}

            {/* Price display */}
            <div className="mb-5">
              {hasOptions ? (
                <div>
                  <p className="text-xs text-gray-500 mb-0.5 uppercase tracking-wide">מחיר משוער</p>
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-3xl font-bold text-amber-600">
                      ₪{estimatedTotal.toLocaleString()}
                    </span>
                    {extraCost > 0 && (
                      <span className="text-sm text-gray-400">
                        (בסיס ₪{basePrice.toLocaleString()} + תוספות ₪{extraCost.toLocaleString()})
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    המחיר הסופי ייקבע לאחר מדידה מקצועית בשטח
                  </p>
                </div>
              ) : (
                <span className="text-3xl font-bold text-amber-600">
                  ₪{basePrice.toLocaleString()}
                </span>
              )}
            </div>

            {/* Description */}
            {(product.descriptionHe || product.descriptionAr) && (
              <p className="text-sm text-gray-600 leading-relaxed mb-5">
                {product.descriptionHe || product.descriptionAr}
              </p>
            )}

            {/* ── Configurator or simple add-to-cart ── */}
            {hasOptions ? (
              <div className="mb-6">
                <ConfiguratorPanel
                  onAddToCart={handleAddToCart}
                  isLoading={addingToCart}
                />
              </div>
            ) : (
              <div className="mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-sm font-medium text-gray-700">כמות:</span>
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      className="px-3 py-2 hover:bg-gray-50 transition-colors text-lg font-bold text-gray-600"
                    >
                      −
                    </button>
                    <span className="px-4 py-2 font-medium text-gray-900 min-w-[3rem] text-center">
                      {qty}
                    </span>
                    <button
                      onClick={() => setQty(qty + 1)}
                      className="px-3 py-2 hover:bg-gray-50 transition-colors text-lg font-bold text-gray-600"
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 px-6 rounded-xl text-base transition-all disabled:opacity-60"
                >
                  הוסף לעגלה
                </button>
              </div>
            )}

            {/* ── Product meta ── */}
            <div className="space-y-2 border-t border-gray-100 pt-4">
              {deliveryLabel && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Truck className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>זמן אספקה: {deliveryLabel}</span>
                </div>
              )}
              {estimatedArrival && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>הגעה משוערת: {estimatedArrival}</span>
                </div>
              )}
              {showWarranty && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>אחריות: {warrantyLabel}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Sticky bottom action bar ── */}
        {hasOptions && (
          <div className="fixed bottom-0 right-0 left-0 z-50 bg-gray-900 text-white px-4 py-3 flex items-center justify-between gap-4 shadow-2xl">
            <div className="flex flex-col shrink-0">
              <span className="text-xs text-gray-400">מחיר משוער</span>
              <span className="text-xl font-bold text-amber-400">
                ₪{estimatedTotal.toLocaleString()}
              </span>
            </div>
            <div className="flex-1 hidden sm:block">
              <p className="text-xs text-gray-400 leading-tight">
                קנייה בטוחה! שלם רק מקדמה עכשיו — המחיר הסופי נקבע לאחר מדידה מקצועית.
              </p>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={!configurator.isConfigurationComplete() || addingToCart}
              className={`shrink-0 font-bold py-3 px-5 rounded-xl text-sm transition-all ${
                configurator.isConfigurationComplete() && !addingToCart
                  ? 'bg-amber-500 hover:bg-amber-400 text-white'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              {addingToCart ? 'מוסיף...' : 'הוסף לעגלה'}
            </button>
          </div>
        )}

        {/* Padding to prevent content hiding behind sticky bar */}
        {hasOptions && <div className="h-20" />}
      </div>
    </StoreLayout>
  );
}
