import Header from './Header';
import Link from 'next/link';

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f8f8f8' }}>
      <Header />
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer style={{ background: '#1c1c1c', color: '#aaa' }}>
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex flex-col items-start mb-4">
                <span className="text-white font-black text-3xl tracking-wider leading-none">Q</span>
                <span style={{ color: '#c9a84c', fontSize: '9px', letterSpacing: '4px' }} className="font-bold">DOOR</span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: '#888' }}>
                דלתות כניסה ופנים מעוצבות בהתאמה אישית מלאה. ייצור ישראלי, אחריות 10 שנה.
              </p>
            </div>

            {/* Products */}
            <div>
              <h4 className="text-white font-bold mb-4 text-sm">מוצרים</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/doors/entry" className="hover:text-white transition-colors">דלתות כניסה</Link></li>
                <li><Link href="/doors/interior" className="hover:text-white transition-colors">דלתות פנים</Link></li>
                <li><Link href="/products?sale=true" className="hover:text-white transition-colors">מבצעים</Link></li>
                <li><Link href="/products" className="hover:text-white transition-colors">כל הדגמים</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-white font-bold mb-4 text-sm">החברה</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white transition-colors">אודות Q Door</Link></li>
                <li><Link href="/showrooms" className="hover:text-white transition-colors">אולמות תצוגה</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">צור קשר</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-bold mb-4 text-sm">צור קשר</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="tel:1800800100" className="hover:text-white transition-colors flex items-center gap-2">
                    <span style={{ color: '#c9a84c' }}>📞</span>
                    1-800-800-100
                  </a>
                </li>
                <li>
                  <a href="mailto:info@qdoor.co.il" className="hover:text-white transition-colors flex items-center gap-2">
                    <span style={{ color: '#c9a84c' }}>✉️</span>
                    info@qdoor.co.il
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 flex items-center justify-between text-xs" style={{ borderTop: "1px solid #333", color: "#666" }}>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="hover:text-white transition-colors">מדיניות פרטיות</Link>
              <Link href="/terms" className="hover:text-white transition-colors">תנאי שימוש</Link>
            </div>
            <span>© {new Date().getFullYear()} Q Door — כל הזכויות שמורות</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
