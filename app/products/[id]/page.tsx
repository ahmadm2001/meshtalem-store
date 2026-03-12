'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ShoppingCart, ArrowRight, Minus, Plus, Package, Shield, Truck, Clock } from 'lucide-react';
import { productsApi } from '@/lib/api';
import { useCartStore, SelectedOption } from '@/store';
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

interface OptionValue { label: string; priceModifier: number; }
interface OptionGroup { name: string; values: OptionValue[]; }

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  // selectedOptions: map from group name -> selected value label
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const { addItem } = useCartStore();

  useEffect(() => {
    productsApi.getById(id)
      .then((r) => setProduct(r.data))
      .catch(() => router.push('/products'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    setSelectedOptions({});
  }, [id]);

  const productOptions: OptionGroup[] = product?.productOptions || [];
  const hasOptions = productOptions.length > 0;

  // Calculate extra cost from selected options
  const optionsExtraCost = productOptions.reduce((total, group) => {
    const selectedValueLabel = selectedOptions[group.name];
    if (!selectedValueLabel) return total;
    const val = group.values.find(v => v.label === selectedValueLabel);
    return total + (val?.priceModifier || 0);
  }, 0);

  const basePrice = Number(product?.customerPrice || product?.price || 0);
  const totalPrice = basePrice + optionsExtraCost;

  const handleSelectOption = (groupName: string, valueLabel: string) => {
    setSelectedOptions(prev => ({ ...prev, [groupName]: valueLabel }));
  };

  const handleAdd = () => {
    // Validate all option groups have a selection
    if (hasOptions) {
      for (const group of productOptions) {
        if (!selectedOptions[group.name]) {
          toast.error(`יש לבחור ${group.name} לפני הוספה לעגלה`);
          return;
        }
      }
    }

    // Build selectedOptions array for snapshot
    const optionsSnapshot: SelectedOption[] = productOptions.map(group => {
      const selectedValueLabel = selectedOptions[group.name] || '';
      const val = group.values.find(v => v.label === selectedValueLabel);
      return {
        groupName: group.name,
        selectedValue: selectedValueLabel,
        priceModifier: val?.priceModifier || 0,
      };
    });

    addItem({
      productId: product.id,
      name: product.nameHe || product.nameAr,
      price: totalPrice,
      basePrice,
      quantity: qty,
      image: product.images?.[0],
      selectedOptions: optionsSnapshot.length > 0 ? optionsSnapshot : undefined,
      optionsExtraCost: optionsExtraCost > 0 ? optionsExtraCost : undefined,
    });

    toast.success(`${qty} יחידות נוספו לעגלה!`);
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

  const images: string[] = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
  const deliveryLabel = product.deliveryTime ? getDeliveryLabelHe(product.deliveryTime) : null;
  const estimatedArrival = product.deliveryTime ? getEstimatedArrivalHe(product.deliveryTime) : null;

  return (
    <StoreLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8" dir="rtl">
        {/* Breadcrumb */}
        <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-6 transition-colors">
          <ArrowRight className="w-4 h-4 rotate-180" />
          חזרה לחנות
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Images */}
          <div>
            <div className="h-80 bg-gray-100 rounded-xl overflow-hidden mb-3">
              {images[activeImg] ? (
                <img
                  src={images[activeImg]}
                  alt={product.nameHe || product.nameAr}
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.nameHe || product.nameAr}</h1>

            {/* Price display */}
            <div className="mb-4">
              {optionsExtraCost > 0 ? (
                <div>
                  <p className="text-sm text-gray-500 line-through">מחיר בסיס: ₪{basePrice.toFixed(2)}</p>
                  <p className="text-3xl font-bold text-primary-600">₪{totalPrice.toFixed(2)}</p>
                  <p className="text-xs text-green-700 bg-green-50 inline-block px-2 py-0.5 rounded mt-1">
                    כולל תוספת אפשרויות: +₪{optionsExtraCost.toFixed(2)}
                  </p>
                </div>
              ) : (
                <p className="text-3xl font-bold text-primary-600">₪{basePrice.toFixed(2)}</p>
              )}
            </div>

            {(product.descriptionHe || product.descriptionAr) && (
              <p className="text-gray-600 text-sm leading-relaxed mb-4">{product.descriptionHe || product.descriptionAr}</p>
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

            {/* Warranty - only show if warranty is set and not 'none' */}
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

            {/* Product Options */}
            {hasOptions && (
              <div className="mb-5 space-y-4">
                {productOptions.map((group) => (
                  <div key={group.name}>
                    <p className="text-sm font-semibold text-gray-800 mb-2">
                      {`בחר ${group.name}`}
                      {!selectedOptions[group.name] && (
                        <span className="text-red-500 mr-1">*</span>
                      )}
                    </p>
                    <div className="space-y-1.5">
                      {group.values.map((val) => {
                        const isSelected = selectedOptions[group.name] === val.label;
                        return (
                          <label
                            key={val.label}
                            className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                              isSelected
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`option-${group.name}`}
                              value={val.label}
                              checked={isSelected}
                              onChange={() => handleSelectOption(group.name, val.label)}
                              className="accent-primary-600"
                            />
                            <span className={`text-sm font-medium flex-1 ${isSelected ? 'text-primary-700' : 'text-gray-700'}`}>
                              {val.label}
                            </span>
                            {val.priceModifier > 0 && (
                              <span className={`text-sm font-semibold ${isSelected ? 'text-primary-600' : 'text-gray-500'}`}>
                                +₪{val.priceModifier}
                              </span>
                            )}
                          </label>
                        );
                      })}
                    </div>
                    {!selectedOptions[group.name] && (
                      <p className="text-xs text-red-500 mt-1">יש לבחור {group.name}</p>
                    )}
                  </div>
                ))}
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

            {/* Total price summary */}
            {hasOptions && optionsExtraCost > 0 && (
              <div className="bg-gray-50 rounded-xl p-3 mb-4 text-sm">
                <div className="flex justify-between text-gray-600 mb-1">
                  <span>מחיר בסיס:</span>
                  <span>₪{basePrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 mb-1">
                  <span>תוספת אפשרויות:</span>
                  <span>+₪{optionsExtraCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 border-t pt-1 mt-1">
                  <span>סה"כ:</span>
                  <span className="text-primary-600">₪{(totalPrice * qty).toFixed(2)}</span>
                </div>
              </div>
            )}

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
