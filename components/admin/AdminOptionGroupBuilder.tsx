'use client';
import { useState, useCallback } from 'react';
import {
  Plus, Trash2, ChevronUp, ChevronDown, ChevronRight,
  GripVertical, AlertCircle, Eye, Copy, Check
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AdminOptionValue {
  id: string;
  label: string;
  priceModifier: number;
  description?: string;
  colorCode?: string;
  icon?: string;
  imageOverride?: string;
}

export interface AdminOptionGroup {
  id: string;
  name: string;
  adminCategory: 'structure' | 'design' | 'upgrades' | 'installation' | 'general';
  step: number;
  type: 'visual_card' | 'color_grid' | 'multi_checkbox' | 'single_radio';
  required: boolean;
  dependsOn?: { groupId: string; valueId: string } | null;
  values: AdminOptionValue[];
}

// ─── Constants ───────────────────────────────────────────────────────────────

const ADMIN_CATEGORIES = [
  { value: 'structure',     label: 'מבנה' },
  { value: 'design',        label: 'עיצוב' },
  { value: 'upgrades',      label: 'שדרוגים' },
  { value: 'installation',  label: 'התקנה' },
  { value: 'general',       label: 'כללי' },
] as const;

const DISPLAY_TYPES = [
  { value: 'visual_card',    label: 'כרטיסים ויזואליים', desc: 'כרטיסים גדולים עם אייקון' },
  { value: 'color_grid',     label: 'רשת צבעים',         desc: 'עיגולי צבע לבחירה' },
  { value: 'multi_checkbox', label: 'בחירה מרובה',        desc: 'ניתן לבחור מספר ערכים' },
  { value: 'single_radio',   label: 'בחירה יחידה',        desc: 'רדיו בוטון רגיל' },
] as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2, 9);

const slugify = (text: string) =>
  text.trim().toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^\w_]/g, '')
    .slice(0, 40) || uid();

const newValue = (): AdminOptionValue => ({
  id: uid(),
  label: '',
  priceModifier: 0,
});

const newGroup = (step: number): AdminOptionGroup => ({
  id: uid(),
  name: '',
  adminCategory: 'general',
  step,
  type: 'single_radio',
  required: true,
  dependsOn: null,
  values: [newValue()],
});

// ─── Sub-component: ValueRow ──────────────────────────────────────────────────

function ValueRow({
  value,
  groupType,
  onChange,
  onRemove,
  canRemove,
  isDuplicateId,
}: {
  value: AdminOptionValue;
  groupType: AdminOptionGroup['type'];
  onChange: (v: AdminOptionValue) => void;
  onRemove: () => void;
  canRemove: boolean;
  isDuplicateId: boolean;
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className={`border rounded-lg p-3 bg-white ${isDuplicateId ? 'border-red-400' : 'border-gray-200'}`}>
      <div className="flex items-center gap-2">
        <GripVertical className="w-4 h-4 text-gray-300 shrink-0" />

        {/* Color swatch for color_grid */}
        {groupType === 'color_grid' && (
          <div className="relative shrink-0">
            <div
              className="w-8 h-8 rounded-full border-2 border-gray-300 cursor-pointer overflow-hidden"
              style={{ backgroundColor: value.colorCode || '#cccccc' }}
            >
              <input
                type="color"
                value={value.colorCode || '#cccccc'}
                onChange={(e) => onChange({ ...value, colorCode: e.target.value })}
                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                title="בחר צבע"
              />
            </div>
          </div>
        )}

        {/* Label */}
        <input
          value={value.label}
          onChange={(e) => onChange({ ...value, label: e.target.value })}
          placeholder="שם הערך (למשל: שחור, 2x2, מנעול חכם)"
          className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
          dir="rtl"
        />

        {/* Price modifier */}
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-xs text-gray-400">+₪</span>
          <input
            type="number"
            min={0}
            value={value.priceModifier}
            onChange={(e) => onChange({ ...value, priceModifier: Number(e.target.value) })}
            className="w-20 text-sm border border-gray-200 rounded-lg px-2 py-2 text-center focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        {/* Advanced toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced((s) => !s)}
          className="text-xs text-gray-400 hover:text-blue-500 px-1"
          title="שדות נוספים"
        >
          {showAdvanced ? '▲' : '▼'}
        </button>

        {/* Remove */}
        {canRemove && (
          <button type="button" onClick={onRemove}
            className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ID display */}
      <div className="flex items-center gap-2 mt-1.5 mr-6">
        <span className="text-xs text-gray-300 font-mono">ID:</span>
        <input
          value={value.id}
          onChange={(e) => onChange({ ...value, id: e.target.value.replace(/\s/g, '_') })}
          className={`text-xs font-mono border rounded px-2 py-0.5 w-40 focus:outline-none focus:ring-1 ${isDuplicateId ? 'border-red-400 bg-red-50 text-red-700' : 'border-gray-200 text-gray-400'}`}
        />
        {isDuplicateId && (
          <span className="text-xs text-red-500 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> ID כפול
          </span>
        )}
      </div>

      {/* Advanced fields */}
      {showAdvanced && (
        <div className="mt-3 grid grid-cols-1 gap-2 mr-6 border-t pt-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">תיאור (אופציונלי)</label>
            <input
              value={value.description || ''}
              onChange={(e) => onChange({ ...value, description: e.target.value })}
              placeholder="תיאור קצר שיוצג ללקוח"
              className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
              dir="rtl"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">אייקון (שם Lucide או URL)</label>
            <input
              value={value.icon || ''}
              onChange={(e) => onChange({ ...value, icon: e.target.value })}
              placeholder="למשל: door, lock, shield"
              className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">imageOverride — URL לתמונת תצוגה</label>
            <input
              value={value.imageOverride || ''}
              onChange={(e) => onChange({ ...value, imageOverride: e.target.value })}
              placeholder="https://... (מחליף תמונת הדלת בבחירה זו)"
              className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          {groupType === 'color_grid' && (
            <div>
              <label className="text-xs text-gray-500 mb-1 block">קוד צבע (Hex / RAL)</label>
              <div className="flex items-center gap-2">
                <input
                  value={value.colorCode || ''}
                  onChange={(e) => onChange({ ...value, colorCode: e.target.value })}
                  placeholder="#1A1A1A"
                  className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
                <div
                  className="w-8 h-8 rounded-lg border border-gray-300 shrink-0"
                  style={{ backgroundColor: value.colorCode || 'transparent' }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Sub-component: GroupCard ─────────────────────────────────────────────────

function GroupCard({
  group,
  index,
  total,
  allGroups,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  duplicateGroupIds,
  duplicateValueIds,
}: {
  group: AdminOptionGroup;
  index: number;
  total: number;
  allGroups: AdminOptionGroup[];
  onChange: (g: AdminOptionGroup) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  duplicateGroupIds: Set<string>;
  duplicateValueIds: Set<string>;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const isDupGroupId = duplicateGroupIds.has(group.id);

  const updateValue = (vi: number, v: AdminOptionValue) => {
    const values = [...group.values];
    values[vi] = v;
    onChange({ ...group, values });
  };

  const addValue = () => onChange({ ...group, values: [...group.values, newValue()] });

  const removeValue = (vi: number) => {
    if (group.values.length <= 1) return;
    onChange({ ...group, values: group.values.filter((_, i) => i !== vi) });
  };

  const autoId = () => {
    const generated = slugify(group.name);
    onChange({ ...group, id: generated });
  };

  return (
    <div className={`border-2 rounded-xl bg-gray-50 ${isDupGroupId ? 'border-red-400' : 'border-gray-200'}`}>
      {/* Group Header */}
      <div className="flex items-center gap-2 p-3 cursor-pointer" onClick={() => setCollapsed((s) => !s)}>
        <GripVertical className="w-4 h-4 text-gray-300 shrink-0" />

        {/* Step badge */}
        <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0">
          {group.step}
        </span>

        {/* Name */}
        <input
          value={group.name}
          onChange={(e) => onChange({ ...group, name: e.target.value })}
          onClick={(e) => e.stopPropagation()}
          placeholder="שם הקבוצה (למשל: צבע, סוג דלת, שדרוגים)"
          className="flex-1 font-semibold text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
          dir="rtl"
        />

        {/* Type badge */}
        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full border border-blue-100 shrink-0 hidden sm:block">
          {DISPLAY_TYPES.find((t) => t.value === group.type)?.label || group.type}
        </span>

        {/* Required badge */}
        <span className={`text-xs px-2 py-1 rounded-full shrink-0 hidden sm:block ${group.required ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
          {group.required ? 'חובה' : 'אופציונלי'}
        </span>

        {/* Reorder */}
        <div className="flex gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button type="button" onClick={onMoveUp} disabled={index === 0}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 rounded">
            <ChevronUp className="w-4 h-4" />
          </button>
          <button type="button" onClick={onMoveDown} disabled={index === total - 1}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 rounded">
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Remove */}
        <button type="button" onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0">
          <Trash2 className="w-4 h-4" />
        </button>

        <ChevronRight className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${collapsed ? '' : 'rotate-90'}`} />
      </div>

      {/* Group Body */}
      {!collapsed && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-200">

          {/* Row 1: ID + auto-generate */}
          <div className="flex items-center gap-2 pt-3">
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">מזהה קבוצה (ID)</label>
              <div className="flex gap-2">
                <input
                  value={group.id}
                  onChange={(e) => onChange({ ...group, id: e.target.value.replace(/\s/g, '_') })}
                  placeholder="door_type"
                  className={`flex-1 text-xs font-mono border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${isDupGroupId ? 'border-red-400 bg-red-50 text-red-700 focus:ring-red-300' : 'border-gray-200 focus:ring-blue-300'}`}
                />
                <button type="button" onClick={autoId}
                  className="text-xs px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg border border-gray-200 whitespace-nowrap">
                  ⚡ צור אוטומטי
                </button>
              </div>
              {isDupGroupId && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> ID כפול — יש לשנות
                </p>
              )}
            </div>
          </div>

          {/* Row 2: Type + Category + Required */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">סוג תצוגה</label>
              <select
                value={group.type}
                onChange={(e) => onChange({ ...group, type: e.target.value as AdminOptionGroup['type'] })}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                {DISPLAY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">
                {DISPLAY_TYPES.find((t) => t.value === group.type)?.desc}
              </p>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">קטגוריית אדמין</label>
              <select
                value={group.adminCategory}
                onChange={(e) => onChange({ ...group, adminCategory: e.target.value as AdminOptionGroup['adminCategory'] })}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                {ADMIN_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">חובה / אופציונלי</label>
              <div className="flex gap-2 mt-1">
                <button type="button"
                  onClick={() => onChange({ ...group, required: true })}
                  className={`flex-1 py-2 text-xs rounded-lg border font-medium transition-colors ${group.required ? 'bg-red-50 border-red-300 text-red-600' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                  חובה
                </button>
                <button type="button"
                  onClick={() => onChange({ ...group, required: false })}
                  className={`flex-1 py-2 text-xs rounded-lg border font-medium transition-colors ${!group.required ? 'bg-green-50 border-green-300 text-green-600' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                  אופציונלי
                </button>
              </div>
            </div>
          </div>

          {/* Row 3: dependsOn */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              תלות — הצג קבוצה זו רק אם... <span className="text-gray-400">(אופציונלי)</span>
            </label>
            <div className="flex gap-2 flex-wrap">
              <select
                value={group.dependsOn?.groupId || ''}
                onChange={(e) => {
                  if (!e.target.value) {
                    onChange({ ...group, dependsOn: null });
                  } else {
                    onChange({ ...group, dependsOn: { groupId: e.target.value, valueId: group.dependsOn?.valueId || '' } });
                  }
                }}
                className="flex-1 min-w-32 text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <option value="">— ללא תלות —</option>
                {allGroups
                  .filter((g) => g.id !== group.id && g.id)
                  .map((g) => (
                    <option key={g.id} value={g.id}>{g.name || g.id}</option>
                  ))}
              </select>

              {group.dependsOn?.groupId && (
                <>
                  <span className="text-xs text-gray-400 self-center">= ערך:</span>
                  <select
                    value={group.dependsOn?.valueId || ''}
                    onChange={(e) => onChange({ ...group, dependsOn: { ...group.dependsOn!, valueId: e.target.value } })}
                    className="flex-1 min-w-32 text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    <option value="">— בחר ערך —</option>
                    {allGroups
                      .find((g) => g.id === group.dependsOn?.groupId)
                      ?.values.map((v) => (
                        <option key={v.id} value={v.id}>{v.label || v.id}</option>
                      ))}
                  </select>
                </>
              )}
            </div>
            {group.dependsOn?.groupId && (
              <p className="text-xs text-yellow-600 mt-1">
                ⚡ קבוצה זו תוצג רק כאשר הלקוח בוחר את הערך הנבחר בקבוצה "{allGroups.find((g) => g.id === group.dependsOn?.groupId)?.name || group.dependsOn.groupId}"
              </p>
            )}
          </div>

          {/* Values */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-600">
                ערכים ({group.values.length})
              </label>
              {group.type === 'color_grid' && (
                <span className="text-xs text-blue-500">לחץ על עיגול הצבע לבחירת צבע</span>
              )}
            </div>
            <div className="space-y-2">
              {group.values.map((val, vi) => (
                <ValueRow
                  key={val.id + vi}
                  value={val}
                  groupType={group.type}
                  onChange={(v) => updateValue(vi, v)}
                  onRemove={() => removeValue(vi)}
                  canRemove={group.values.length > 1}
                  isDuplicateId={duplicateValueIds.has(`${group.id}::${val.id}`)}
                />
              ))}
            </div>
            <button type="button" onClick={addValue}
              className="mt-2 w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-500 hover:text-blue-600 rounded-lg text-sm transition-colors">
              <Plus className="w-4 h-4" /> הוסף ערך
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface AdminOptionGroupBuilderProps {
  value: AdminOptionGroup[];
  onChange: (groups: AdminOptionGroup[]) => void;
}

export default function AdminOptionGroupBuilder({ value: groups, onChange }: AdminOptionGroupBuilderProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  // ── Validation ──────────────────────────────────────────────────────────────

  const duplicateGroupIds = (() => {
    const seen = new Set<string>();
    const dupes = new Set<string>();
    for (const g of groups) {
      if (g.id && seen.has(g.id)) dupes.add(g.id);
      if (g.id) seen.add(g.id);
    }
    return dupes;
  })();

  const duplicateValueIds = (() => {
    const dupes = new Set<string>();
    for (const g of groups) {
      const seen = new Set<string>();
      for (const v of g.values) {
        const key = `${g.id}::${v.id}`;
        if (v.id && seen.has(v.id)) dupes.add(key);
        if (v.id) seen.add(v.id);
      }
    }
    return dupes;
  })();

  const hasErrors = duplicateGroupIds.size > 0 || duplicateValueIds.size > 0;

  // ── Handlers ────────────────────────────────────────────────────────────────

  const addGroup = useCallback(() => {
    const step = groups.length + 1;
    onChange([...groups, newGroup(step)]);
  }, [groups, onChange]);

  const updateGroup = useCallback((idx: number, g: AdminOptionGroup) => {
    const updated = [...groups];
    updated[idx] = g;
    onChange(updated);
  }, [groups, onChange]);

  const removeGroup = useCallback((idx: number) => {
    const updated = groups.filter((_, i) => i !== idx).map((g, i) => ({ ...g, step: i + 1 }));
    onChange(updated);
  }, [groups, onChange]);

  const moveGroup = useCallback((idx: number, dir: 'up' | 'down') => {
    const updated = [...groups];
    const target = dir === 'up' ? idx - 1 : idx + 1;
    if (target < 0 || target >= updated.length) return;
    [updated[idx], updated[target]] = [updated[target], updated[idx]];
    // Re-number steps
    onChange(updated.map((g, i) => ({ ...g, step: i + 1 })));
  }, [groups, onChange]);

  const copyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(groups, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-gray-800 text-base">⚙️ אפשרויות למוצר</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {groups.length === 0
              ? 'לא הוגדרו אפשרויות — הוסף קבוצה ראשונה'
              : `${groups.length} קבוצות · ${groups.reduce((s, g) => s + g.values.length, 0)} ערכים`}
          </p>
        </div>
        <div className="flex gap-2">
          {groups.length > 0 && (
            <>
              <button type="button" onClick={copyJson}
                className="flex items-center gap-1 text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg border border-gray-200 transition-colors">
                {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                {copied ? 'הועתק!' : 'JSON'}
              </button>
              <button type="button" onClick={() => setShowPreview((s) => !s)}
                className="flex items-center gap-1 text-xs px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg border border-blue-200 transition-colors">
                <Eye className="w-3 h-3" />
                {showPreview ? 'הסתר תצוגה' : 'תצוגה מקדימה'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Validation banner */}
      {hasErrors && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>
            {duplicateGroupIds.size > 0 && `${duplicateGroupIds.size} מזהה קבוצה כפול. `}
            {duplicateValueIds.size > 0 && `${duplicateValueIds.size} מזהה ערך כפול. `}
            יש לתקן לפני שמירה.
          </span>
        </div>
      )}

      {/* Schema Preview */}
      {showPreview && groups.length > 0 && (
        <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
          <p className="text-xs text-gray-400 mb-2 font-mono">// productOptions JSON schema preview</p>
          <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">
            {JSON.stringify(groups, null, 2)}
          </pre>
        </div>
      )}

      {/* Group Cards */}
      <div className="space-y-3">
        {groups.map((group, idx) => (
          <GroupCard
            key={group.id + idx}
            group={group}
            index={idx}
            total={groups.length}
            allGroups={groups}
            onChange={(g) => updateGroup(idx, g)}
            onRemove={() => removeGroup(idx)}
            onMoveUp={() => moveGroup(idx, 'up')}
            onMoveDown={() => moveGroup(idx, 'down')}
            duplicateGroupIds={duplicateGroupIds}
            duplicateValueIds={duplicateValueIds}
          />
        ))}
      </div>

      {/* Add Group Button */}
      <button type="button" onClick={addGroup}
        className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-blue-300 hover:border-blue-500 hover:bg-blue-50 text-blue-500 hover:text-blue-700 rounded-xl text-sm font-medium transition-colors">
        <Plus className="w-5 h-5" />
        הוסף קבוצת אפשרויות
      </button>

      {/* Category summary */}
      {groups.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {ADMIN_CATEGORIES.map((cat) => {
            const count = groups.filter((g) => g.adminCategory === cat.value).length;
            return (
              <div key={cat.value}
                className={`text-center py-2 px-3 rounded-lg border text-xs ${count > 0 ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                <div className="font-semibold">{cat.label}</div>
                <div>{count} קבוצות</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
