'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ShoppingCart, ArrowRight, Minus, Plus, Package, Shield, Truck, Clock } from 'lucide-react';
import { productsApi } from '@/lib/api';
import { useCartStore } from '@/store';
import StoreLayout from '@/components/layout/StoreLayout';
import toast from 'react-hot-toast';
import {
  PRODUCT_COLORS,
  getColorByKey,
  getDeliveryLabelHe,
  getEstimatedArrivalHe,
} from '@/lib/colors';

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
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const { addItem } = useCartStore();

  useEffect(() => {
    productsApi.getById(id)
      .then((r) => setProduct(r.data))
      .catch(() => router.push('/products'))
      .finally(() => setLoading(false));
  }, [id]);

  // Reset color selection when product changes
  useEffect(() => {
    setSelectedColor(null);
  }, [id]);

  const productColors: string[] = product?.colors || [];
  const hasColors = productColors.length > 0;

  const handleAdd = () => {
    // If product has colors, user must select one
    if (hasColors && !selectedColor) {
      toast.error('יש לבחור צבע לפני הוספה לעגלה');
      return;
    }

    addItem({
      productId: product.id,
      name: product.nameHe,
      price: Number(product.customerPrice || product.price || 0),
      quantity: qty,
      image: product.images?.[0],
      selectedColor: selectedColor || null,
    });

    const colorInfo = selectedColor ? getColorByKey(selectedColor) : null;
    const colorMsg = colorInfo ? ` (${colorInfo.nameHe})` : '';
    toast.success(`${qty} יחידות נוספו לעגלה!${colorMsg}`);
  };

  if (loading) return (
    <StoreLayout>
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
          <div className="bg-gray-200 rounded-xl h-80" />
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4" />
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="h-20 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    </StoreLayout>
  );

  if (!product) return null;

  const displayPrice = Number(product.customerPrice || product.price || 0);
  const images: string[] = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
  const deliveryLabel = product.deliveryTime ? getDeliveryLabelHe(product.deliveryTime) : null;
  const estimatedArrival = product.deliveryTime ? getEstimatedArrivalHe(product.deliveryTime) : null;

  return (
    <StoreLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-6 transition-colors">
          <ArrowRight className="w-4 h-4" />
          חזרה לחנות
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Images */}
          <div>
            <div className="h-80 bg-gray-100 rounded-xl overflow-hidden mb-3">
              {images[activeImg] ? (
                <img
                  src={images[activeImg]}
                  alt={product.nameHe}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <Package className="w-16 h-16" />
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 flex-wrap">
                {images.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                      activeImg === i ? 'border-primary-500' : 'border-gray-200'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.nameHe}</h1>
            <p className="text-3xl font-bold text-primary-600 mb-4">&#x20aa;{displayPrice.toFixed(2)}</p>

            {product.descriptionHe && (
              <p className="text-gray-600 text-sm leading-relaxed mb-4">{product.descriptionHe}</p>
            )}

            {/* Stock */}
            <div className="flex items-center gap-2 text-sm mb-3">
              <Package className="w-4 h-4" />
              {product.stock > 0 ? (
                <span className="text-green-600 font-medium">במלאי</span>
              ) : (
                <span className="text-red-500 font-medium">אזל מהמלאי</span>
              )}
            </div>

            {/* Warranty */}
            {product.warranty && product.warranty !== 'none' && WARRANTY_LABELS[product.warranty] && (
              <div className="flex items-center gap-2 text-sm mb-4 text-blue-600">
                <Shield className="w-4 h-4" />
                <span>אחריות: {WARRANTY_LABELS[product.warranty]}</span>
              </div>
            )}

            {/* Delivery Time */}
            {deliveryLabel && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-4 space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <Truck className="w-4 h-4 text-blue-500 shrink-0" />
                  <span className="text-gray-700">זמן אספקה:</span>
                  <span className="font-semibold text-blue-700">{deliveryLabel}</span>
                </div>
                {estimatedArrival && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-blue-400 shrink-0" />
                    <span className="text-gray-500">הגעה משוערת:</span>
                    <span className="font-medium text-gray-700">{estimatedArrival}</span>
                  </div>
                )}
              </div>
            )}

            {/* Color Selection */}
            {hasColors && (
              <div className="mb-5">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  בחירת צבע
                  {!selectedColor && (
                    <span className="text-red-500 mr-1">*</span>
                  )}
                </p>
                <div className="flex flex-wrap gap-3">
                  {productColors.map((key: string) => {
                    const colorInfo = getColorByKey(key);
                    if (!colorInfo) return null;
                    const isSelected = selectedColor === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setSelectedColor(key)}
                        title={colorInfo.nameHe}
                        className="flex flex-col items-center gap-1"
                      >
                        <span
                          className="block transition-all duration-150"
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 4,
                            backgroundColor: colorInfo.hex,
                            border: isSelected
                              ? '3px solid #2563EB'
                              : colorInfo.hex === '#FFFFFF' || colorInfo.hex === '#E5D3B3'
                              ? '2px solid #d1d5db'
                              : '2px solid transparent',
                            boxShadow: isSelected ? '0 0 0 2px #bfdbfe' : undefined,
                          }}
                        />
                        <span className={`text-xs ${isSelected ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
                          {colorInfo.nameHe}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {!selectedColor && (
                  <p className="text-xs text-red-500 mt-2">יש לבחור צבע לפני הוספה לעגלה</p>
                )}
                {selectedColor && (
                  <p className="text-xs text-green-600 font-medium mt-2">
                    נבחר: {getColorByKey(selectedColor)?.nameHe}
                  </p>
                )}
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-medium text-gray-700">כמות:</span>
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="px-3 py-2 hover:bg-gray-50 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 font-medium text-gray-900 min-w-[3rem] text-center">{qty}</span>
                <button
                  onClick={() => setQty(Math.min(product.stock, qty + 1))}
                  className="px-3 py-2 hover:bg-gray-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <button
              onClick={handleAdd}
              disabled={product.stock === 0}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2 text-base"
            >
              <ShoppingCart className="w-5 h-5" />
              {product.stock === 0 ? 'אזל מהמלאי' : 'הוסף לעגלה'}
            </button>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
