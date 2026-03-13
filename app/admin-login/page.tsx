'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store';

export default function AdminLoginPage() {
  const router = useRouter();
  const { setAuth, isAuthenticated, user } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // אם כבר מחובר כאדמין - העבר ישירות לדשבורד
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      router.replace('/admin/dashboard');
    }
  }, [isAuthenticated, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login(form);
      const { user, accessToken } = res.data;

      if (user.role !== 'admin') {
        setError('גישה מורשית למנהלים בלבד');
        return;
      }

      setAuth(user, accessToken);
      router.push('/admin/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.message;
      if (msg === 'Invalid credentials' || err.response?.status === 401) {
        setError('אימייל או סיסמה שגויים');
      } else {
        setError('שגיאה בהתחברות, נסה שוב');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4" dir="rtl">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-900/20 via-gray-950 to-gray-950 pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4 shadow-lg shadow-primary-900/50">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">פאנל ניהול</h1>
          <p className="text-gray-400 text-sm mt-1">Q Door - כניסה למנהלים בלבד</p>
        </div>

        {/* Login Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2.5 bg-red-900/30 border border-red-800/50 rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">כתובת מייל</label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  autoComplete="email"
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 pr-10 text-sm placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                  placeholder="admin@meshtalem.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">סיסמה</label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  autoComplete="current-password"
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 pr-10 pl-10 text-sm placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-800 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  מתחבר...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  כניסה לפאנל הניהול
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 text-xs mt-6">
          © 2026 Q Door · גישה מורשית בלבד
        </p>
      </div>
    </div>
  );
}
