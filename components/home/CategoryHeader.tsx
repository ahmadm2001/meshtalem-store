'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

export type DoorTypeId = 'all' | 'single' | 'single_half' | 'double';

interface Subcategory {
  id: string;
  nameHe: string;
}

interface Props {
  // Main category context
  mainCategoryId: 'entry' | 'interior';
  mainCategoryName: string;

  // Subcategory filter
  subcategories: Subcategory[];
  activeSubcat: string;
  onSubcatChange: (id: string) => void;

  // Door type filter
  activeDoorType: DoorTypeId;
  onDoorTypeChange: (id: DoorTypeId) => void;

  // Breadcrumb
  breadcrumbLabel?: string;
}

const DOOR_TYPES: { id: DoorTypeId; label: string }[] = [
  { id: 'all', label: 'הכל' },
  { id: 'single', label: 'דלת' },
  { id: 'single_half', label: 'דלת וחצי' },
  { id: 'double', label: 'דלת כפולה' },
];

// Minimal SVG door icons for the subcategory tabs
function DoorIcon({ type, active }: { type: string; active: boolean }) {
  const color = active ? '#1e3a5f' : '#9ca3af';
  const strokeW = active ? '2.2' : '1.8';

  if (type === 'smooth') return (
    <svg viewBox="0 0 40 56" fill="none" className="w-7 h-10">
      <rect x="3" y="2" width="34" height="52" rx="2" stroke={color} strokeWidth={strokeW}/>
      <circle cx="30" cy="30" r="2" fill={color}/>
    </svg>
  );
  if (type === 'wood') return (
    <svg viewBox="0 0 40 56" fill="none" className="w-7 h-10">
      <rect x="3" y="2" width="34" height="52" rx="2" stroke={color} strokeWidth={strokeW}/>
      <line x1="3" y1="16" x2="37" y2="16" stroke={color} strokeWidth="1.4"/>
      <line x1="3" y1="30" x2="37" y2="30" stroke={color} strokeWidth="1.4"/>
      <line x1="3" y1="44" x2="37" y2="44" stroke={color} strokeWidth="1.4"/>
      <circle cx="30" cy="37" r="2" fill={color}/>
    </svg>
  );
  if (type === 'decorative') return (
    <svg viewBox="0 0 40 56" fill="none" className="w-7 h-10">
      <rect x="3" y="2" width="34" height="52" rx="2" stroke={color} strokeWidth={strokeW}/>
      <rect x="7" y="7" width="26" height="18" rx="1.5" stroke={color} strokeWidth="1.4"/>
      <rect x="7" y="30" width="26" height="18" rx="1.5" stroke={color} strokeWidth="1.4"/>
      <circle cx="30" cy="39" r="2" fill={color}/>
    </svg>
  );
  if (type === 'windows') return (
    <svg viewBox="0 0 40 56" fill="none" className="w-7 h-10">
      <rect x="3" y="2" width="34" height="52" rx="2" stroke={color} strokeWidth={strokeW}/>
      <rect x="7" y="6" width="26" height="22" rx="1" stroke={color} strokeWidth="1.4"/>
      <line x1="20" y1="6" x2="20" y2="28" stroke={color} strokeWidth="1.2"/>
      <line x1="7" y1="17" x2="33" y2="17" stroke={color} strokeWidth="1.2"/>
      <circle cx="30" cy="42" r="2" fill={color}/>
    </svg>
  );
  // default / all
  return (
    <svg viewBox="0 0 40 56" fill="none" className="w-7 h-10">
      <rect x="3" y="2" width="34" height="52" rx="2" stroke={color} strokeWidth={strokeW}/>
      <rect x="7" y="6" width="12" height="20" rx="1" stroke={color} strokeWidth="1.2"/>
      <rect x="21" y="6" width="12" height="20" rx="1" stroke={color} strokeWidth="1.2"/>
      <rect x="7" y="30" width="12" height="20" rx="1" stroke={color} strokeWidth="1.2"/>
      <rect x="21" y="30" width="12" height="20" rx="1" stroke={color} strokeWidth="1.2"/>
      <circle cx="30" cy="30" r="2" fill={color}/>
    </svg>
  );
}

const ICON_MAP: Record<string, string> = {
  'a7ce1f01-94b9-4f58-a160-5da058762845': 'smooth',
  'acecba77-5476-4769-8e80-4a4715d1f496': 'wood',
  '94033109-9968-437e-b891-083d7f9c1645': 'decorative',
  '6f7bd14f-aed8-416d-a737-2f737dc5756d': 'windows',
};

export default function CategoryHeader({
  mainCategoryId,
  mainCategoryName,
  subcategories,
  activeSubcat,
  onSubcatChange,
  activeDoorType,
  onDoorTypeChange,
  breadcrumbLabel,
}: Props) {
  return (
    <div className="bg-white border-b border-gray-100 shadow-sm">
      {/* ── Row 1: Main category tabs ── */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-0">
            <Link
              href="/doors/entry"
              className={`relative px-6 py-4 text-sm font-semibold transition-colors border-b-2 -mb-px ${
                mainCategoryId === 'entry'
                  ? 'border-primary-700 text-primary-800'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              דלתות כניסה
            </Link>
            <Link
              href="/doors/interior"
              className={`relative px-6 py-4 text-sm font-semibold transition-colors border-b-2 -mb-px ${
                mainCategoryId === 'interior'
                  ? 'border-primary-700 text-primary-800'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              דלתות פנים
            </Link>
          </div>
        </div>
      </div>

      {/* ── Row 2: Subcategory icons ── */}
      {subcategories.length > 0 && (
        <div className="border-b border-gray-50 bg-gray-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-0 overflow-x-auto scrollbar-hide">
              {/* All */}
              <button
                onClick={() => onSubcatChange('all')}
                className={`flex flex-col items-center gap-1.5 px-5 py-3.5 shrink-0 border-b-2 transition-all ${
                  activeSubcat === 'all'
                    ? 'border-primary-700 text-primary-800'
                    : 'border-transparent text-gray-400 hover:text-gray-700'
                }`}
              >
                <DoorIcon type="all" active={activeSubcat === 'all'} />
                <span className={`text-xs whitespace-nowrap ${activeSubcat === 'all' ? 'font-bold' : 'font-medium'}`}>
                  כל הדלתות
                </span>
              </button>
              {subcategories.map((sub) => {
                const isActive = activeSubcat === sub.id;
                const iconType = ICON_MAP[sub.id] || 'smooth';
                return (
                  <button
                    key={sub.id}
                    onClick={() => onSubcatChange(sub.id)}
                    className={`flex flex-col items-center gap-1.5 px-5 py-3.5 shrink-0 border-b-2 transition-all ${
                      isActive
                        ? 'border-primary-700 text-primary-800'
                        : 'border-transparent text-gray-400 hover:text-gray-700'
                    }`}
                  >
                    <DoorIcon type={iconType} active={isActive} />
                    <span className={`text-xs whitespace-nowrap ${isActive ? 'font-bold' : 'font-medium'}`}>
                      {sub.nameHe}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Row 3: Door type segmented control + breadcrumb ── */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4 flex-wrap">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-gray-400">
            <Link href="/" className="hover:text-primary-700 transition-colors">ראשי</Link>
            <ChevronRight className="w-3 h-3 text-gray-300" />
            <span className="text-gray-600 font-medium">{mainCategoryName}</span>
            {breadcrumbLabel && (
              <>
                <ChevronRight className="w-3 h-3 text-gray-300" />
                <span className="text-gray-800 font-semibold">{breadcrumbLabel}</span>
              </>
            )}
          </nav>

          {/* Door type segmented control */}
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5 gap-0.5">
            {DOOR_TYPES.map((dt) => (
              <button
                key={dt.id}
                onClick={() => onDoorTypeChange(dt.id)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  activeDoorType === dt.id
                    ? 'bg-white text-primary-800 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {dt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
