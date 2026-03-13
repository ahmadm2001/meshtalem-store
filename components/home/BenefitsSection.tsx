import { Palette, Shield, Gem, Wrench } from 'lucide-react';

const BENEFITS = [
  {
    icon: Palette,
    title: 'עיצוב מותאם אישית',
    description: 'בחר צבע, גודל, חומר ואביזרים — הדלת שלך, בדיוק כפי שדמיינת.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Shield,
    title: 'אבטחה גבוהה',
    description: 'דלתות כניסה עם מנגנוני נעילה מתקדמים ועמידות גבוהה לפריצה.',
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: Gem,
    title: 'חומרים פרימיום',
    description: 'עץ, פלדה ואלומיניום איכותיים — לאורך חיים ולמראה יוקרתי.',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: Wrench,
    title: 'התקנה מקצועית',
    description: 'צוות מתקינים מוסמך מגיע אליך — ממדידה ועד התקנה מושלמת.',
    color: 'bg-purple-50 text-purple-600',
  },
];

export default function BenefitsSection() {
  return (
    <section className="py-20 sm:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-primary-600 text-sm font-bold tracking-widest uppercase mb-3">למה Q Door?</p>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight mb-4">
            הסיבות לבחור בנו
          </h2>
          <p className="text-gray-500 text-lg max-w-lg mx-auto">
            אנחנו לא רק מוכרים דלתות — אנחנו מספקים חוויה שלמה מהבחירה ועד ההתקנה.
          </p>
        </div>

        {/* Benefits grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {BENEFITS.map((benefit, i) => {
            const Icon = benefit.icon;
            return (
              <div
                key={i}
                className="group bg-white border border-gray-100 rounded-2xl p-7 shadow-card hover:shadow-premium hover:-translate-y-1 transition-all duration-200 text-center"
              >
                <div className={`w-14 h-14 ${benefit.color} rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-gray-900 font-bold text-lg mb-2">{benefit.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{benefit.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
