-- Adiciona campo share_token na tabela operations.
-- Idempotente — pode rodar quantas vezes precisar.

ALTER TABLE "operations"
  ADD COLUMN IF NOT EXISTS "share_token" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "operations_share_token_key"
  ON "operations"("share_token");

SELECT
  (SELECT COUNT(*) FROM information_schema.columns
   WHERE table_name = 'operations' AND column_name = 'share_token') AS coluna_existe;
