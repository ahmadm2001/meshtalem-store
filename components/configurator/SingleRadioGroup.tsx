'use client';

import { ConfigOptionGroup } from '@/lib/configurator.types';

interface SingleRadioGroupProps {
  group: ConfigOptionGroup;
  selectedIds: string[];
  onSelect: (groupId: string, valueId: string) => void;
}

/**
 * Renders an option group as a standard single-choice radio list.
 * Used for options like frame type, opening direction, etc.
 * Also serves as the backward-compatibility fallback for old records
 * that lack the `type` field (treated as single_radio).
 */
export function SingleRadioGroup({ group, selectedIds, onSelect }: SingleRadioGroupProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-base font-bold text-gray-900">{group.name}</h3>
        {group.required && (
          <span className="text-xs text-red-500 font-medium">* חובה</span>
        )}
      </div>

      <div className="space-y-2">
        {group.values.map((val) => {
          const isSelected = selectedIds.includes(val.id);

          return (
            <label
              key={val.id}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                isSelected
                  ? 'border-amber-500 bg-amber-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <input
                type="radio"
                name={`option-${group.id}`}
                value={val.id}
                checked={isSelected}
                onChange={() => onSelect(group.id, val.id)}
                className="accent-amber-500 w-4 h-4 shrink-0"
              />
              <span
                className={`text-sm font-medium flex-1 ${
                  isSelected ? 'text-amber-800' : 'text-gray-700'
                }`}
              >
                {val.label}
              </span>
              {val.priceModifier > 0 && (
                <span
                  className={`text-sm font-semibold shrink-0 ${
                    isSelected ? 'text-amber-600' : 'text-gray-500'
                  }`}
                >
                  +₪{val.priceModifier.toLocaleString()}
                </span>
              )}
            </label>
          );
        })}
      </div>

      {group.required && selectedIds.length === 0 && (
        <p className="text-xs text-red-500 mt-2">יש לבחור {group.name}</p>
      )}
    </div>
  );
}
