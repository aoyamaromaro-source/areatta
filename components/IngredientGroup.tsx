'use client';

import { Ingredient } from '@/types';
import { ExpiryGroupKey, EXPIRY_GROUP_LABELS } from '@/lib/date-utils';
import IngredientCard from './IngredientCard';
import { cn } from '@/lib/utils';

interface Props {
  groupKey: ExpiryGroupKey;
  ingredients: Ingredient[];
  onTap: (ingredient: Ingredient) => void;
  onDelete: (ingredient: Ingredient) => void;
}

const GROUP_HEADER_STYLES: Record<ExpiryGroupKey, string> = {
  expired: 'text-destructive',
  today: 'text-[#C46B1A]',
  tomorrow: 'text-[#B08B1A]',
  this_week: 'text-foreground',
  later: 'text-muted-foreground',
  unknown: 'text-muted-foreground',
};

export default function IngredientGroup({ groupKey, ingredients, onTap, onDelete }: Props) {
  if (ingredients.length === 0) return null;

  return (
    <section className="mb-5">
      <h2 className={cn('mb-2 px-1 text-sm font-semibold', GROUP_HEADER_STYLES[groupKey])}>
        {EXPIRY_GROUP_LABELS[groupKey]}
        <span className="ml-1.5 text-xs font-normal text-muted-foreground">
          {ingredients.length}
        </span>
      </h2>
      <div className="flex flex-col gap-2">
        {ingredients.map((ingredient) => (
          <IngredientCard
            key={ingredient.id}
            ingredient={ingredient}
            onTap={onTap}
            onDelete={onDelete}
          />
        ))}
      </div>
    </section>
  );
}
