/**
 * Q DOOR Configurator Store (Zustand)
 *
 * Manages the full state of the door configurator:
 *  - Built-in door variant selection (step 1: דלת / דלת וחצי / דלת כפולה)
 *  - Option schema loaded from the product API
 *  - User selections (by group ID → array of value IDs)
 *  - Live price calculation
 *  - Preview image resolution
 *  - Dependency-based group visibility
 *  - Dependency cleanup when a parent selection changes
 *  - Serialisation to the cart snapshot format
 */

import { create } from 'zustand';
import {
  ConfigOptionGroup,
  ConfigOptionValue,
  ConfigSelections,
  SelectedOptionSnapshot,
  normaliseOptionGroups,
} from '@/lib/configurator.types';

// ─── Door Variant types ───────────────────────────────────────────────────────

export interface DoorVariant {
  id: string;       // 'single' | 'single_half' | 'double'
  label: string;    // 'דלת' | 'דלת וחצי' | 'דלת כפולה'
  basePrice: number;
  /** Optional image URL for this variant */
  image?: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// State & Actions Interface
// ─────────────────────────────────────────────────────────────────────────────

interface ConfiguratorStore {
  // ── Core data ──────────────────────────────────────────────────────────────
  productId: string | null;
  productName: string;
  /** Fallback base price (used when no doorVariant is selected yet) */
  basePrice: number;
  defaultImage: string;
  optionGroups: ConfigOptionGroup[];

  // ── Door variants (built-in step 1) ───────────────────────────────────────
  /** Available door variants for this product (from product.doorVariants) */
  doorVariants: DoorVariant[];
  /** Currently selected door variant ID (null = not yet selected) */
  selectedDoorVariantId: string | null;

  // ── User selections (for option groups beyond step 1) ─────────────────────
  /** Key = group.id, Value = array of selected value IDs */
  selections: ConfigSelections;

  // ── Actions ────────────────────────────────────────────────────────────────

  /** Initialise the store with product data. Call when the product page mounts. */
  init: (params: {
    productId: string;
    productName: string;
    basePrice: number;
    defaultImage: string;
    rawOptions: unknown[];
    doorVariants?: DoorVariant[];
  }) => void;

  /** Reset all selections (e.g. when navigating away). */
  reset: () => void;

  /** Select a door variant (step 1). Updates the effective base price. */
  selectDoorVariant: (variantId: string) => void;

  /**
   * Toggle a value selection for a group.
   *  - For single-select types (visual_card, color_grid, single_radio):
   *    replaces the current selection with [valueId].
   *  - For multi_checkbox:
   *    adds valueId if absent, removes it if already present.
   * After any change, dependent groups whose condition is no longer met
   * are automatically cleared.
   */
  toggleSelection: (groupId: string, valueId: string) => void;

  /** Manually clear all selections for a group. */
  clearGroup: (groupId: string) => void;

  // ── Derived getters ────────────────────────────────────────────────────────

  /** Returns the currently selected door variant object (or null). */
  getSelectedDoorVariant: () => DoorVariant | null;
  /** Returns the effective base price (from selected door variant, or fallback). */
  getEffectiveBasePrice: () => number;
  /** Returns only the groups that should currently be visible (dependency check). */
  getVisibleGroups: () => ConfigOptionGroup[];
  /** Returns the current wizard step number. */
  getCurrentStep: () => number;

  /**
   * Returns the estimated total price:
   *   effectiveBasePrice + sum of priceModifiers for all selected values.
   */
  getEstimatedTotal: () => number;

  /**
   * Returns the total extra cost from options only
   * (i.e. getEstimatedTotal() - effectiveBasePrice).
   */
  getOptionsExtraCost: () => number;

  /**
   * Returns the URL of the image to show in the preview.
   * Checks if any selected value has an imageOverride; uses the first one found.
   * Falls back to defaultImage if none is set.
   */
  getPreviewImage: () => string;

  /**
   * Returns true if:
   *  1. A door variant is selected (if doorVariants exist)
   *  2. All required visible option groups have at least one selection.
   */
  isConfigurationComplete: () => boolean;

  /**
   * Serialises the current selections into the SelectedOptionSnapshot[] format
   * used by the cart and order system.
   */
  buildSnapshot: () => SelectedOptionSnapshot[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: evaluate a single dependency rule
// ─────────────────────────────────────────────────────────────────────────────

function isDependencySatisfied(
  dependsOn: { groupId: string; valueId: string } | undefined,
  selections: ConfigSelections
): boolean {
  if (!dependsOn) return true;
  const parentSelections = selections[dependsOn.groupId] ?? [];
  return parentSelections.includes(dependsOn.valueId);
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: clean up dependent groups after a parent selection changes
// ─────────────────────────────────────────────────────────────────────────────

function cleanupDependents(
  groups: ConfigOptionGroup[],
  selections: ConfigSelections
): ConfigSelections {
  const cleaned = { ...selections };
  let changed = true;

  // Run multiple passes in case of chained dependencies (A → B → C)
  while (changed) {
    changed = false;
    for (const group of groups) {
      if (!group.dependsOn) continue;
      const satisfied = isDependencySatisfied(group.dependsOn, cleaned);
      if (!satisfied && cleaned[group.id] && cleaned[group.id].length > 0) {
        cleaned[group.id] = [];
        changed = true;
      }
    }
  }

  return cleaned;
}

// ─────────────────────────────────────────────────────────────────────────────
// Store implementation
// ─────────────────────────────────────────────────────────────────────────────

export const useConfiguratorStore = create<ConfiguratorStore>((set, get) => ({
  // ── Initial state ──────────────────────────────────────────────────────────
  productId: null,
  productName: '',
  basePrice: 0,
  defaultImage: '',
  optionGroups: [],
  doorVariants: [],
  selectedDoorVariantId: null,
  selections: {},

  // ── Actions ────────────────────────────────────────────────────────────────

  init: ({ productId, productName, basePrice, defaultImage, rawOptions, doorVariants }) => {
    const optionGroups = normaliseOptionGroups(rawOptions);
    optionGroups.sort((a, b) => a.step - b.step);
    set({
      productId,
      productName,
      basePrice,
      defaultImage,
      optionGroups,
      doorVariants: doorVariants ?? [],
      selectedDoorVariantId: null,
      selections: {},
    });
  },

  reset: () => set({
    selections: {},
    productId: null,
    optionGroups: [],
    doorVariants: [],
    selectedDoorVariantId: null,
  }),

  selectDoorVariant: (variantId) => {
    set({ selectedDoorVariantId: variantId });
  },

  toggleSelection: (groupId, valueId) => {
    const { optionGroups, selections } = get();
    const group = optionGroups.find((g) => g.id === groupId);
    if (!group) return;

    let updated: ConfigSelections;

    if (group.type === 'multi_checkbox') {
      // Toggle: add if absent, remove if present
      const current = selections[groupId] ?? [];
      const exists = current.includes(valueId);
      updated = {
        ...selections,
        [groupId]: exists
          ? current.filter((id) => id !== valueId)
          : [...current, valueId],
      };
    } else {
      // Single-select: always replace with exactly one value
      updated = {
        ...selections,
        [groupId]: [valueId],
      };
    }

    // Clean up any dependent groups that are no longer valid
    const cleaned = cleanupDependents(optionGroups, updated);
    set({ selections: cleaned });
  },

  clearGroup: (groupId) => {
    const { optionGroups, selections } = get();
    const updated = { ...selections, [groupId]: [] };
    const cleaned = cleanupDependents(optionGroups, updated);
    set({ selections: cleaned });
  },

  // ── Derived getters ────────────────────────────────────────────────────────

  getSelectedDoorVariant: () => {
    const { doorVariants, selectedDoorVariantId } = get();
    if (!selectedDoorVariantId) return null;
    return doorVariants.find((v) => v.id === selectedDoorVariantId) ?? null;
  },

  getEffectiveBasePrice: () => {
    const { doorVariants, selectedDoorVariantId, basePrice } = get();
    if (doorVariants.length > 0 && selectedDoorVariantId) {
      const variant = doorVariants.find((v) => v.id === selectedDoorVariantId);
      if (variant) return variant.basePrice;
    }
    return basePrice;
  },

  getVisibleGroups: () => {
    const { optionGroups, selections } = get();
    return optionGroups.filter((g) =>
      isDependencySatisfied(g.dependsOn, selections)
    );
  },

  getCurrentStep: () => {
    const visible = get().getVisibleGroups();
    if (visible.length === 0) return 1;
    return Math.max(...visible.map((g) => g.step));
  },

  getEstimatedTotal: () => {
    const { optionGroups, selections } = get();
    const effectiveBase = get().getEffectiveBasePrice();
    let extra = 0;

    for (const group of optionGroups) {
      if (!isDependencySatisfied(group.dependsOn, selections)) continue;
      const selectedIds = selections[group.id] ?? [];
      for (const valueId of selectedIds) {
        const val = group.values.find((v) => v.id === valueId);
        if (val) extra += val.priceModifier;
      }
    }

    return effectiveBase + extra;
  },

  getOptionsExtraCost: () => {
    return get().getEstimatedTotal() - get().getEffectiveBasePrice();
  },

  getPreviewImage: () => {
    const { optionGroups, selections, defaultImage } = get();

    // First check option group imageOverrides
    for (const group of optionGroups) {
      if (!isDependencySatisfied(group.dependsOn, selections)) continue;
      const selectedIds = selections[group.id] ?? [];
      for (const valueId of selectedIds) {
        const val = group.values.find((v) => v.id === valueId);
        if (val?.imageOverride) return val.imageOverride;
      }
    }

    // Then check selected door variant image
    const selectedVariant = get().getSelectedDoorVariant();
    if (selectedVariant?.image) return selectedVariant.image;

    return defaultImage;
  },

  isConfigurationComplete: () => {
    const { doorVariants, selectedDoorVariantId, selections } = get();
    // If there are door variants, one must be selected
    if (doorVariants.length > 0 && !selectedDoorVariantId) return false;
    // All required visible option groups must have a selection
    const visible = get().getVisibleGroups();
    return visible
      .filter((g) => g.required)
      .every((g) => (selections[g.id] ?? []).length > 0);
  },

  buildSnapshot: (): SelectedOptionSnapshot[] => {
    const { optionGroups, selections } = get();
    const snapshot: SelectedOptionSnapshot[] = [];

    // Include door variant as first snapshot entry
    const selectedVariant = get().getSelectedDoorVariant();
    if (selectedVariant) {
      snapshot.push({
        groupId: 'door_variant',
        groupName: 'סוג דלת',
        selectedValueIds: [selectedVariant.id],
        selectedValueLabels: [selectedVariant.label],
        priceModifier: 0,
      });
    }

    for (const group of optionGroups) {
      if (!isDependencySatisfied(group.dependsOn, selections)) continue;
      const selectedIds = selections[group.id] ?? [];
      if (selectedIds.length === 0) continue;

      const selectedValues: ConfigOptionValue[] = selectedIds
        .map((id) => group.values.find((v) => v.id === id))
        .filter(Boolean) as ConfigOptionValue[];

      const totalModifier = selectedValues.reduce(
        (sum, v) => sum + v.priceModifier,
        0
      );

      snapshot.push({
        groupId: group.id,
        groupName: group.name,
        selectedValueIds: selectedIds,
        selectedValueLabels: selectedValues.map((v) => v.label),
        priceModifier: totalModifier,
      });
    }

    return snapshot;
  },
}));
