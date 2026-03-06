'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store';
import StoreLayout from '@/components/layout/StoreLayout';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '', phone: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('הסיסמאות אינן תואמות');
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.registerCustomer({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        phone: form.phone,
      });
      const { user, access_token } = res.data;
      setAuth(user, access_token);
      toast.success('ברוך הבא למשתלם!');
      router.push('/products');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'שגיאה בהרשמה');
    } finally {
      setLoading(false);
    }
  };

  return (
    <StoreLayout>
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="card shadow-md">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">הרשמה למשתלם</h1>
              <p className="text-gray-500 text-sm mt-1">צור חשבון חדש בחינם</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">שם מלא *</label>
                <input
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  required className="input-field" placeholder="ישראל ישראלי"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">כתובת מייל *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required className="input-field" placeholder="example@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">טלפון</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="input-field" placeholder="050-0000000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">סיסמה *</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required className="input-field" placeholder="לפחות 6 תווים"
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">אימות סיסמה *</label>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  required className="input-field" placeholder="••••••••"
                />
              </div>
              <button type="submit" disabled={loading} className="w-full btn-primary py-3">
                {loading ? 'נרשם...' : 'הרשמה'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-4">
              יש לך כבר חשבון?{' '}
              <Link href="/auth/login" className="text-primary-600 hover:underline font-medium">כניסה</Link>
            </p>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
