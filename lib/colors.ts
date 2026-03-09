export interface ColorOption {
  key: string;
  nameHe: string;
  nameAr: string;
  hex: string;
}

export const PRODUCT_COLORS: ColorOption[] = [
  { key: 'black',  nameHe: 'שחור',  nameAr: 'أسود',  hex: '#000000' },
  { key: 'white',  nameHe: 'לבן',   nameAr: 'أبيض',  hex: '#FFFFFF' },
  { key: 'gray',   nameHe: 'אפור',  nameAr: 'رمادي', hex: '#808080' },
  { key: 'blue',   nameHe: 'כחול',  nameAr: 'أزرق',  hex: '#2563EB' },
  { key: 'red',    nameHe: 'אדום',  nameAr: 'أحمر',  hex: '#DC2626' },
  { key: 'green',  nameHe: 'ירוק',  nameAr: 'أخضر',  hex: '#16A34A' },
  { key: 'yellow', nameHe: 'צהוב',  nameAr: 'أصفر',  hex: '#FACC15' },
  { key: 'orange', nameHe: 'כתום',  nameAr: 'برتقالي', hex: '#F97316' },
  { key: 'brown',  nameHe: 'חום',   nameAr: 'بني',   hex: '#92400E' },
  { key: 'beige',  nameHe: 'בז\'',  nameAr: 'بيج',   hex: '#E5D3B3' },
];

export const DELIVERY_TIME_OPTIONS = [
  { value: 'same_day',    labelAr: 'نفس اليوم',  labelHe: 'אותו יום',  minDays: 0, maxDays: 0 },
  { value: '1_2_days',    labelAr: '1-2 أيام',   labelHe: '1-2 ימים',  minDays: 1, maxDays: 2 },
  { value: '2_3_days',    labelAr: '2-3 أيام',   labelHe: '2-3 ימים',  minDays: 2, maxDays: 3 },
  { value: '3_5_days',    labelAr: '3-5 أيام',   labelHe: '3-5 ימים',  minDays: 3, maxDays: 5 },
  { value: '5_7_days',    labelAr: '5-7 أيام',   labelHe: '5-7 ימים',  minDays: 5, maxDays: 7 },
  { value: '7_10_days',   labelAr: '7-10 أيام',  labelHe: '7-10 ימים', minDays: 7, maxDays: 10 },
];

export function getColorByKey(key: string): ColorOption | undefined {
  return PRODUCT_COLORS.find((c) => c.key === key);
}

export function getDeliveryLabelAr(value: string): string {
  return DELIVERY_TIME_OPTIONS.find((d) => d.value === value)?.labelAr || value;
}

export function getDeliveryLabelHe(value: string): string {
  return DELIVERY_TIME_OPTIONS.find((d) => d.value === value)?.labelHe || value;
}

/**
 * Calculate estimated arrival date range based on delivery time value.
 * Returns a Hebrew-formatted string like "12-13 במרץ" or "היום"
 */
export function getEstimatedArrivalHe(deliveryTimeValue: string): string {
  const opt = DELIVERY_TIME_OPTIONS.find((d) => d.value === deliveryTimeValue);
  if (!opt) return '';

  const today = new Date();

  if (opt.minDays === 0 && opt.maxDays === 0) {
    return 'היום';
  }

  const addDays = (date: Date, days: number): Date => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  };

  const formatDay = (date: Date): string => {
    return date.toLocaleDateString('he-IL', { day: 'numeric', month: 'long' });
  };

  if (opt.minDays === opt.maxDays) {
    return formatDay(addDays(today, opt.minDays));
  }

  const minDate = addDays(today, opt.minDays);
  const maxDate = addDays(today, opt.maxDays);

  // If same month, show "12-14 במרץ"
  if (minDate.getMonth() === maxDate.getMonth()) {
    const minDay = minDate.getDate();
    const maxDay = maxDate.getDate();
    const month = maxDate.toLocaleDateString('he-IL', { month: 'long' });
    return `${minDay}-${maxDay} ב${month}`;
  }

  // Different months
  return `${formatDay(minDate)} - ${formatDay(maxDate)}`;
}
