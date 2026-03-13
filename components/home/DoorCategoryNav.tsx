'use client';

interface Category {
  id: string;
  nameHe: string;
}

interface Props {
  categories: Category[];
  active: string;
  onChange: (id: string) => void;
  allLabel?: string;
}

// SVG door icons — each subcategory gets a distinct door style
const DoorIcons: Record<string, React.FC<{ active?: boolean }>> = {
  all: ({ active }) => (
    <svg viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-14">
      <rect x="5" y="2" width="50" height="76" rx="2" stroke={active ? '#1e3a5f' : '#888'} strokeWidth="2.5" fill="none"/>
      <rect x="10" y="8" width="18" height="28" rx="1" stroke={active ? '#1e3a5f' : '#bbb'} strokeWidth="1.5" fill="none"/>
      <rect x="32" y="8" width="18" height="28" rx="1" stroke={active ? '#1e3a5f' : '#bbb'} strokeWidth="1.5" fill="none"/>
      <rect x="10" y="42" width="18" height="28" rx="1" stroke={active ? '#1e3a5f' : '#bbb'} strokeWidth="1.5" fill="none"/>
      <rect x="32" y="42" width="18" height="28" rx="1" stroke={active ? '#1e3a5f' : '#bbb'} strokeWidth="1.5" fill="none"/>
      <circle cx="43" cy="42" r="2.5" fill={active ? '#1e3a5f' : '#aaa'}/>
    </svg>
  ),
  smooth: ({ active }) => (
    <svg viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-14">
      <rect x="5" y="2" width="50" height="76" rx="2" stroke={active ? '#1e3a5f' : '#888'} strokeWidth="2.5" fill="none"/>
      <circle cx="43" cy="42" r="2.5" fill={active ? '#1e3a5f' : '#aaa'}/>
    </svg>
  ),
  wood: ({ active }) => (
    <svg viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-14">
      <rect x="5" y="2" width="50" height="76" rx="2" stroke={active ? '#1e3a5f' : '#888'} strokeWidth="2.5" fill="none"/>
      <line x1="5" y1="20" x2="55" y2="20" stroke={active ? '#1e3a5f' : '#bbb'} strokeWidth="1.5"/>
      <line x1="5" y1="40" x2="55" y2="40" stroke={active ? '#1e3a5f' : '#bbb'} strokeWidth="1.5"/>
      <line x1="5" y1="60" x2="55" y2="60" stroke={active ? '#1e3a5f' : '#bbb'} strokeWidth="1.5"/>
      <circle cx="43" cy="50" r="2.5" fill={active ? '#1e3a5f' : '#aaa'}/>
    </svg>
  ),
  decorative: ({ active }) => (
    <svg viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-14">
      <rect x="5" y="2" width="50" height="76" rx="2" stroke={active ? '#1e3a5f' : '#888'} strokeWidth="2.5" fill="none"/>
      <rect x="12" y="10" width="36" height="24" rx="2" stroke={active ? '#1e3a5f' : '#bbb'} strokeWidth="1.5" fill="none"/>
      <rect x="12" y="42" width="36" height="28" rx="2" stroke={active ? '#1e3a5f' : '#bbb'} strokeWidth="1.5" fill="none"/>
      <path d="M12 22 Q30 14 48 22" stroke={active ? '#1e3a5f' : '#bbb'} strokeWidth="1.2" fill="none"/>
      <circle cx="43" cy="56" r="2.5" fill={active ? '#1e3a5f' : '#aaa'}/>
    </svg>
  ),
  windows: ({ active }) => (
    <svg viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-14">
      <rect x="5" y="2" width="50" height="76" rx="2" stroke={active ? '#1e3a5f' : '#888'} strokeWidth="2.5" fill="none"/>
      <rect x="12" y="8" width="36" height="30" rx="1" stroke={active ? '#1e3a5f' : '#bbb'} strokeWidth="1.5" fill="none"/>
      <line x1="30" y1="8" x2="30" y2="38" stroke={active ? '#1e3a5f' : '#bbb'} strokeWidth="1.2"/>
      <line x1="12" y1="23" x2="48" y2="23" stroke={active ? '#1e3a5f' : '#bbb'} strokeWidth="1.2"/>
      <circle cx="43" cy="58" r="2.5" fill={active ? '#1e3a5f' : '#aaa'}/>
    </svg>
  ),
  security: ({ active }) => (
    <svg viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-14">
      <rect x="5" y="2" width="50" height="76" rx="2" stroke={active ? '#1e3a5f' : '#888'} strokeWidth="2.5" fill="none"/>
      <rect x="10" y="8" width="40" height="64" rx="1" stroke={active ? '#1e3a5f' : '#bbb'} strokeWidth="1" fill="none" strokeDasharray="3 2"/>
      <rect x="38" y="36" width="10" height="16" rx="2" stroke={active ? '#1e3a5f' : '#aaa'} strokeWidth="1.5" fill="none"/>
      <path d="M40 36 V32 a3 3 0 0 1 6 0 V36" stroke={active ? '#1e3a5f' : '#aaa'} strokeWidth="1.5" fill="none"/>
      <circle cx="43" cy="44" r="1.5" fill={active ? '#1e3a5f' : '#aaa'}/>
    </svg>
  ),
};

// Map subcategory IDs to icon keys
const ICON_MAP: Record<string, string> = {
  all: 'all',
  'a7ce1f01-94b9-4f58-a160-5da058762845': 'smooth',
  'acecba77-5476-4769-8e80-4a4715d1f496': 'wood',
  '94033109-9968-437e-b891-083d7f9c1645': 'decorative',
  '6f7bd14f-aed8-416d-a737-2f737dc5756d': 'windows',
};

export default function DoorCategoryNav({ categories, active, onChange, allLabel = 'כל הדלתות' }: Props) {
  const allCats = [{ id: 'all', nameHe: allLabel }, ...categories];

  return (
    <div className="bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-0 overflow-x-auto scrollbar-hide">
          {allCats.map((cat) => {
            const isActive = active === cat.id;
            const iconKey = ICON_MAP[cat.id] || 'smooth';
            const IconComp = DoorIcons[iconKey] || DoorIcons['smooth'];
            return (
              <button
                key={cat.id}
                onClick={() => onChange(cat.id)}
                className={`flex flex-col items-center gap-2 px-5 py-4 shrink-0 border-b-2 transition-all relative group ${
                  isActive
                    ? 'border-primary-700 text-primary-800'
                    : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-200'
                }`}
              >
                <IconComp active={isActive} />
                <span className={`text-xs font-semibold whitespace-nowrap ${isActive ? 'text-primary-800 font-bold' : ''}`}>
                  {cat.nameHe}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
