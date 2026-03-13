'use client';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

export default function HeroSection() {
  const scrollToCategories = () => {
    document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative h-screen min-h-[600px] max-h-[900px] flex items-center overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/doors/hero-entry.jpg')" }}
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-l from-black/70 via-black/50 to-black/30" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 w-full">
        <div className="max-w-xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full mb-6">
            Q Door · Premium Doors
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight mb-5">
            דלתות כניסה<br />
            <span className="text-yellow-400">פרימיום</span><br />
            לבית שלך
          </h1>

          {/* Subtitle */}
          <p className="text-white/80 text-lg sm:text-xl leading-relaxed mb-8 max-w-md">
            בחר דגם והגדר את הדלת שלך בדיוק כפי שאתה רוצה — עיצוב, צבע, גודל ואביזרים.
          </p>

          {/* CTA */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={scrollToCategories}
              className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-8 py-4 rounded-xl text-base transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              לקטלוג הדלתות
            </button>
            <Link
              href="/products"
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/30 text-white font-semibold px-8 py-4 rounded-xl text-base transition-all"
            >
              כל הדגמים
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={scrollToCategories}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 hover:text-white transition-colors animate-bounce"
        aria-label="Scroll down"
      >
        <ChevronDown className="w-7 h-7" />
      </button>
    </section>
  );
}
