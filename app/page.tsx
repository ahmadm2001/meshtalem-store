import HeroSection from '@/components/home/HeroSection';
import CategorySection from '@/components/home/CategorySection';
import InspirationGallery from '@/components/home/InspirationGallery';
import BenefitsSection from '@/components/home/BenefitsSection';
import FeaturedDoors from '@/components/home/FeaturedDoors';
import CTASection from '@/components/home/CTASection';
import Header from '@/components/layout/Header';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <CategorySection />
        <InspirationGallery />
        <BenefitsSection />
        <FeaturedDoors />
        <CTASection />
      </main>

      {/* Footer */}
      <footer className="bg-primary-950 text-primary-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-black text-sm">Q</span>
                </div>
                <span className="text-white font-black text-lg tracking-tight">Q Door</span>
              </div>
              <p className="text-sm text-primary-400 leading-relaxed">
                דלתות פרימיום בהתאמה אישית. עיצוב, איכות ואמינות — בכל דלת.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">ניווט מהיר</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/doors/entry" className="hover:text-white transition-colors">דלתות כניסה</Link></li>
                <li><Link href="/doors/interior" className="hover:text-white transition-colors">דלתות פנים</Link></li>
                <li><Link href="/products" className="hover:text-white transition-colors">כל הדגמים</Link></li>
                <li><Link href="/cart" className="hover:text-white transition-colors">עגלת קניות</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">צור קשר</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-primary-400">טל׳:</span>
                  <a href="tel:+972501234567" className="hover:text-white transition-colors">050-123-4567</a>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary-400">מייל:</span>
                  <a href="mailto:info@qdoor.co.il" className="hover:text-white transition-colors">info@qdoor.co.il</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-primary-800 pt-6 text-center text-xs text-primary-500">
            © {new Date().getFullYear()} Q Door — כל הזכויות שמורות
          </div>
        </div>
      </footer>
    </div>
  );
}
