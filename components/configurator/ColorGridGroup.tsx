'use client';

import { ConfigOptionGroup } from '@/lib/configurator.types';
import { Check } from 'lucide-react';

interface ColorGridGroupProps {
  group: ConfigOptionGroup;
  selectedIds: string[];
  onSelect: (groupId: string, valueId: string) => void;
}

/**
 * Renders an option group as a grid of color swatches.
 * Each swatch shows the colorCode as background and the label on hover.
 * A checkmark appears on the selected swatch.
 */
export function ColorGridGroup({ group, selectedIds, onSelect }: ColorGridGroupProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-base font-bold text-gray-900">{group.name}</h3>
        {group.required && (
          <span className="text-xs text-red-500 font-medium">* חובה</span>
        )}
        {/* Show selected label inline */}
        {selectedIds.length > 0 && (
          <span className="text-sm text-gray-500 mr-auto">
            {group.values.find((v) => v.id === selectedIds[0])?.label}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        {group.values.map((val) => {
          const isSelected = selectedIds.includes(val.id);
          const bg = val.colorCode ?? '#cccccc';

          return (
            <button
              key={val.id}
              type="button"
              title={`${val.label}${val.priceModifier > 0 ? ` (+₪${val.priceModifier.toLocaleString()})` : ''}`}
              onClick={() => onSelect(group.id, val.id)}
              className={`relative w-10 h-10 rounded-full transition-all focus:outline-none ${
                isSelected
                  ? 'ring-2 ring-offset-2 ring-amber-500 scale-110'
                  : 'ring-1 ring-gray-300 hover:scale-105'
              }`}
              style={{ backgroundColor: bg }}
            >
              {isSelected && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <Check
                    className="w-4 h-4 drop-shadow-md"
                    style={{ color: isLightColor(bg) ? '#1a1a1a' : '#ffffff' }}
                  />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Price modifier note for selected color */}
      {selectedIds.length > 0 && (() => {
        const sel = group.values.find((v) => v.id === selectedIds[0]);
        return sel && sel.priceModifier > 0 ? (
          <p className="text-xs text-amber-600 mt-2 font-medium">
            +₪{sel.priceModifier.toLocaleString()} עבור {sel.label}
          </p>
        ) : null;
      })()}

      {/* Validation message */}
      {group.required && selectedIds.length === 0 && (
        <p className="text-xs text-red-500 mt-2">יש לבחור צבע</p>
      )}
    </div>
  );
}

/** Returns true if a hex color is perceptually light (so dark text is used). */
function isLightColor(hex: string): boolean {
  const clean = hex.replace('#', '');
  if (clean.length < 6) return true;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  // Perceived luminance formula
  return r * 0.299 + g * 0.587 + b * 0.114 > 186;
}
