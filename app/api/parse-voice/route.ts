import { anthropic, MODEL_PARSE_VOICE } from '@/lib/anthropic';
import { ParsedIngredient } from '@/types';

function buildSystemPrompt(today: string, currentYear: number) {
  return `あなたは冷蔵庫の食材管理アシスタントです。
ユーザーが読み上げた音声テキストから、食材情報を抽出してJSONを返してください。

出力は必ず以下のJSON配列形式のみで返すこと。説明文は不要。

[
  {
    "name": "食材名（必須）",
    "quantity": "数量と単位（不明なら null）",
    "expiry_date": "消費期限 YYYY-MM-DD形式（不明なら null）",
    "category": "meat|dairy|vegetable|seasoning|other のいずれか"
  }
]

ルール:
- 期限が「9月20日」などの場合、現在年（${currentYear}年）として補完する
- 「明日」「来週」などの相対日付は今日（${today}）を基準に変換する
- 数量が不明でも name が取れれば登録する
- 複数食材が混在している場合はすべて抽出する`;
}

export async function POST(req: Request) {
  const { text } = await req.json();

  if (!text || typeof text !== 'string' || !text.trim()) {
    return Response.json({ error: 'text is required' }, { status: 400 });
  }

  const today = new Date().toISOString().split('T')[0];
  const currentYear = new Date().getFullYear();

  try {
    const message = await anthropic.messages.create({
      model: MODEL_PARSE_VOICE,
      max_tokens: 1024,
      system: buildSystemPrompt(today, currentYear),
      messages: [{ role: 'user', content: text }],
    });

    const content = message.content[0];
    if (content.type !== 'text') throw new Error('Unexpected response');

    const raw = content.text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed: ParsedIngredient[] = JSON.parse(raw);
    return Response.json({ ingredients: parsed });
  } catch (err) {
    console.error('parse-voice failed', err);
    return Response.json({ error: '解析に失敗しました' }, { status: 500 });
  }
}
