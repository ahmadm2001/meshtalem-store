'use client';

import { ConfigOptionGroup } from '@/lib/configurator.types';

interface VisualCardGroupProps {
  group: ConfigOptionGroup;
  selectedIds: string[];
  onSelect: (groupId: string, valueId: string) => void;
}

/**
 * Renders an option group as large clickable visual cards.
 * Used for structural options like door type and height range.
 * Each card shows: icon (if available), label, sub-label, and price modifier.
 */
export function VisualCardGroup({ group, selectedIds, onSelect }: VisualCardGroupProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-base font-bold text-gray-900">{group.name}</h3>
        {group.required && (
          <span className="text-xs text-red-500 font-medium">* חובה</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {group.values.map((val) => {
          const isSelected = selectedIds.includes(val.id);

          return (
            <button
              key={val.id}
              type="button"
              onClick={() => onSelect(group.id, val.id)}
              className={`relative flex flex-col items-center justify-between p-4 rounded-xl border-2 transition-all text-right cursor-pointer min-h-[110px] ${
                isSelected
                  ? 'border-amber-500 bg-amber-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              {/* Icon area */}
              {val.icon && (
                <div className="w-10 h-10 mb-2 flex items-center justify-center">
                  <DoorIcon iconKey={val.icon} selected={isSelected} />
                </div>
              )}

              {/* Label */}
              <span
                className={`text-sm font-semibold leading-tight text-center ${
                  isSelected ? 'text-amber-800' : 'text-gray-800'
                }`}
              >
                {val.label}
              </span>

              {/* Description (e.g. size range) */}
              {val.description && (
                <span className="text-xs text-gray-400 mt-0.5 text-center">
                  {val.description}
                </span>
              )}

              {/* Price modifier */}
              {val.priceModifier > 0 && (
                <span
                  className={`text-xs font-bold mt-1 ${
                    isSelected ? 'text-amber-600' : 'text-gray-500'
                  }`}
                >
                  +₪{val.priceModifier.toLocaleString()}
                </span>
              )}

              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute top-2 left-2 w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center">
                  <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 text-white fill-current">
                    <path d="M10 3L5 8.5 2 5.5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Validation message */}
      {group.required && selectedIds.length === 0 && (
        <p className="text-xs text-red-500 mt-2">יש לבחור {group.name}</p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Simple inline door icon renderer
// Maps icon key strings to SVG illustrations
// ─────────────────────────────────────────────────────────────────────────────

function DoorIcon({ iconKey, selected }: { iconKey: string; selected: boolean }) {
  const color = selected ? '#d97706' : '#9ca3af';

  switch (iconKey) {
    case 'door_single':
      return (
        <svg viewBox="0 0 40 60" width="28" height="42" fill="none" stroke={color} strokeWidth="2">
          <rect x="4" y="2" width="32" height="56" rx="1" />
          <circle cx="30" cy="31" r="2" fill={color} />
        </svg>
      );
    case 'door_double':
      return (
        <svg viewBox="0 0 60 60" width="42" height="42" fill="none" stroke={color} strokeWidth="2">
          <rect x="2" y="2" width="26" height="56" rx="1" />
          <rect x="32" y="2" width="26" height="56" rx="1" />
          <circle cx="28" cy="31" r="2" fill={color} />
          <circle cx="32" cy="31" r="2" fill={color} />
        </svg>
      );
    case 'door_half':
      return (
        <svg viewBox="0 0 60 60" width="42" height="42" fill="none" stroke={color} strokeWidth="2">
          <rect x="2" y="2" width="36" height="56" rx="1" />
          <rect x="42" y="18" width="16" height="40" rx="1" />
          <circle cx="38" cy="31" r="2" fill={color} />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 40 60" width="28" height="42" fill="none" stroke={color} strokeWidth="2">
          <rect x="4" y="2" width="32" height="56" rx="1" />
          <circle cx="30" cy="31" r="2" fill={color} />
        </svg>
      );
  }
}
