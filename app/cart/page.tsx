'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart, Trash2, Plus, Minus, ArrowLeft, X,
  LogIn, UserPlus, Eye, EyeOff
} from 'lucide-react';
import { useCartStore, useAuthStore } from '@/store';
import { authApi } from '@/lib/api';
import StoreLayout from '@/components/layout/StoreLayout';
import toast from 'react-hot-toast';

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQty, total, clearCart } = useCartStore();
  const { isAuthenticated, setAuth } = useAuthStore();

  const [mounted, setMounted] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [authLoading, setAuthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ fullName: '', email: '', password: '', phone: '' });

  useEffect(() => { setMounted(true); }, []);

  const handleCheckout = () => {
    if (isAuthenticated) {
      router.push('/checkout');
    } else {
      setShowAuthModal(true);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      const res = await authApi.login(loginForm);
      const { user, accessToken } = res.data;
      if (user.role === 'vendor') { toast.error('ספקים נכנסים דרך פורטל הספקים'); return; }
      if (user.role === 'admin') { toast.error('מנהלים נכנסים דרך פאנל הניהול'); return; }
      setAuth(user, accessToken);
      setShowAuthModal(false);
      toast.success('ברוך הבא! ממשיך לתשלום...');
      router.push('/checkout');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'שגיאה בכניסה');
    } finally { setAuthLoading(false); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (registerForm.password.length < 6) { toast.error('הסיסמה חייבת להכיל לפחות 6 תווים'); return; }
    setAuthLoading(true);
    try {
      const res = await authApi.registerCustomer(registerForm);
      const { user, accessToken } = res.data;
      setAuth(user, accessToken);
      setShowAuthModal(false);
      toast.success('החשבון נוצר! ממשיך לתשלום...');
      router.push('/checkout');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'שגיאה בהרשמה');
    } finally { setAuthLoading(false); }
  };

  // Don't render cart contents until client-side hydration is complete
  if (!mounted) {
    return (
      <StoreLayout>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </StoreLayout>
    );
  }

  if (items.length === 0) {
    return (
      <StoreLayout>
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">עגלת קניות</h1>
          <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-700 transition-colors">נקה עגלה</button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => (
              <div key={item.productId} className="card flex items-center gap-4">
                <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingCart className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 text-sm truncate">{item.name}</h3>
                  <p className="text-primary-600 font-bold mt-1">&#8362;{item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button onClick={() => updateQty(item.productId, item.quantity - 1)} className="px-2 py-1.5 hover:bg-gray-50 transition-colors"><Minus className="w-3 h-3" /></button>
                    <span className="px-3 py-1.5 text-sm font-medium">{item.quantity}</span>
                    <button onClick={() => updateQty(item.productId, item.quantity + 1)} className="px-2 py-1.5 hover:bg-gray-50 transition-colors"><Plus className="w-3 h-3" /></button>
                  </div>
                  <button onClick={() => removeItem(item.productId)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
                <div className="text-sm font-bold text-gray-900 w-20 text-left">&#8362;{(item.price * item.quantity).toFixed(2)}</div>
              </div>
            ))}
          </div>
          <div className="lg:col-span-1">
            <div className="card sticky top-24">
              <h2 className="font-bold text-gray-900 mb-4">סיכום הזמנה</h2>
              <div className="space-y-2 mb-4">
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm text-gray-600">
                    <span>{item.name} x{item.quantity}</span>
                    <span>&#8362;{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-3 mb-4">
                <div className="flex justify-between font-bold text-gray-900">
                  <span>סה&quot;כ</span>
                  <span className="text-primary-600 text-lg">&#8362;{total().toFixed(2)}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">משלוח עד הבית כלול</p>
              </div>
              <button onClick={handleCheckout} className="btn-primary w-full text-center block py-3">
                המשך לתשלום
              </button>
              <Link href="/products" className="btn-secondary w-full text-center block py-2 mt-2 text-sm">
                המשך בקניות
              </Link>
            </div>
          </div>
        </div>
      </div>

      {showAuthModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setShowAuthModal(false); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {authTab === 'login' ? 'כניסה לחשבון' : 'יצירת חשבון חדש'}
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">כדי להמשיך לתשלום</p>
              </div>
              <button onClick={() => setShowAuthModal(false)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex border-b border-gray-100">
              <button onClick={() => setAuthTab('login')} className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${authTab === 'login' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}>
                <LogIn className="w-4 h-4" />כניסה
              </button>
              <button onClick={() => setAuthTab('register')} className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${authTab === 'register' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}>
                <UserPlus className="w-4 h-4" />הרשמה
              </button>
            </div>
            <div className="p-5">
              {authTab === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">כתובת מייל</label>
                    <input type="email" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} required className="input-field" placeholder="example@email.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">סיסמה</label>
                    <div className="relative">
                      <input type={showPassword ? 'text' : 'password'} value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} required className="input-field pl-10" placeholder="••••••••" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" disabled={authLoading} className="w-full btn-primary py-3 flex items-center justify-center gap-2">
                    {authLoading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><LogIn className="w-4 h-4" />כניסה והמשך לתשלום</>}
                  </button>
                  <p className="text-center text-sm text-gray-500">אין לך חשבון?{' '}<button type="button" onClick={() => setAuthTab('register')} className="text-primary-600 hover:underline font-medium">הרשמה חינם</button></p>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">שם מלא</label>
                    <input type="text" value={registerForm.fullName} onChange={(e) => setRegisterForm({ ...registerForm, fullName: e.target.value })} required className="input-field" placeholder="ישראל ישראלי" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">כתובת מייל</label>
                    <input type="email" value={registerForm.email} onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })} required className="input-field" placeholder="example@email.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">טלפון</label>
                    <input type="tel" value={registerForm.phone} onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })} required className="input-field" placeholder="050-0000000" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">סיסמה</label>
                    <div className="relative">
                      <input type={showPassword ? 'text' : 'password'} value={registerForm.password} onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })} required minLength={6} className="input-field pl-10" placeholder="לפחות 6 תווים" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" disabled={authLoading} className="w-full btn-primary py-3 flex items-center justify-center gap-2">
                    {authLoading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><UserPlus className="w-4 h-4" />הרשמה והמשך לתשלום</>}
                  </button>
                  <p className="text-center text-sm text-gray-500">יש לך חשבון?{' '}<button type="button" onClick={() => setAuthTab('login')} className="text-primary-600 hover:underline font-medium">כניסה</button></p>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </StoreLayout>
  );
}
