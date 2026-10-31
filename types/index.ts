export type Category = 'meat' | 'dairy' | 'vegetable' | 'seasoning' | 'other';

export interface Ingredient {
  id: string;
  name: string;
  quantity: string | null;
  expiry_date: string | null; // ISO 8601 'YYYY-MM-DD'
  category: Category;
  note: string | null;
  created_at: string;
  updated_at: string;
}

// 音声認識→Claude解析の出力型
export interface ParsedIngredient {
  name: string;
  quantity: string | null;
  expiry_date: string | null; // 'YYYY-MM-DD' or null
  category: Category;
}

export type MenuMode = 'quick' | 'request';

export interface Recipe {
  title: string;
  time_minutes: number;
  ingredients_used: string[];
  steps: string[];
  memo?: string;
}

export const CATEGORY_LABELS: Record<Category, string> = {
  meat: '肉・魚',
  dairy: '乳製品・卵',
  vegetable: '野菜・果物',
  seasoning: '調味料・乾物',
  other: 'その他',
};

export const CATEGORY_ICONS: Record<Category, string> = {
  meat: '🥩',
  dairy: '🥛',
  vegetable: '🥦',
  seasoning: '🧂',
  other: '📦',
};

export const CATEGORY_COLORS: Record<Category, string> = {
  meat: '#C0392B',
  dairy: '#2980B9',
  vegetable: '#27AE60',
  seasoning: '#8E44AD',
  other: '#7F8C8D',
};
