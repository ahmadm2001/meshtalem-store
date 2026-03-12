'use client';

import { useConfiguratorStore } from '@/store/configurator';
import { StepProgressBar } from './StepProgressBar';
import { VisualCardGroup } from './VisualCardGroup';
import { ColorGridGroup } from './ColorGridGroup';
import { MultiCheckboxGroup } from './MultiCheckboxGroup';
import { SingleRadioGroup } from './SingleRadioGroup';
import { ConfigOptionGroup } from '@/lib/configurator.types';

interface ConfiguratorPanelProps {
  /** Called when the user clicks "Add to Cart" / "להזמנה". */
  onAddToCart: () => void;
  /** Whether the add-to-cart action is in progress. */
  isLoading?: boolean;
}

/**
 * The main configurator panel.
 * Reads all state from the Zustand configurator store.
 * Renders a step progress bar, then each visible option group
 * using the appropriate component for its display type.
 * Shows a live price summary and the add-to-cart button.
 */
export function ConfiguratorPanel({ onAddToCart, isLoading }: ConfiguratorPanelProps) {
  const {
    optionGroups,
    selections,
    toggleSelection,
    getVisibleGroups,
    getEstimatedTotal,
    getOptionsExtraCost,
    isConfigurationComplete,
    basePrice,
  } = useConfiguratorStore();

  const visibleGroups = getVisibleGroups();
  const estimatedTotal = getEstimatedTotal();
  const extraCost = getOptionsExtraCost();
  const isComplete = isConfigurationComplete();

  if (optionGroups.length === 0) {
    // No options — simple add to cart
    return (
      <button
        type="button"
        onClick={onAddToCart}
        disabled={isLoading}
        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 px-6 rounded-xl text-base transition-all disabled:opacity-60"
      >
        {isLoading ? 'מוסיף...' : 'הוסף לעגלה'}
      </button>
    );
  }

  return (
    <div className="space-y-0">
      {/* Step progress bar */}
      <StepProgressBar visibleGroups={visibleGroups} selections={selections} />

      {/* Option groups */}
      {visibleGroups.map((group: ConfigOptionGroup) => {
        const selectedIds = selections[group.id] ?? [];

        switch (group.type) {
          case 'visual_card':
            return (
              <VisualCardGroup
                key={group.id}
                group={group}
                selectedIds={selectedIds}
                onSelect={toggleSelection}
              />
            );

          case 'color_grid':
            return (
              <ColorGridGroup
                key={group.id}
                group={group}
                selectedIds={selectedIds}
                onSelect={toggleSelection}
              />
            );

          case 'multi_checkbox':
            return (
              <MultiCheckboxGroup
                key={group.id}
                group={group}
                selectedIds={selectedIds}
                onToggle={toggleSelection}
              />
            );

          case 'single_radio':
          default:
            return (
              <SingleRadioGroup
                key={group.id}
                group={group}
                selectedIds={selectedIds}
                onSelect={toggleSelection}
              />
            );
        }
      })}

      {/* Price summary */}
      {extraCost > 0 && (
        <div className="bg-gray-50 rounded-xl p-4 mb-4 text-sm border border-gray-100">
          <div className="flex justify-between text-gray-600 mb-1">
            <span>מחיר בסיס:</span>
            <span>₪{basePrice.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-amber-600 mb-1 font-medium">
            <span>תוספות נבחרות:</span>
            <span>+₪{extraCost.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-2 mt-1 text-base">
            <span>מחיר משוער:</span>
            <span className="text-amber-600">₪{estimatedTotal.toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* Add to cart button */}
      <button
        type="button"
        onClick={onAddToCart}
        disabled={!isComplete || isLoading}
        className={`w-full font-bold py-4 px-6 rounded-xl text-base transition-all ${
          isComplete && !isLoading
            ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg hover:shadow-xl'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        {isLoading
          ? 'מוסיף...'
          : !isComplete
          ? 'יש להשלים את כל הבחירות'
          : 'הוסף לעגלה'}
      </button>

      {/* Incomplete selection hint */}
      {!isComplete && (
        <p className="text-xs text-gray-400 text-center mt-2">
          יש לבחור את כל האפשרויות המסומנות בכוכבית (*)
        </p>
      )}
    </div>
  );
}
