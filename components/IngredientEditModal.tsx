'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Category, Ingredient, CATEGORY_ICONS, CATEGORY_LABELS } from '@/types';

interface Props {
  ingredient: Ingredient | null;
  open: boolean;
  onClose: () => void;
  onSave: (id: string, patch: Partial<Ingredient>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const CATEGORIES: Category[] = ['meat', 'dairy', 'vegetable', 'seasoning', 'other'];

export default function IngredientEditModal({
  ingredient,
  open,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const [name, setName] = useState(ingredient?.name ?? '');
  const [quantity, setQuantity] = useState(ingredient?.quantity ?? '');
  const [expiryDate, setExpiryDate] = useState(ingredient?.expiry_date ?? '');
  const [category, setCategory] = useState<Category>(ingredient?.category ?? 'other');
  const [note, setNote] = useState(ingredient?.note ?? '');
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!ingredient) return null;

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(ingredient!.id, {
        name,
        quantity: quantity || null,
        expiry_date: expiryDate || null,
        category,
        note: note || null,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setSaving(true);
    try {
      await onDelete(ingredient!.id);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>食材を編集</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-name">食材名</Label>
            <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-quantity">数量</Label>
            <Input
              id="edit-quantity"
              value={quantity}
              placeholder="例: 500ml"
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-expiry">消費期限</Label>
            <Input
              id="edit-expiry"
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>カテゴリ</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
              <SelectTrigger>
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

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-note">メモ</Label>
            <Textarea
              id="edit-note"
              value={note}
              placeholder="例: 開封済み"
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          {confirmingDelete ? (
            <div className="flex w-full gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setConfirmingDelete(false)}
                disabled={saving}
              >
                キャンセル
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleDelete}
                disabled={saving}
              >
                本当に削除する
              </Button>
            </div>
          ) : (
            <>
              <Button onClick={handleSave} disabled={saving || !name.trim()} className="w-full">
                保存
              </Button>
              <Button
                variant="ghost"
                className="w-full text-destructive"
                onClick={() => setConfirmingDelete(true)}
                disabled={saving}
              >
                削除する
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
