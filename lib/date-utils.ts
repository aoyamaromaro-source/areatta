import { Ingredient } from '@/types';

export type ExpiryGroupKey = 'expired' | 'today' | 'tomorrow' | 'this_week' | 'later' | 'unknown';

export const EXPIRY_GROUP_ORDER: ExpiryGroupKey[] = [
  'expired',
  'today',
  'tomorrow',
  'this_week',
  'later',
  'unknown',
];

export const EXPIRY_GROUP_LABELS: Record<ExpiryGroupKey, string> = {
  expired: '期限切れ',
  today: '今日',
  tomorrow: '明日',
  this_week: '今週',
  later: 'それ以降',
  unknown: '期限不明',
};

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

/** 残り日数。0 = 今日まで、負数 = 期限切れ */
export function daysUntil(expiryDate: string, today: Date = new Date()): number {
  const todayStart = startOfDay(today);
  const expiry = startOfDay(new Date(`${expiryDate}T00:00:00`));
  const diffMs = expiry.getTime() - todayStart.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function expiryGroupOf(ingredient: Ingredient, today: Date = new Date()): ExpiryGroupKey {
  if (!ingredient.expiry_date) return 'unknown';
  const diff = daysUntil(ingredient.expiry_date, today);
  if (diff < 0) return 'expired';
  if (diff === 0) return 'today';
  if (diff === 1) return 'tomorrow';
  if (diff <= 7) return 'this_week';
  return 'later';
}

export function groupIngredientsByExpiry(
  ingredients: Ingredient[],
  today: Date = new Date()
): Record<ExpiryGroupKey, Ingredient[]> {
  const groups: Record<ExpiryGroupKey, Ingredient[]> = {
    expired: [],
    today: [],
    tomorrow: [],
    this_week: [],
    later: [],
    unknown: [],
  };

  for (const ingredient of ingredients) {
    groups[expiryGroupOf(ingredient, today)].push(ingredient);
  }

  for (const key of EXPIRY_GROUP_ORDER) {
    if (key === 'unknown') {
      groups[key].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    } else {
      groups[key].sort((a, b) => (a.expiry_date ?? '').localeCompare(b.expiry_date ?? ''));
    }
  }

  return groups;
}

/** 献立提案用に送る上位N件（期限が近い順、期限不明は末尾） */
export function topExpiringIngredients(ingredients: Ingredient[], limit = 15): Ingredient[] {
  const withExpiry = ingredients.filter((i) => i.expiry_date);
  const withoutExpiry = ingredients.filter((i) => !i.expiry_date);
  withExpiry.sort((a, b) => (a.expiry_date ?? '').localeCompare(b.expiry_date ?? ''));
  return [...withExpiry, ...withoutExpiry].slice(0, limit);
}

export function formatRemainingLabel(diff: number): string {
  if (diff < 0) return `期限切れ ${Math.abs(diff)}日`;
  if (diff === 0) return '今日まで';
  return `あと${diff}日`;
}
