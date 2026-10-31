-- areatta: ingredients テーブル
CREATE TABLE IF NOT EXISTS ingredients (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT         NOT NULL,
  quantity     TEXT,
  expiry_date  DATE,
  category     TEXT         DEFAULT 'other',
  note         TEXT,
  created_at   TIMESTAMPTZ  DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  DEFAULT NOW()
);

-- 消費期限でのソートが多いので index を貼る
CREATE INDEX IF NOT EXISTS idx_ingredients_expiry ON ingredients (expiry_date ASC NULLS LAST);

-- updated_at の自動更新 trigger
CREATE OR REPLACE FUNCTION update_updated_at()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
  $$ language 'plpgsql';

DROP TRIGGER IF EXISTS set_updated_at ON ingredients;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON ingredients
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

-- MVP は個人利用想定のため RLS は無効のままでOK。
-- 公開運用する場合は認証を追加しRLSを有効化すること。
