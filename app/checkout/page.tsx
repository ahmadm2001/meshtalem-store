'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Phone, User, CheckCircle } from 'lucide-react';
import { ordersApi } from '@/lib/api';
import { useCartStore, useAuthStore } from '@/store';
import StoreLayout from '@/components/layout/StoreLayout';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
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
    if (!isAuthenticated) {
      toast.error('יש להתחבר לפני ביצוע הזמנה');
      router.push('/auth/login');
      return;
    }
    if (user && (user.role === 'admin' || user.role === 'vendor')) {
      toast.error('חשבון זה אינו יכול לבצע הזמנות. השתמש בחשבון לקוח.');
      return;
    }
    if (items.length === 0) {
      toast.error('העגלה ריקה');
      return;
    }
    setLoading(true);
    try {
      await ordersApi.create({
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        shippingFullName: form.fullName,
        shippingPhone: form.phone,
        shippingCity: form.city,
        shippingStreet: form.street,
        shippingApartment: form.apartment,
        shippingNotes: form.notes,
      });
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
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <CheckCircle className="w-20 h-20 mx-auto mb-4 text-green-500" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">ההזמנה התקבלה!</h2>
          <p className="text-gray-500 mb-6">תודה על הרכישה. נעדכן אותך בסטטוס ההזמנה בהקדם.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/orders" className="btn-primary">הזמנות שלי</Link>
            <Link href="/products" className="btn-secondary">המשך בקניות</Link>
          </div>
        </div>
      </StoreLayout>
    );
  }

  if (items.length === 0) {
    router.push('/cart');
    return null;
  }

  return (
    <StoreLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">פרטי משלוח ותשלום</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-4">
            <div className="card">
              <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-primary-600" />
                פרטים אישיים
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">שם מלא *</label>
                  <input name="fullName" value={form.fullName} onChange={handleChange} required className="input-field" placeholder="ישראל ישראלי" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">טלפון *</label>
                  <input name="phone" value={form.phone} onChange={handleChange} required className="input-field" placeholder="050-0000000" />
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary-600" />
                כתובת למשלוח
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">עיר *</label>
                  <input name="city" value={form.city} onChange={handleChange} required className="input-field" placeholder="תל אביב" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">רחוב ומספר *</label>
                  <input name="street" value={form.street} onChange={handleChange} required className="input-field" placeholder="הרצל 10" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">דירה/כניסה</label>
                  <input name="apartment" value={form.apartment} onChange={handleChange} className="input-field" placeholder="דירה 5" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">הערות למשלוח</label>
                  <input name="notes" value={form.notes} onChange={handleChange} className="input-field" placeholder="קוד כניסה, קומה..." />
                </div>
              </div>
            </div>

            <div className="card bg-blue-50 border-blue-100">
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-blue-800 text-sm">תשלום בעת המסירה</p>
                  <p className="text-blue-600 text-xs mt-0.5">התשלום יתבצע במזומן או בכרטיס אשראי בעת קבלת החבילה</p>
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full btn-primary py-3 text-base">
              {loading ? 'מבצע הזמנה...' : 'אשר הזמנה'}
            </button>
          </form>

          {/* Summary */}
          <div className="card h-fit sticky top-24">
            <h2 className="font-bold text-gray-900 mb-4">סיכום</h2>
            <div className="space-y-2 mb-4">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm text-gray-600">
                  <span className="truncate ml-2">{item.name} ×{item.quantity}</span>
                  <span className="shrink-0">₪{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-3">
              <div className="flex justify-between font-bold text-gray-900">
                <span>סה"כ לתשלום</span>
                <span className="text-primary-600 text-lg">₪{total().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
