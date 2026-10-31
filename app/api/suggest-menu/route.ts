import { anthropic, MODEL_SUGGEST_MENU } from '@/lib/anthropic';
import { MenuMode, Recipe } from '@/types';

interface RequestIngredient {
  name: string;
  quantity: string | null;
  expiry_date: string | null;
}

function buildSystemPrompt(mode: MenuMode, request?: string) {
  return `あなたは家庭料理の献立アドバイザーです。
冷蔵庫の食材リストを受け取り、実用的なレシピを3〜5品提案してください。

モード: ${mode}
${mode === 'quick' ? '- 期限切れに近い食材を優先的に使うレシピを提案してください' : ''}
${mode === 'request' && request ? `- ユーザーリクエスト: ${request}` : ''}

出力は以下のJSON配列形式のみで返すこと:
[
  {
    "title": "料理名",
    "time_minutes": 調理時間（分・整数）,
    "ingredients_used": ["使用する食材名", ...],
    "steps": ["手順1", "手順2", ...],
    "memo": "一言コメント（任意）"
  }
]`;
}

export async function POST(req: Request) {
  const body = await req.json();
  const mode: MenuMode = body.mode;
  const request: string | undefined = body.request;
  const ingredients: RequestIngredient[] = body.ingredients ?? [];

  if (!mode || ingredients.length === 0) {
    return Response.json({ error: 'mode and ingredients are required' }, { status: 400 });
  }

  try {
    const message = await anthropic.messages.create({
      model: MODEL_SUGGEST_MENU,
      max_tokens: 2048,
      system: buildSystemPrompt(mode, request),
      messages: [{ role: 'user', content: JSON.stringify({ ingredients }) }],
    });

    const content = message.content[0];
    if (content.type !== 'text') throw new Error('Unexpected response');

    const raw = content.text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    const recipes: Recipe[] = JSON.parse(raw);
    return Response.json({ recipes });
  } catch (err) {
    console.error('suggest-menu failed', err);
    return Response.json({ error: '献立提案に失敗しました' }, { status: 500 });
  }
}
