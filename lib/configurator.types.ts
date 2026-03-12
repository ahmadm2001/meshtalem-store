/**
 * Q DOOR Configurator — Shared TypeScript Types
 *
 * These types mirror the backend ProductOptionGroup / ProductOptionValue
 * interfaces and are used by the Zustand configurator store, the product
 * page, and the cart/checkout flow.
 */

export type OptionDisplayType =
  | 'visual_card'
  | 'color_grid'
  | 'single_radio'
  | 'multi_checkbox';

export interface ConfigOptionValue {
  /** Stable unique identifier used as the state key (e.g. "double_door"). */
  id: string;
  /** Customer-facing label (e.g. "דלת כפולה"). */
  label: string;
  /** Extra cost added to the base price. 0 = no extra cost. */
  priceModifier: number;
  /** Hex color code for color_grid swatches (e.g. "#1A1A1A"). */
  colorCode?: string;
  /** Key that maps to an SVG/PNG illustration for visual_card. */
  icon?: string;
  /** URL of a product image to swap into the preview when selected. */
  imageOverride?: string;
  /** Short descriptive text shown below the label. */
  description?: string;
}

export interface OptionDependencyRule {
  groupId: string;
  valueId: string;
}

export interface ConfigOptionGroup {
  /** Stable unique identifier used as the Zustand state key (e.g. "door_type"). */
  id: string;
  /** Customer-facing section title (e.g. "איזו דלת תבחרו?"). */
  name: string;
  /** UI component type. Defaults to "single_radio" for backward compatibility. */
  type: OptionDisplayType;
  /** Wizard step number. Groups are rendered in ascending order. */
  step: number;
  /** If true, the customer must select a value before adding to cart. */
  required: boolean;
  /** Logical grouping for the admin panel. */
  adminCategory?: string;
  /** Conditional rendering: only show this group when the parent has the required value. */
  dependsOn?: OptionDependencyRule;
  /** The available choices for this group. */
  values: ConfigOptionValue[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Configurator State
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The selections map.
 * Key = group.id
 * Value = array of selected value IDs
 *   - single_radio / visual_card / color_grid: always length 1
 *   - multi_checkbox: may be length 0..n
 */
export type ConfigSelections = Record<string, string[]>;

/**
 * A single option snapshot entry saved to the cart and order.
 * Stores both IDs and labels so the snapshot is human-readable
 * even if the product schema changes later.
 */
export interface SelectedOptionSnapshot {
  groupId: string;
  groupName: string;
  selectedValueIds: string[];
  selectedValueLabels: string[];
  priceModifier: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Backward-compatibility helper
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Normalises a raw productOptions array coming from the API.
 * Old records may lack `id`, `step`, `type`, and `required` fields.
 * This function fills in sensible defaults so the configurator engine
 * can always work with the full interface.
 */
export function normaliseOptionGroups(raw: unknown[]): ConfigOptionGroup[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((g: any, gi: number) => ({
    id: g.id ?? `group_${gi}`,
    name: g.name ?? `אפשרות ${gi + 1}`,
    type: (g.type as OptionDisplayType) ?? 'single_radio',
    step: typeof g.step === 'number' ? g.step : gi + 1,
    required: typeof g.required === 'boolean' ? g.required : true,
    adminCategory: g.adminCategory,
    dependsOn: g.dependsOn,
    values: Array.isArray(g.values)
      ? g.values.map((v: any, vi: number) => ({
          id: v.id ?? `${g.id ?? `group_${gi}`}_val_${vi}`,
          label: v.label ?? '',
          priceModifier: typeof v.priceModifier === 'number' ? v.priceModifier : 0,
          colorCode: v.colorCode,
          icon: v.icon,
          imageOverride: v.imageOverride,
          description: v.description,
        }))
      : [],
  }));
}
