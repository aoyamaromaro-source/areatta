'use client';

import { Category, ParsedIngredient, CATEGORY_ICONS, CATEGORY_LABELS } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Props {
  items: ParsedIngredient[];
  onChange: (items: ParsedIngredient[]) => void;
}

const CATEGORIES: Category[] = ['meat', 'dairy', 'vegetable', 'seasoning', 'other'];

export default function ParsedPreview({ items, onChange }: Props) {
  function update(index: number, patch: Partial<ParsedIngredient>) {
    const next = items.map((item, i) => (i === index ? { ...item, ...patch } : item));
    onChange(next);
  }

  function remove(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((item, index) => (
        <div key={index} className="rounded-xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">
              食材 {index + 1}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-destructive"
              onClick={() => remove(index)}
            >
              削除
            </Button>
          </div>
          <div className="flex flex-col gap-2.5">
            <Input
              value={item.name}
              onChange={(e) => update(index, { name: e.target.value })}
              placeholder="食材名"
            />
            <div className="flex gap-2">
              <Input
                value={item.quantity ?? ''}
                onChange={(e) => update(index, { quantity: e.target.value || null })}
                placeholder="数量（例: 500ml）"
              />
              <Input
                type="date"
                value={item.expiry_date ?? ''}
                onChange={(e) => update(index, { expiry_date: e.target.value || null })}
              />
            </div>
            <Select
              value={item.category}
              onValueChange={(v) => update(index, { category: v as Category })}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {CATEGORY_ICONS[c]} {CATEGORY_LABELS[c]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      ))}
    </div>
  );
}
