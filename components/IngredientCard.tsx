'use client';

import { useRef, useState } from 'react';
import { Ingredient, CATEGORY_ICONS, CATEGORY_COLORS } from '@/types';
import { daysUntil, formatRemainingLabel } from '@/lib/date-utils';
import { cn } from '@/lib/utils';

interface Props {
  ingredient: Ingredient;
  onTap: (ingredient: Ingredient) => void;
  onDelete: (ingredient: Ingredient) => void;
}

const SWIPE_THRESHOLD = 72;

export default function IngredientCard({ ingredient, onTap, onDelete }: Props) {
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef<number | null>(null);
  const moved = useRef(false);

  const diff = ingredient.expiry_date ? daysUntil(ingredient.expiry_date) : null;
  const isExpired = diff !== null && diff < 0;
  const isUrgent = diff !== null && diff <= 1 && diff >= 0;

  function handlePointerDown(e: React.PointerEvent) {
    startX.current = e.clientX;
    moved.current = false;
    setDragging(true);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (startX.current === null) return;
    const delta = e.clientX - startX.current;
    if (Math.abs(delta) > 4) moved.current = true;
    const clamped = Math.max(-120, Math.min(120, delta));
    setDragX(clamped);
  }

  function handlePointerUp() {
    setDragging(false);
    if (Math.abs(dragX) >= SWIPE_THRESHOLD) {
      onDelete(ingredient);
    }
    setDragX(0);
    startX.current = null;
  }

  function handleClick() {
    if (!moved.current) onTap(ingredient);
  }

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* 背景アクション表示 */}
      <div className="absolute inset-0 flex items-center justify-between px-5 text-sm font-semibold text-white">
        <span className="bg-good flex h-full items-center rounded-l-xl pl-4" style={{ background: 'var(--primary)' }}>
          使い切り
        </span>
        <span className="flex h-full items-center rounded-r-xl pr-4" style={{ background: 'var(--destructive)' }}>
          削除
        </span>
      </div>

      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={handleClick}
        style={{ transform: `translateX(${dragX}px)` }}
        className={cn(
          'relative flex min-h-[44px] cursor-pointer items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 select-none',
          !dragging && 'transition-transform duration-150'
        )}
      >
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg"
          style={{ background: `${CATEGORY_COLORS[ingredient.category]}1A` }}
        >
          {CATEGORY_ICONS[ingredient.category]}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium text-foreground">{ingredient.name}</div>
          <div className="truncate text-xs text-muted-foreground">
            {ingredient.quantity ?? '数量不明'}
            {ingredient.note ? ` ・ ${ingredient.note}` : ''}
          </div>
        </div>
        <div
          className={cn(
            'shrink-0 rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap',
            isExpired && 'bg-destructive/10 text-destructive',
            isUrgent && 'bg-warn/10',
            !isExpired && !isUrgent && 'bg-muted text-muted-foreground'
          )}
          style={isUrgent ? { color: '#C46B1A', background: '#FDF0E5' } : undefined}
        >
          {diff !== null ? formatRemainingLabel(diff) : '期限不明'}
        </div>
      </div>
    </div>
  );
}
