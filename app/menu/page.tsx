'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Ingredient, MenuMode, Recipe } from '@/types';
import { topExpiringIngredients } from '@/lib/date-utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import RecipeCard from '@/components/RecipeCard';
import { cn } from '@/lib/utils';

export default function MenuPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [mode, setMode] = useState<MenuMode>('quick');
  const [request, setRequest] = useState('');
  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[] | null>(null);

  useEffect(() => {
    supabase
      .from('ingredients')
      .select('*')
      .then(({ data }) => setIngredients((data as Ingredient[]) ?? []));
  }, []);

  async function handleSuggest() {
    const candidates = topExpiringIngredients(ingredients, 15);
    if (candidates.length === 0) {
      toast.error('冷蔵庫に食材が登録されていません');
      return;
    }
    if (mode === 'request' && !request.trim()) {
      toast.error('食べたいものを入力してください');
      return;
    }

    setLoading(true);
    setRecipes(null);
    try {
      const res = await fetch('/api/suggest-menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          request: mode === 'request' ? request : undefined,
          ingredients: candidates.map((i) => ({
            name: i.name,
            quantity: i.quantity,
            expiry_date: i.expiry_date,
          })),
        }),
      });
      if (!res.ok) throw new Error('suggest failed');
      const data = await res.json();
      setRecipes(data.recipes);
    } catch {
      toast.error('献立の提案に失敗しました');
    } finally {
      setLoading(false);
    }
  }

  const availableNames = ingredients.map((i) => i.name);

  return (
    <div className="flex flex-col gap-5 px-4 pt-6">
      <header>
        <h1 className="font-serif text-2xl font-bold text-foreground">🍳 献立提案</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          冷蔵庫の食材からAIがレシピを提案します
        </p>
      </header>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode('quick')}
          className={cn(
            'min-h-[44px] flex-1 rounded-lg border px-3 text-sm font-semibold transition-colors',
            mode === 'quick'
              ? 'border-primary bg-accent text-accent-foreground'
              : 'border-border bg-card text-muted-foreground'
          )}
        >
          早く使いたい順
        </button>
        <button
          type="button"
          onClick={() => setMode('request')}
          className={cn(
            'min-h-[44px] flex-1 rounded-lg border px-3 text-sm font-semibold transition-colors',
            mode === 'request'
              ? 'border-primary bg-accent text-accent-foreground'
              : 'border-border bg-card text-muted-foreground'
          )}
        >
          食べたいもの優先
        </button>
      </div>

      {mode === 'request' && (
        <Textarea
          value={request}
          onChange={(e) => setRequest(e.target.value)}
          placeholder="例: 今日は煮物系が食べたい"
          rows={2}
        />
      )}

      <Button onClick={handleSuggest} disabled={loading} size="lg">
        {loading ? '提案を作成中…' : '提案を出す'}
      </Button>

      {loading && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      )}

      {!loading && recipes && (
        <div className="flex flex-col gap-3">
          {recipes.map((recipe, i) => (
            <RecipeCard key={i} recipe={recipe} availableIngredients={availableNames} />
          ))}
        </div>
      )}
    </div>
  );
}
