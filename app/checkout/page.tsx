'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MapPin, Phone, User, CheckCircle, Mail, ShieldCheck } from 'lucide-react';
import { useCartStore, CartItem } from '@/store';
import StoreLayout from '@/components/layout/StoreLayout';
import toast from 'react-hot-toast';
import axios from 'axios';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

/**
 * Build the selectedOptions payload for a cart item.
 * Prefers the new `selectedOptionSnapshots` format; falls back to the
 * legacy `selectedOptions` format for backward compatibility.
 */
function buildOptionsPayload(item: CartItem) {
  if (item.selectedOptionSnapshots && item.selectedOptionSnapshots.length > 0) {
    return item.selectedOptionSnapshots.map((snap) => ({
      groupName: snap.groupName,
      selectedValue: snap.selectedValueLabels.join(', '),
      priceModifier: snap.priceModifier,
    }));
  }
  if (item.selectedOptions && item.selectedOptions.length > 0) {
    return item.selectedOptions;
  }
  return undefined;
}

/** Render option tags in the order summary sidebar. */
function OptionSummaryTags({ item }: { item: CartItem }) {
  const snaps = item.selectedOptionSnapshots;
  const legacy = item.selectedOptions;

  if (snaps && snaps.length > 0) {
    return (
      <div className="mt-0.5 flex flex-wrap gap-1">
        {snaps.map((s, i) => (
          <span key={i} className="text-xs text-amber-700">
            {s.groupName}: {s.selectedValueLabels.join(', ')}
            {s.priceModifier > 0 ? ` (+₪${s.priceModifier.toLocaleString()})` : ''}
          </span>
        ))}
      </div>
    );
  }

  if (legacy && legacy.length > 0) {
    return (
      <div className="mt-0.5 flex flex-wrap gap-1">
        {legacy.map((opt, i) => (
          <span key={i} className="text-xs text-gray-400">
            {opt.groupName}: {opt.selectedValue}
            {opt.priceModifier > 0 ? ` (+₪${opt.priceModifier})` : ''}
          </span>
        ))}
      </div>
    );
  }

  return null;
}

export default function CheckoutPage() {
  const { items, total, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [form, setForm] = useState({
    guestName: '',
    guestPhone: '',
    guestEmail: '',
    city: '',
    street: '',
    apartment: '',
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error('העגלה ריקה');
      return;
    }
    if (!form.guestName || !form.guestPhone || !form.city || !form.street) {
      toast.error('יש למלא את כל השדות החובה');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/orders/guest`, {
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          selectedColor: i.selectedColor || undefined,
          selectedOptions: buildOptionsPayload(i),
        })),
        guestName: form.guestName,
        guestPhone: form.guestPhone,
        guestEmail: form.guestEmail || undefined,
        shippingFullName: form.guestName,
        shippingPhone: form.guestPhone,
        shippingCity: form.city,
        shippingStreet: form.street,
        shippingApartment: form.apartment || '',
        shippingNotes: form.notes || undefined,
      });
      setOrderId(res.data?.id || '');
      clearCart();
      setDone(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'שגיאה בביצוע ההזמנה');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <StoreLayout>
        <div className="max-w-lg mx-auto px-4 py-16 text-center" dir="rtl">
          <CheckCircle className="w-20 h-20 mx-auto mb-4 text-green-500" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">ההזמנה התקבלה!</h2>
          <p className="text-gray-500 mb-2">
            תודה על הרכישה. נציג שלנו יצור איתך קשר בקרוב לתיאום מדידה.
          </p>
          {orderId && (
            <p className="text-sm text-gray-400 mb-6">
              מספר הזמנה:{' '}
              <span className="font-mono font-medium text-gray-600">
                {orderId.slice(0, 8).toUpperCase()}
              </span>
            </p>
          )}
          <Link href="/products" className="btn-primary">המשך בקניות</Link>
        </div>
      </StoreLayout>
    );
  }

  return (
    <StoreLayout>
      <div className="max-w-4xl mx-auto px-4 py-8" dir="rtl">
        <h1 className="text-2xl font-bold text-gray-900 mb-8 text-center">פרטי הזמנה</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">

            {/* Personal Details */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-semibold text-gray-900">פרטים אישיים</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">שם מלא *</label>
                  <input
                    name="guestName"
                    value={form.guestName}
                    onChange={handleChange}
                    required
                    placeholder="ישראל ישראלי"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    dir="rtl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">טלפון *</label>
                  <input
                    name="guestPhone"
                    value={form.guestPhone}
                    onChange={handleChange}
                    required
                    placeholder="050-1234567"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" /> אימייל (אופציונלי)
                    </span>
                  </label>
                  <input
                    name="guestEmail"
                    type="email"
                    value={form.guestEmail}
                    onChange={handleChange}
                    placeholder="example@email.com"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-semibold text-gray-900">כתובת להתקנה</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">עיר *</label>
                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    required
                    placeholder="תל אביב"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    dir="rtl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">רחוב ומספר *</label>
                  <input
                    name="street"
                    value={form.street}
                    onChange={handleChange}
                    required
                    placeholder="רחוב הרצל 10"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    dir="rtl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">דירה / כניסה</label>
                  <input
                    name="apartment"
                    value={form.apartment}
                    onChange={handleChange}
                    placeholder="דירה 5, קומה 2"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    dir="rtl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">הערות</label>
                  <input
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    placeholder="קוד כניסה, שעות מועדפות..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    dir="rtl"
                  />
                </div>
              </div>
            </div>

            {/* Trust / Payment notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-amber-800 mb-1">קנייה בטוחה</h3>
                  <p className="text-sm text-amber-700 leading-relaxed">
                    לאחר אישור ההזמנה, נציג שלנו יצור איתך קשר לתיאום ביקור מדידה.
                    המחיר הסופי ייקבע לאחר המדידה. תשלום מקדמה בלבד בשלב זה.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 rounded-xl text-base transition-all disabled:opacity-60"
            >
              {loading ? 'שולח הזמנה...' : 'אשר הזמנה ✓'}
            </button>
          </form>

          {/* Order Summary */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 h-fit sticky top-24">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">סיכום הזמנה</h2>
            <div className="space-y-3 mb-4">
              {items.map((item, idx) => (
                <div key={`${item.productId}-${idx}`} className="text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-700 truncate max-w-[160px]">
                      {item.name} <span className="text-gray-400">×{item.quantity}</span>
                    </span>
                    <span className="font-medium text-gray-900 shrink-0">
                      ₪{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                  <OptionSummaryTags item={item} />
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>סכום משוער</span>
                <span>₪{total().toLocaleString()}</span>
              </div>
              <p className="text-xs text-gray-400">
                * המחיר הסופי ייקבע לאחר מדידה מקצועית
              </p>
              <div className="flex justify-between font-bold text-base text-gray-900 pt-2 border-t border-gray-100">
                <span>סה"כ משוער</span>
                <span className="text-amber-600">₪{total().toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
