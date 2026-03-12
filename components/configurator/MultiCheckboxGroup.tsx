'use client';

import { ConfigOptionGroup } from '@/lib/configurator.types';
import { Check } from 'lucide-react';

interface MultiCheckboxGroupProps {
  group: ConfigOptionGroup;
  selectedIds: string[];
  onToggle: (groupId: string, valueId: string) => void;
}

/**
 * Renders an option group as a list of toggleable checkbox cards.
 * Used for upgrades and accessories where multiple selections are allowed.
 * Each card shows: label, description (if any), and price modifier.
 */
export function MultiCheckboxGroup({ group, selectedIds, onToggle }: MultiCheckboxGroupProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-base font-bold text-gray-900">{group.name}</h3>
        <span className="text-xs text-gray-400 font-medium">(ניתן לבחור מספר)</span>
      </div>

      <div className="space-y-2">
        {group.values.map((val) => {
          const isSelected = selectedIds.includes(val.id);

          return (
            <button
              key={val.id}
              type="button"
              onClick={() => onToggle(group.id, val.id)}
              className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 transition-all text-right ${
                isSelected
                  ? 'border-amber-500 bg-amber-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              {/* Checkbox indicator */}
              <div
                className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                  isSelected
                    ? 'border-amber-500 bg-amber-500'
                    : 'border-gray-300 bg-white'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 text-white" />}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-sm font-semibold ${
                      isSelected ? 'text-amber-800' : 'text-gray-800'
                    }`}
                  >
                    {val.label}
                  </span>
                  <span
                    className={`text-sm font-bold shrink-0 ${
                      isSelected ? 'text-amber-600' : 'text-gray-500'
                    }`}
                  >
                    {val.priceModifier > 0
                      ? `+₪${val.priceModifier.toLocaleString()}`
                      : 'ללא תוספת'}
                  </span>
                </div>
                {val.description && (
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                    {val.description}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
