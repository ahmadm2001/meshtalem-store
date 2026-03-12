'use client';

import React from 'react';
import { ConfigOptionGroup } from '@/lib/configurator.types';
import { ConfigSelections } from '@/lib/configurator.types';
import { Check } from 'lucide-react';

interface StepProgressBarProps {
  /** All visible option groups (already filtered by dependency). */
  visibleGroups: ConfigOptionGroup[];
  /** Current user selections. */
  selections: ConfigSelections;
}

/**
 * Renders a horizontal step progress indicator.
 * Groups are deduplicated by step number; the label shown is the first
 * group name at each step.
 * A step is "complete" when all required groups at that step have a selection.
 */
export function StepProgressBar({ visibleGroups, selections }: StepProgressBarProps) {
  // Build a map of step → groups at that step
  const stepMap = new Map<number, ConfigOptionGroup[]>();
  for (const g of visibleGroups) {
    if (!stepMap.has(g.step)) stepMap.set(g.step, []);
    stepMap.get(g.step)!.push(g);
  }

  const steps = Array.from(stepMap.entries()).sort(([a], [b]) => a - b);
  if (steps.length <= 1) return null; // Don't render for single-step products

  return (
    <div className="flex items-center gap-0 mb-6 overflow-x-auto pb-1" dir="rtl">
      {steps.map(([stepNum, groups], idx) => {
        const isComplete = groups
          .filter((g) => g.required)
          .every((g) => (selections[g.id] ?? []).length > 0);

        const label = groups[0].name;

        return (
          <React.Fragment key={stepNum}>
            {/* Step bubble */}
            <div className="flex flex-col items-center shrink-0">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  isComplete
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {isComplete ? <Check className="w-4 h-4" /> : stepNum}
              </div>
              <span className="text-xs text-gray-500 mt-1 text-center max-w-[80px] leading-tight">
                {label}
              </span>
            </div>

            {/* Connector line (not after last step) */}
            {idx < steps.length - 1 && (
              <div className="flex-1 h-0.5 bg-gray-200 mx-1 mb-5 min-w-[16px]" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
