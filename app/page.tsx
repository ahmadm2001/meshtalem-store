import Link from 'next/link';
import { Shield, Award, Wrench, Clock, ChevronLeft } from 'lucide-react';
import { productsApi, categoriesApi } from '@/lib/api';

async function getHomeData() {
  try {
    const [products, categories] = await Promise.all([
      productsApi.getPublic({ limit: 8 }),
      categoriesApi.getAll(),
    ]);
    return { products: products.data || [], categories: categories || [] };
  } catch {
    return { products: [], categories: [] };
  }
}

export default async function HomePage() {
  const { products, categories } = await getHomeData();
  const entryCategory = categories.find((c: any) => c.name?.includes('כניסה'));
  const interiorCategory = categories.find((c: any) => c.name?.includes('פנים'));

  return (
    <main style={{ fontFamily: 'Assistant, Arial Hebrew, Arial, sans-serif' }}>

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)', minHeight: '520px' }}>
        <div className="max-w-7xl mx-auto px-4 py-16 flex items-center justify-between gap-8">
          <div className="flex-1 text-right">
            <p style={{ color: '#c9a84c' }} className="text-sm font-bold tracking-widest uppercase mb-3">Q DOOR — PREMIUM DOORS</p>
            <h1 className="text-white font-black leading-tight mb-4" style={{ fontSize: '52px', lineHeight: '1.1' }}>
              הדלת שלך,<br />
              <span style={{ color: '#c9a84c' }}>הסגנון שלך</span>
            </h1>
            <p className="text-gray-300 text-lg mb-8 max-w-md">
              דלתות כניסה ופנים מעוצבות בהתאמה אישית מלאה. ייצור ישראלי, אחריות 10 שנה, התקנה מקצועית.
            </p>
            <div className="flex gap-3 justify-end">
              <Link
                href="/doors/entry"
                className="px-8 py-3 text-white font-bold text-base transition-all"
                style={{ background: '#c9a84c' }}
              >
                לקטלוג הדלתות
              </Link>
              <Link
                href="/contact"
                className="px-8 py-3 text-white font-bold text-base border border-gray-500 hover:border-white transition-all"
              >
                צור קשר
              </Link>
            </div>
          </div>
          <div className="hidden lg:flex flex-col gap-3 text-white text-sm">
            {[
              { icon: '🛡️', text: 'אחריות 10 שנה' },
              { icon: '🏭', text: 'ייצור ישראלי' },
              { icon: '🔧', text: 'התקנה מקצועית' },
              { icon: '📐', text: 'מידות מותאמות אישית' },
            ].map(item => (
              <div key={item.text} className="flex items-center gap-2 bg-white bg-opacity-10 px-4 py-2.5 rounded">
                <span>{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CATEGORY CARDS ===== */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Entry doors */}
            <Link href="/doors/entry" className="group relative overflow-hidden block" style={{ height: '320px', background: '#1a1a1a' }}>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white opacity-20 text-9xl font-black">Q</div>
              </div>
              <div className="absolute bottom-0 right-0 p-6 z-20 text-right">
                <h2 className="text-white font-black text-3xl mb-1">דלתות כניסה</h2>
                <p className="text-gray-300 text-sm mb-3">מגוון רחב של דלתות כניסה מעוצבות</p>
                <span style={{ color: '#c9a84c' }} className="text-sm font-bold flex items-center gap-1 justify-end group-hover:gap-2 transition-all">
                  לכל הדגמים <ChevronLeft className="w-4 h-4" />
                </span>
              </div>
            </Link>

            {/* Interior doors */}
            <Link href="/doors/interior" className="group relative overflow-hidden block" style={{ height: '320px', background: '#2a2a2a' }}>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white opacity-20 text-9xl font-black">Q</div>
              </div>
              <div className="absolute bottom-0 right-0 p-6 z-20 text-right">
                <h2 className="text-white font-black text-3xl mb-1">דלתות פנים</h2>
                <p className="text-gray-300 text-sm mb-3">דלתות פנים אלגנטיות לכל חדר</p>
                <span style={{ color: '#c9a84c' }} className="text-sm font-bold flex items-center gap-1 justify-end group-hover:gap-2 transition-all">
                  לכל הדגמים <ChevronLeft className="w-4 h-4" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FEATURED PRODUCTS ===== */}
      {products.length > 0 && (
        <section className="py-12" style={{ background: '#f8f8f8' }}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <Link href="/products" style={{ color: '#c9a84c' }} className="text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
                לכל הדגמים <ChevronLeft className="w-4 h-4" />
              </Link>
              <h2 className="text-2xl font-black text-gray-900">דגמים מובחרים</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.slice(0, 8).map((product: any) => {
                const image = product.images?.[0] || null;
                const hasDiscount = product.customerPrice && product.baseEstimatedPrice && product.customerPrice < product.baseEstimatedPrice;
                const discountPct = hasDiscount ? Math.round((1 - product.customerPrice / product.baseEstimatedPrice) * 100) : 0;
                const isNew = product.createdAt && (Date.now() - new Date(product.createdAt).getTime()) < 30 * 24 * 60 * 60 * 1000;

                return (
                  <Link key={product.id} href={`/products/${product.id}`} className="product-card group block bg-white" style={{ border: '1px solid #e5e5e5' }}>
                    {/* Name + badges row */}
                    <div className="flex items-start justify-between p-3 pb-0">
                      <div className="flex flex-col gap-1">
                        {isNew && <span className="badge-new-tag text-xs">חדש</span>}
                        {hasDiscount && <span className="badge-sale-tag text-xs">במבצע</span>}
                      </div>
                      <h3 className="text-sm font-bold text-gray-900 text-right leading-tight">{product.name}</h3>
                    </div>
                    {product.shortDescription && (
                      <p className="text-xs text-gray-500 px-3 pt-1 text-right">{product.shortDescription}</p>
                    )}

                    {/* Image */}
                    <div className="overflow-hidden mx-3 my-2" style={{ height: '220px', background: '#f5f5f5' }}>
                      {image ? (
                        <img
                          src={image}
                          alt={product.name}
                          className="product-card-img w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <svg width="60" height="80" viewBox="0 0 60 80" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="5" y="2" width="50" height="76" rx="2"/>
                            <rect x="10" y="8" width="40" height="50" rx="1"/>
                            <circle cx="48" cy="40" r="2.5" fill="currentColor"/>
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Price */}
                    <div className="px-3 pb-3">
                      {hasDiscount && (
                        <div className="price-discount-label mb-1 text-xs">
                          {discountPct}% הנחה בכפוף לתנאי המבצע
                        </div>
                      )}
                      <div className="flex items-center gap-2 justify-end">
                        {hasDiscount && (
                          <span className="price-original text-xs">₪ {product.baseEstimatedPrice?.toLocaleString()}</span>
                        )}
                        <span className="price-sale text-base">
                          ₪ {(product.customerPrice || product.baseEstimatedPrice || 0).toLocaleString()} החל מ-
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ===== BENEFITS BAR ===== */}
      <section className="py-10 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: Shield, title: 'אחריות 10 שנה', desc: 'על כל מוצרי Q Door' },
              { icon: Award, title: 'ייצור ישראלי', desc: 'מפעל מתקדם בישראל' },
              { icon: Wrench, title: 'התקנה מקצועית', desc: 'צוות מתקינים מוסמך' },
              { icon: Clock, title: 'זמן ייצור מהיר', desc: 'עד 6 שבועות מהזמנה' },
            ].map(item => (
              <div key={item.title} className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: '#fef9ec' }}>
                  <item.icon className="w-6 h-6" style={{ color: '#c9a84c' }} />
                </div>
                <h3 className="font-bold text-gray-900 text-sm">{item.title}</h3>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-14 text-center" style={{ background: '#1c1c1c' }}>
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-white font-black text-3xl mb-3">מוכן לבחור את הדלת שלך?</h2>
          <p className="text-gray-400 mb-8">בחר דגם, הגדר מידות וצבע, וקבל הצעת מחיר מיידית</p>
          <Link
            href="/doors/entry"
            className="inline-block px-10 py-4 font-bold text-white text-base transition-all"
            style={{ background: '#c9a84c' }}
          >
            התחל להגדיר את הדלת שלך
          </Link>
        </div>
      </section>

    </main>
  );
}
