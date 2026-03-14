'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store';
import StoreLayout from '@/components/layout/StoreLayout';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.login(form);
      const { user, accessToken } = res.data;
      const access_token = accessToken;
      if (user.role === 'vendor') {
        toast.error('ספקים נכנסים דרך פורטל הספקים');
        return;
      }
      if (user.role === 'admin') {
        toast.error('מנהלים נכנסים דרך פאנל הניהול');
        router.push('/admin-login');
        return;
      }
      setAuth(user, access_token);
      toast.success(`ברוך הבא, ${user.fullName}!`);
      router.push('/products');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'שגיאה בכניסה');
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
              <h1 className="text-2xl font-bold text-gray-900">כניסה לחשבון</h1>
              <p className="text-gray-500 text-sm mt-1">ברוך הבא לQ Door</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">כתובת מייל</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="input-field"
                  placeholder="example@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">סיסמה</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  className="input-field"
                  placeholder="••••••••"
                />
              </div>
              <button type="submit" disabled={loading} className="w-full btn-primary py-3">
                {loading ? 'נכנס...' : 'כניסה'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-4">
              אין לך חשבון?{' '}
              <Link href="/auth/register" className="text-gray-900 hover:underline font-medium">
                הרשמה
              </Link>
            </p>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
