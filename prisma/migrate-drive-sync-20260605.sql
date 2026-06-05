-- Migração: integração Biblioteca <-> Google Drive.
-- Adiciona campos de origem em library_items + tabela drive_sync_configs.
-- Idempotente.

-- 1) Enum LibrarySource
DO $$ BEGIN
  CREATE TYPE "LibrarySource" AS ENUM ('MANUAL', 'DRIVE');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 2) Campos novos em library_items
ALTER TABLE "library_items"
  ADD COLUMN IF NOT EXISTS "source"            "LibrarySource" NOT NULL DEFAULT 'MANUAL',
  ADD COLUMN IF NOT EXISTS "drive_file_id"     TEXT,
  ADD COLUMN IF NOT EXISTS "drive_url"         TEXT,
  ADD COLUMN IF NOT EXISTS "drive_mime_type"   TEXT,
  ADD COLUMN IF NOT EXISTS "drive_modified_at" TIMESTAMP(3);

-- Unicidade por arquivo Drive (pra upsert idempotente):
CREATE UNIQUE INDEX IF NOT EXISTS "library_items_drive_file_id_key"
  ON "library_items"("drive_file_id");

CREATE INDEX IF NOT EXISTS "library_items_source_idx"
  ON "library_items"("source");

-- 3) Tabela drive_sync_configs
CREATE TABLE IF NOT EXISTS "drive_sync_configs" (
  "id"           TEXT NOT NULL,
  "folder_id"    TEXT NOT NULL,
  "folder_name"  TEXT,
  "folder_url"   TEXT,
  "synced_by"    TEXT NOT NULL,
  "is_active"    BOOLEAN NOT NULL DEFAULT TRUE,
  "last_sync_at" TIMESTAMP(3),
  "last_error"   TEXT,
  "items_synced" INTEGER NOT NULL DEFAULT 0,
  "created_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"   TIMESTAMP(3) NOT NULL,
  CONSTRAINT "drive_sync_configs_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  ALTER TABLE "drive_sync_configs"
    ADD CONSTRAINT "drive_sync_configs_synced_by_fkey"
    FOREIGN KEY ("synced_by") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Confere:
SELECT
  (SELECT COUNT(*) FROM information_schema.tables
    WHERE table_name = 'drive_sync_configs') AS tabela_configs,
  (SELECT COUNT(*) FROM information_schema.columns
    WHERE table_name = 'library_items'
      AND column_name IN ('source','drive_file_id','drive_url','drive_mime_type','drive_modified_at')
  ) AS colunas_novas_library;
