import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';

const CATEGORIES = [
  {
    id: 'entry',
    title: 'דלתות כניסה',
    subtitle: 'אבטחה, עיצוב וטכנולוגיה חכמה',
    description: 'דלתות כניסה פרימיום המשלבות אבטחה מקסימלית עם עיצוב אדריכלי מרשים. עמידות, בטוחות ומותאמות אישית.',
    href: '/doors/entry',
    cta: 'לדלתות כניסה',
    image: '/images/doors/cat-entry.jpg',
    badge: 'אבטחה מקסימלית',
  },
  {
    id: 'interior',
    title: 'דלתות פנים',
    subtitle: 'דלתות פנים אלגנטיות לבית המודרני',
    description: 'דלתות פנים בעיצוב עכשווי ומינימליסטי. מגוון גדלים, גוונים וחומרים — לכל חדר בבית.',
    href: '/doors/interior',
    cta: 'לדלתות פנים',
    image: '/images/doors/cat-interior.jpg',
    badge: 'עיצוב מינימליסטי',
  },
];

export default function CategorySection() {
  return (
    <section id="categories" className="py-20 sm:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-14">
          <p className="text-primary-600 text-sm font-bold tracking-widest uppercase mb-3">הקולקציה שלנו</p>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight mb-4">
            בחר את סוג הדלת שלך
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            שני קטגוריות ראשיות — כל אחת עם מגוון דגמים, צבעים ואפשרויות התאמה אישית.
          </p>
        </div>

        {/* Category cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={cat.href}
              className="group relative overflow-hidden rounded-3xl bg-gray-900 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Background image */}
              <div className="relative h-80 sm:h-96 overflow-hidden">
                <Image
                  src={cat.image}
                  alt={cat.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              </div>

              {/* Badge */}
              <div className="absolute top-5 right-5 bg-white/90 backdrop-blur-sm text-primary-700 text-xs font-bold px-3 py-1.5 rounded-full">
                {cat.badge}
              </div>

              {/* Content overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-7">
                <p className="text-primary-300 text-xs font-bold tracking-widest uppercase mb-1">{cat.subtitle}</p>
                <h3 className="text-white text-2xl sm:text-3xl font-black mb-2 tracking-tight">{cat.title}</h3>
                <p className="text-white/70 text-sm leading-relaxed mb-5 max-w-sm">{cat.description}</p>
                <div className="inline-flex items-center gap-2 bg-primary-600 group-hover:bg-primary-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all">
                  {cat.cta}
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
