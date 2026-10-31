'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Ingredient } from '@/types';
import { EXPIRY_GROUP_ORDER, groupIngredientsByExpiry } from '@/lib/date-utils';
import IngredientGroup from '@/components/IngredientGroup';
import IngredientEditModal from '@/components/IngredientEditModal';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Ingredient | null>(null);

  const fetchIngredients = useCallback(async () => {
    const { data, error } = await supabase
      .from('ingredients')
      .select('*')
      .order('expiry_date', { ascending: true, nullsFirst: false });

    if (error) {
      toast.error('食材の取得に失敗しました');
      return;
    }
    setIngredients(data as Ingredient[]);
  }, []);

  useEffect(() => {
    // 初回マウント時にSupabaseから取得する。データ取得はEffectの正当な用途。
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchIngredients().finally(() => setLoading(false));
  }, [fetchIngredients]);

  async function handleDelete(ingredient: Ingredient) {
    setIngredients((prev) => prev.filter((i) => i.id !== ingredient.id));
    const { error } = await supabase.from('ingredients').delete().eq('id', ingredient.id);
    if (error) {
      toast.error('削除に失敗しました');
      fetchIngredients();
    } else {
      toast.success(`${ingredient.name} を削除しました`);
    }
  }

  async function handleSave(id: string, patch: Partial<Ingredient>) {
    const { error } = await supabase.from('ingredients').update(patch).eq('id', id);
    if (error) {
      toast.error('更新に失敗しました');
      return;
    }
    toast.success('更新しました');
    fetchIngredients();
  }

  async function handleDeleteFromModal(id: string) {
    const target = ingredients.find((i) => i.id === id);
    setIngredients((prev) => prev.filter((i) => i.id !== id));
    const { error } = await supabase.from('ingredients').delete().eq('id', id);
    if (error) {
      toast.error('削除に失敗しました');
      fetchIngredients();
      return;
    }
    toast.success(`${target?.name ?? '食材'} を削除しました`);
  }

  const groups = groupIngredientsByExpiry(ingredients);

  return (
    <div className="px-4 pt-6">
      <header className="mb-5 flex items-center justify-between">
        <h1 className="font-serif text-2xl font-bold text-foreground">🧊 冷蔵庫</h1>
        <Link href="/register">
          <Button
            size="icon"
            className="h-11 w-11 rounded-full text-xl"
            aria-label="食材を音声登録する"
          >
            ＋
          </Button>
        </Link>
      </header>

      <Link href="/menu" className="mb-6 block">
        <Button
          variant="outline"
          className="w-full justify-center border-primary/30 bg-accent text-accent-foreground"
        >
          🍳 おまかせ献立
        </Button>
      </Link>

      {loading && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      )}

      {!loading && ingredients.length === 0 && (
        <div className="mt-16 text-center text-sm text-muted-foreground">
          まだ食材が登録されていません。
          <br />
          右上の「＋」から音声で登録しましょう。
        </div>
      )}

      {!loading &&
        EXPIRY_GROUP_ORDER.map((key) => (
          <IngredientGroup
            key={key}
            groupKey={key}
            ingredients={groups[key]}
            onTap={setEditing}
            onDelete={handleDelete}
          />
        ))}

      <IngredientEditModal
        key={editing?.id ?? 'none'}
        ingredient={editing}
        open={editing !== null}
        onClose={() => setEditing(null)}
        onSave={handleSave}
        onDelete={handleDeleteFromModal}
      />
    </div>
  );
}
