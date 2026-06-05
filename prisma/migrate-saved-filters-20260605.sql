-- Saved filters (round 10): persistência de filtros por usuário no /operacoes e /recrutas.
-- Idempotente — pode rodar quantas vezes precisar.

DO $$ BEGIN
  CREATE TYPE "SavedFilterScope" AS ENUM ('OPERATIONS', 'RECRUITS');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "saved_filters" (
  "id"         TEXT NOT NULL,
  "user_id"    TEXT NOT NULL,
  "scope"      "SavedFilterScope" NOT NULL,
  "name"       TEXT NOT NULL,
  "params"     TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "saved_filters_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  ALTER TABLE "saved_filters"
    ADD CONSTRAINT "saved_filters_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS "saved_filters_user_scope_idx"
  ON "saved_filters"("user_id", "scope", "created_at");

-- Verificação rápida:
-- SELECT 1 AS tabela_existe FROM information_schema.tables
-- WHERE table_name = 'saved_filters';
