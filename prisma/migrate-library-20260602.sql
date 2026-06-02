-- Migração: adiciona Biblioteca (templates/copys/roteiros).
-- Rode no SQL Editor do Supabase.

CREATE TYPE "LibraryCategory" AS ENUM (
  'COPY',
  'ROTEIRO',
  'PROMPT',
  'PROCESSO',
  'ANUNCIO',
  'EMAIL',
  'WHATSAPP',
  'OUTRO'
);

CREATE TABLE "library_items" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "category" "LibraryCategory" NOT NULL DEFAULT 'OUTRO',
  "content" TEXT NOT NULL,
  "tags" TEXT[] NOT NULL DEFAULT '{}',
  "created_by" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "library_items_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "library_items_category_idx" ON "library_items"("category");
CREATE INDEX "library_items_created_at_idx" ON "library_items"("created_at");

ALTER TABLE "library_items"
  ADD CONSTRAINT "library_items_created_by_fkey"
  FOREIGN KEY ("created_by") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Confere
SELECT 'library_items' AS tabela, COUNT(*) AS linhas FROM library_items;
