'use client';

import { Recipe } from '@/types';
import { Badge } from '@/components/ui/badge';

interface Props {
  recipe: Recipe;
  availableIngredients: string[];
}

export default function RecipeCard({ recipe, availableIngredients }: Props) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="font-serif text-lg font-bold text-foreground">{recipe.title}</h3>
        <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
          ⏱ {recipe.time_minutes}分
        </span>
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {recipe.ingredients_used.map((name) => (
          <Badge
            key={name}
            variant="secondary"
            className={
              availableIngredients.includes(name)
                ? 'bg-accent text-accent-foreground'
                : undefined
            }
          >
            {name}
          </Badge>
        ))}
      </div>

      <ol className="flex flex-col gap-1.5 text-sm text-secondary-foreground">
        {recipe.steps.map((step, i) => (
          <li key={i} className="flex gap-2">
            <span className="shrink-0 font-semibold text-primary">{i + 1}.</span>
            <span className="text-muted-foreground">{step}</span>
          </li>
        ))}
      </ol>

      {recipe.memo && (
        <p className="mt-3 border-t border-border pt-2 text-xs text-muted-foreground italic">
          💬 {recipe.memo}
        </p>
      )}
    </div>
  );
}
