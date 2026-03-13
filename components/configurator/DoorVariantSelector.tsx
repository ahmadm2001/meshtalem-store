'use client';

import { DoorVariant } from '@/store/configurator';

interface DoorVariantSelectorProps {
  variants: DoorVariant[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

/**
 * Built-in Step 1 — בחר סוג דלת
 * Always shown as the first step in the configurator.
 * Displays the 3 fixed door variants with their base prices.
 */
export function DoorVariantSelector({
  variants,
  selectedId,
  onSelect,
}: DoorVariantSelectorProps) {
  if (!variants || variants.length === 0) return null;

  return (
    <div className="mb-5" dir="rtl">
      {/* Step header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center shrink-0">
          1
        </span>
        <h3 className="font-semibold text-gray-900 text-sm">
          בחר סוג דלת
          <span className="text-red-500 mr-1">*</span>
        </h3>
      </div>

      {/* Variant cards */}
      <div className="grid grid-cols-3 gap-2">
        {variants.map((variant) => {
          const isSelected = selectedId === variant.id;
          return (
            <button
              key={variant.id}
              type="button"
              onClick={() => onSelect(variant.id)}
              className={`relative flex flex-col items-center justify-center rounded-xl border-2 py-4 px-2 transition-all text-center ${
                isSelected
                  ? 'border-amber-500 bg-amber-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50/40'
              }`}
            >
              {/* Door icon */}
              <DoorIcon type={variant.id} selected={isSelected} />

              {/* Label */}
              <span
                className={`mt-2 text-xs font-semibold leading-tight ${
                  isSelected ? 'text-amber-700' : 'text-gray-700'
                }`}
              >
                {variant.label}
              </span>

              {/* Price */}
              <span
                className={`mt-1 text-xs ${
                  isSelected ? 'text-amber-600 font-bold' : 'text-gray-400'
                }`}
              >
                ₪{variant.basePrice.toLocaleString()}
              </span>

              {/* Selected checkmark */}
              {isSelected && (
                <span className="absolute top-1.5 left-1.5 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                  <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Divider */}
      <div className="mt-4 border-b border-gray-100" />
    </div>
  );
}

// ─── Inline SVG door icons ────────────────────────────────────────────────────

function DoorIcon({ type, selected }: { type: string; selected: boolean }) {
  const color = selected ? '#d97706' : '#9ca3af';

  if (type === 'single') {
    // Single door
    return (
      <svg viewBox="0 0 40 56" className="w-8 h-10" fill="none">
        <rect x="4" y="2" width="32" height="52" rx="2" stroke={color} strokeWidth="2.5" fill={selected ? '#fef3c7' : '#f9fafb'} />
        <circle cx="30" cy="30" r="2.5" fill={color} />
        <line x1="30" y1="30" x2="28" y2="30" stroke={color} strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === 'single_half') {
    // Single + half door
    return (
      <svg viewBox="0 0 56 56" className="w-10 h-10" fill="none">
        {/* Main door */}
        <rect x="2" y="2" width="32" height="52" rx="2" stroke={color} strokeWidth="2.5" fill={selected ? '#fef3c7' : '#f9fafb'} />
        <circle cx="28" cy="30" r="2.5" fill={color} />
        <line x1="28" y1="30" x2="26" y2="30" stroke={color} strokeWidth="2" strokeLinecap="round" />
        {/* Half door */}
        <rect x="36" y="28" width="18" height="26" rx="2" stroke={color} strokeWidth="2" fill={selected ? '#fef3c7' : '#f9fafb'} />
      </svg>
    );
  }

  // Double door
  return (
    <svg viewBox="0 0 56 56" className="w-10 h-10" fill="none">
      {/* Left door */}
      <rect x="2" y="2" width="24" height="52" rx="2" stroke={color} strokeWidth="2.5" fill={selected ? '#fef3c7' : '#f9fafb'} />
      <circle cx="22" cy="30" r="2" fill={color} />
      {/* Right door */}
      <rect x="30" y="2" width="24" height="52" rx="2" stroke={color} strokeWidth="2.5" fill={selected ? '#fef3c7' : '#f9fafb'} />
      <circle cx="34" cy="30" r="2" fill={color} />
    </svg>
  );
}
