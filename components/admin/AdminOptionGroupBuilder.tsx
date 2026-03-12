'use client';
import { useState, useCallback, useRef } from 'react';
import {
  Plus, Trash2, ChevronUp, ChevronDown, ChevronRight,
  GripVertical, Image as ImageIcon, Upload, X
} from 'lucide-react';
import { uploadsApi } from '@/lib/api';

// ─── Types (exported — used by page.tsx) ─────────────────────────────────────

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

// ─── Simplified display types for admin ──────────────────────────────────────

const SIMPLE_TYPES = [
  { value: 'single_radio',   label: 'בחירה יחידה',   desc: 'הלקוח בוחר אפשרות אחת' },
  { value: 'multi_checkbox', label: 'בחירה מרובה',   desc: 'הלקוח יכול לבחור כמה אפשרויות' },
  { value: 'color_grid',     label: 'בחירת צבע',     desc: 'לוח צבעים עם גוונים' },
  { value: 'visual_card',    label: 'כרטיסים ויזואליים', desc: 'כרטיסים גדולים עם תמונה' },
] as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2, 9);

/** Generate a stable slug-like ID from a Hebrew/English string */
const makeId = (text: string, fallback?: string): string => {
  // Try to transliterate common Hebrew door terms
  const heMap: Record<string, string> = {
    'צבע': 'color', 'גובה': 'height', 'רוחב': 'width', 'סוג': 'type',
    'דלת': 'door', 'מנעול': 'lock', 'ידית': 'handle', 'זכוכית': 'glass',
    'פנל': 'panel', 'שדרוג': 'upgrade', 'חיפוי': 'cladding', 'פתיחה': 'opening',
    'כיוון': 'direction', 'חומר': 'material', 'גימור': 'finish',
  };
  let slug = text.trim();
  for (const [he, en] of Object.entries(heMap)) {
    slug = slug.replace(new RegExp(he, 'g'), en);
  }
  slug = slug.toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^\w_]/g, '')
    .slice(0, 40);
  return slug || fallback || uid();
};

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

// ─── Tiny inline image uploader for option values ────────────────────────────

function ValueImagePicker({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [showUrl, setShowUrl] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadsApi.uploadImage(file);
      onChange(url);
    } catch {
      // fallback: read as data URL locally
      const reader = new FileReader();
      reader.onload = (e) => onChange(e.target?.result as string);
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      {/* Thumbnail */}
      {value ? (
        <div className="relative w-8 h-8 shrink-0">
          <img src={value} alt="" className="w-8 h-8 rounded object-cover border border-gray-200" />
          <button type="button" onClick={() => onChange('')}
            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center">
            <X className="w-2.5 h-2.5" />
          </button>
        </div>
      ) : (
        <div className="w-8 h-8 rounded border-2 border-dashed border-gray-300 flex items-center justify-center shrink-0 bg-gray-50">
          <ImageIcon className="w-3.5 h-3.5 text-gray-300" />
        </div>
      )}

      {/* Upload button */}
      <button type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="text-xs text-blue-500 hover:text-blue-700 disabled:opacity-50 flex items-center gap-0.5"
        title="העלה תמונה">
        {uploading ? (
          <span className="animate-spin">⏳</span>
        ) : (
          <Upload className="w-3 h-3" />
        )}
      </button>

      {/* URL toggle */}
      <button type="button"
        onClick={() => setShowUrl((s) => !s)}
        className="text-xs text-gray-400 hover:text-gray-600"
        title="הזן URL">
        URL
      </button>

      {/* Hidden file input */}
      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />

      {/* URL input (inline) */}
      {showUrl && (
        <input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://..."
          className="text-xs border border-gray-200 rounded px-2 py-1 w-32 focus:outline-none focus:ring-1 focus:ring-blue-300 font-mono"
          dir="ltr"
        />
      )}
    </div>
  );
}

// ─── ValueRow — simplified ────────────────────────────────────────────────────

function ValueRow({
  value,
  groupType,
  onChange,
  onRemove,
  canRemove,
}: {
  value: AdminOptionValue;
  groupType: AdminOptionGroup['type'];
  onChange: (v: AdminOptionValue) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  return (
    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
      <GripVertical className="w-3.5 h-3.5 text-gray-300 shrink-0" />

      {/* Color swatch — only for color_grid */}
      {groupType === 'color_grid' && (
        <div className="relative shrink-0">
          <div
            className="w-7 h-7 rounded-full border-2 border-gray-300 cursor-pointer overflow-hidden"
            style={{ backgroundColor: value.colorCode || '#cccccc' }}
            title="לחץ לבחירת צבע"
          >
            <input
              type="color"
              value={value.colorCode || '#cccccc'}
              onChange={(e) => onChange({ ...value, colorCode: e.target.value })}
              className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Label */}
      <input
        value={value.label}
        onChange={(e) => onChange({ ...value, label: e.target.value })}
        placeholder="שם האפשרות..."
        className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300 min-w-0"
        dir="rtl"
      />

      {/* Price modifier */}
      <div className="flex items-center gap-1 shrink-0">
        <span className="text-xs text-gray-400 whitespace-nowrap">+₪</span>
        <input
          type="number"
          min={0}
          value={value.priceModifier || ''}
          onChange={(e) => onChange({ ...value, priceModifier: Number(e.target.value) || 0 })}
          placeholder="0"
          className="w-16 text-sm border border-gray-200 rounded-lg px-2 py-1.5 text-center focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
      </div>

      {/* Image picker — for visual_card type */}
      {groupType === 'visual_card' && (
        <ValueImagePicker
          value={value.imageOverride}
          onChange={(url) => onChange({ ...value, imageOverride: url })}
        />
      )}

      {/* Remove */}
      {canRemove && (
        <button type="button" onClick={onRemove}
          className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

// ─── GroupCard — simplified ───────────────────────────────────────────────────

function GroupCard({
  group,
  index,
  total,
  allGroups,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  group: AdminOptionGroup;
  index: number;
  total: number;
  allGroups: AdminOptionGroup[];
  onChange: (g: AdminOptionGroup) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

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

  // Auto-generate ID when name changes
  const handleNameChange = (name: string) => {
    const newId = makeId(name, group.id);
    onChange({ ...group, name, id: newId });
  };

  const typeInfo = SIMPLE_TYPES.find((t) => t.value === group.type);

  return (
    <div className="border-2 border-gray-200 rounded-xl bg-gray-50 overflow-hidden">
      {/* ── Header ── */}
      <div
        className="flex items-center gap-2 p-3 cursor-pointer select-none hover:bg-gray-100 transition-colors"
        onClick={() => setCollapsed((s) => !s)}
      >
        {/* Step badge */}
        <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0">
          {group.step}
        </span>

        {/* Name input */}
        <input
          value={group.name}
          onChange={(e) => handleNameChange(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          placeholder="שם הקבוצה (למשל: צבע, גובה, מנעול...)"
          className="flex-1 font-semibold text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 min-w-0"
          dir="rtl"
        />

        {/* Type badge */}
        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full border border-blue-100 shrink-0 hidden sm:block whitespace-nowrap">
          {typeInfo?.label}
        </span>

        {/* Required badge */}
        <span className={`text-xs px-2 py-1 rounded-full shrink-0 hidden sm:block whitespace-nowrap ${group.required ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
          {group.required ? 'חובה' : 'אופציונלי'}
        </span>

        {/* Values count */}
        <span className="text-xs text-gray-400 shrink-0 hidden md:block">
          {group.values.length} אפשרויות
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

      {/* ── Body ── */}
      {!collapsed && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-200 pt-4">

          {/* Row 1: Type + Required */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">סוג בחירה</label>
              <div className="grid grid-cols-2 gap-1.5">
                {SIMPLE_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => onChange({ ...group, type: t.value as AdminOptionGroup['type'] })}
                    className={`text-xs py-2 px-2 rounded-lg border font-medium transition-colors text-center leading-tight ${
                      group.type === t.value
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                    title={t.desc}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1.5">{typeInfo?.desc}</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">חובה / אופציונלי</label>
              <div className="flex gap-2">
                <button type="button"
                  onClick={() => onChange({ ...group, required: true })}
                  className={`flex-1 py-2.5 text-sm rounded-lg border font-medium transition-colors ${
                    group.required ? 'bg-red-50 border-red-300 text-red-600' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}>
                  חובה
                </button>
                <button type="button"
                  onClick={() => onChange({ ...group, required: false })}
                  className={`flex-1 py-2.5 text-sm rounded-lg border font-medium transition-colors ${
                    !group.required ? 'bg-green-50 border-green-300 text-green-600' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}>
                  אופציונלי
                </button>
              </div>

              {/* Step number */}
              <div className="mt-3">
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">מספר שלב</label>
                <input
                  type="number"
                  min={1}
                  value={group.step}
                  onChange={(e) => onChange({ ...group, step: Number(e.target.value) || index + 1 })}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
            </div>
          </div>

          {/* Row 2: Conditional display (depends on) — simplified */}
          {allGroups.filter((g) => g.id !== group.id && g.id && g.name).length > 0 && (
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                הצג קבוצה זו רק אם... <span className="text-gray-400 font-normal">(אופציונלי)</span>
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
                  className="flex-1 min-w-0 text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  <option value="">— ללא תנאי —</option>
                  {allGroups
                    .filter((g) => g.id !== group.id && g.id && g.name)
                    .map((g) => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                </select>

                {group.dependsOn?.groupId && (
                  <select
                    value={group.dependsOn?.valueId || ''}
                    onChange={(e) => onChange({ ...group, dependsOn: { ...group.dependsOn!, valueId: e.target.value } })}
                    className="flex-1 min-w-0 text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    <option value="">— בחר ערך —</option>
                    {allGroups
                      .find((g) => g.id === group.dependsOn?.groupId)
                      ?.values.filter((v) => v.label)
                      .map((v) => (
                        <option key={v.id} value={v.id}>{v.label}</option>
                      ))}
                  </select>
                )}
              </div>
              {group.dependsOn?.groupId && (
                <p className="text-xs text-amber-600 mt-1">
                  ⚡ קבוצה זו תוצג רק כאשר הלקוח בחר ב"{allGroups.find((g) => g.id === group.dependsOn?.groupId)?.name}"
                </p>
              )}
            </div>
          )}

          {/* Row 3: Values */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-600">
                אפשרויות ({group.values.length})
              </label>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                {group.type === 'color_grid' && <span>לחץ על עיגול הצבע לבחירה</span>}
                {group.type === 'visual_card' && <span>ניתן להוסיף תמונה לכל אפשרות</span>}
                <span className="font-medium text-gray-500">שם</span>
                <span className="font-medium text-gray-500 ml-8">תוספת מחיר</span>
                {group.type === 'visual_card' && <span className="font-medium text-gray-500">תמונה</span>}
              </div>
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
                />
              ))}
            </div>
            <button type="button" onClick={addValue}
              className="mt-2 w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-500 hover:text-blue-600 rounded-lg text-sm transition-colors">
              <Plus className="w-4 h-4" /> הוסף אפשרות
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
    onChange(updated.map((g, i) => ({ ...g, step: i + 1 })));
  }, [groups, onChange]);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-gray-800 text-base">שלבי הקונפיגורטור</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {groups.length === 0
              ? 'הוסף שלב ראשון — לדוגמה: סוג דלת, גובה, צבע, מנעול'
              : `${groups.length} שלבים · ${groups.reduce((s, g) => s + g.values.length, 0)} אפשרויות`}
          </p>
        </div>
      </div>

      {/* Empty state */}
      {groups.length === 0 && (
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center bg-gray-50">
          <div className="text-4xl mb-3">🚪</div>
          <p className="text-gray-500 text-sm font-medium mb-1">אין שלבי קונפיגורציה עדיין</p>
          <p className="text-gray-400 text-xs mb-4">
            הוסף שלבים כמו: סוג דלת, גובה, צבע חיצוני, צבע פנימי, מנעול, ידית...
          </p>
          <button type="button" onClick={addGroup}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />
            הוסף שלב ראשון
          </button>
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
          />
        ))}
      </div>

      {/* Add Group Button */}
      {groups.length > 0 && (
        <button type="button" onClick={addGroup}
          className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-blue-300 hover:border-blue-500 hover:bg-blue-50 text-blue-500 hover:text-blue-700 rounded-xl text-sm font-medium transition-colors">
          <Plus className="w-5 h-5" />
          הוסף שלב נוסף
        </button>
      )}
    </div>
  );
}
