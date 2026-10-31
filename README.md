# areatta — 冷蔵庫 食材・消費期限 管理アプリ

声で入れる、期限で見る、献立に活かす。シンプルに日々の冷蔵庫管理を解決するWebアプリ（MVP）。

仕様書: `areatta-spec.html`

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Supabase プロジェクトを作成

1. https://supabase.com でプロジェクトを新規作成
2. SQL Editor で `supabase/schema.sql` の内容を実行し、`ingredients` テーブルを作成
3. プロジェクトの Settings → API から `Project URL` と `anon public key` を取得

### 3. Anthropic API キーを取得

https://console.anthropic.com でAPIキーを発行する（音声解析・献立提案に使用）

### 4. 環境変数を設定

`.env.local.example` をコピーして `.env.local` を作成し、値を埋める。

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
ANTHROPIC_API_KEY=sk-ant-...
```

### 5. 開発サーバー起動

```bash
npm run dev
```

http://localhost:3000 を開く。音声入力（Web Speech API）はブラウザのマイク許可が必要なため、`localhost` または HTTPS 環境でのみ動作します。

## 画面構成

| 画面 | パス | 内容 |
|---|---|---|
| 冷蔵庫一覧 (S1) | `/` | 消費期限順の一覧。タップで編集モーダル、スワイプで削除 |
| 音声登録 (S2) | `/register` | マイクで読み上げ→Claude Haikuで解析→確認・保存 |
| 献立提案 (S3) | `/menu` | 期限優先 or リクエスト優先でClaude Sonnetがレシピ提案 |

## 技術スタック

- Next.js (App Router) / TypeScript
- Tailwind CSS v4 + shadcn/ui
- Supabase (PostgreSQL)
- Anthropic SDK (`@anthropic-ai/sdk`)
- Web Speech API（音声認識、ブラウザ標準）

## デプロイ

Vercel にデプロイする場合は、上記3つの環境変数をプロジェクト設定の Environment Variables に登録してください。

```bash
vercel deploy
```
