'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { ParsedIngredient } from '@/types';
import VoiceRecorder from '@/components/VoiceRecorder';
import ParsedPreview from '@/components/ParsedPreview';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

type Stage = 'record' | 'preview';

export default function RegisterPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>('record');
  const [transcript, setTranscript] = useState('');
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState<ParsedIngredient[]>([]);

  function handleFinalTranscript(chunk: string) {
    setTranscript((prev) => (prev ? `${prev} ${chunk}` : chunk));
  }

  async function handleParse() {
    if (!transcript.trim()) return;
    setParsing(true);
    try {
      const res = await fetch('/api/parse-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: transcript }),
      });
      if (!res.ok) throw new Error('parse failed');
      const data = await res.json();
      if (!data.ingredients?.length) {
        toast.error('食材を認識できませんでした。テキストを修正して再度お試しください');
        return;
      }
      setItems(data.ingredients);
      setStage('preview');
    } catch {
      toast.error('解析に失敗しました。テキストを直接編集して保存することもできます');
    } finally {
      setParsing(false);
    }
  }

  async function handleDirectSave() {
    if (!transcript.trim()) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('ingredients').insert({
        name: transcript.trim(),
        quantity: null,
        expiry_date: null,
        category: 'other',
      });
      if (error) throw error;
      toast.success('登録しました');
      resetForNext();
    } catch {
      toast.error('保存に失敗しました');
    } finally {
      setSaving(false);
    }
  }

  async function handleSave() {
    if (items.length === 0) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('ingredients').insert(
        items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          expiry_date: item.expiry_date,
          category: item.category,
        }))
      );
      if (error) throw error;
      toast.success(`${items.length}件を登録しました`);
      resetForNext();
    } catch {
      toast.error('保存に失敗しました');
    } finally {
      setSaving(false);
    }
  }

  function resetForNext() {
    setTranscript('');
    setItems([]);
    setStage('record');
  }

  return (
    <div className="flex flex-col gap-6 px-4 pt-6">
      <header>
        <h1 className="font-serif text-2xl font-bold text-foreground">🎤 音声登録</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          「牛乳500ml期限9月20日」のように読み上げてください
        </p>
      </header>

      {stage === 'record' && (
        <>
          <VoiceRecorder onFinalTranscript={handleFinalTranscript} disabled={parsing} />

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-muted-foreground">
              認識テキスト（直接編集できます）
            </label>
            <Textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="ここに認識結果が表示されます。手入力も可能です"
              rows={5}
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleDirectSave}
              disabled={!transcript.trim() || saving || parsing}
            >
              {saving ? '登録中…' : 'そのまま登録'}
            </Button>
            <Button
              className="flex-1"
              onClick={handleParse}
              disabled={!transcript.trim() || parsing || saving}
              size="lg"
            >
              {parsing ? '解析中…' : 'AI解析して登録'}
            </Button>
          </div>
        </>
      )}

      {stage === 'preview' && (
        <>
          <ParsedPreview items={items} onChange={setItems} />

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setStage('record')}>
              やり直す
            </Button>
            <Button className="flex-1" onClick={handleSave} disabled={saving || items.length === 0}>
              {saving ? '保存中…' : '保存する'}
            </Button>
          </div>

          <Button variant="ghost" onClick={() => router.push('/')}>
            一覧へ戻る
          </Button>
        </>
      )}
    </div>
  );
}
