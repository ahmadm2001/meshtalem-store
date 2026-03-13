import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden bg-primary-900">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-700 rounded-full opacity-30 translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-800 rounded-full opacity-40 -translate-x-1/3 translate-y-1/3" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-full mb-8">
          Q Door · התחל עכשיו
        </div>

        {/* Headline */}
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-6">
          עצב את הדלת שלך<br />
          <span className="text-yellow-400">תוך דקות</span>
        </h2>

        <p className="text-white/70 text-lg sm:text-xl leading-relaxed mb-10 max-w-2xl mx-auto">
          בחר דגם, התאם אישית, וקבל הצעת מחיר מיידית. הדלת שחלמת עליה — מחכה לך.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-primary-900 font-black px-8 py-4 rounded-xl text-base transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            התחל להגדיר
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Link
            href="/doors/entry"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-8 py-4 rounded-xl text-base transition-all"
          >
            דלתות כניסה
          </Link>
          <Link
            href="/doors/interior"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-8 py-4 rounded-xl text-base transition-all"
          >
            דלתות פנים
          </Link>
        </div>
      </div>
    </section>
  );
}
