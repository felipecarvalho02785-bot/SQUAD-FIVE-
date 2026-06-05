-- Migração: tabela activity_events (log de auditoria persistente).
-- Idempotente — pode rodar quantas vezes precisar sem erro.

DO $$ BEGIN
  CREATE TYPE "ActivityType" AS ENUM (
    'OPERATION_MOBILIZED',
    'OPERATION_PAUSED',
    'OPERATION_RESUMED',
    'OPERATION_EXTRACTED',
    'STAGE_ADVANCED',
    'STAGE_REGRESSED',
    'BRIEFING_REGISTERED',
    'ORDER_CREATED',
    'ORDER_COMPLETED',
    'ORDER_DELETED',
    'GAP_CREATED',
    'GAP_RESOLVED',
    'RECRUIT_CREATED',
    'RECRUIT_UPDATED',
    'MEMBER_PROMOTED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "activity_events" (
  "id" TEXT NOT NULL,
  "type" "ActivityType" NOT NULL,
  "actor_id" TEXT,
  "operation_id" TEXT,
  "recruit_id" TEXT,
  "payload" JSONB,
  "description" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "activity_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "activity_events_operation_id_created_at_idx"
  ON "activity_events"("operation_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "activity_events_recruit_id_created_at_idx"
  ON "activity_events"("recruit_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "activity_events_created_at_idx"
  ON "activity_events"("created_at" DESC);

DO $$ BEGIN
  ALTER TABLE "activity_events"
    ADD CONSTRAINT "activity_events_actor_id_fkey"
    FOREIGN KEY ("actor_id") REFERENCES "users"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "activity_events"
    ADD CONSTRAINT "activity_events_operation_id_fkey"
    FOREIGN KEY ("operation_id") REFERENCES "operations"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "activity_events"
    ADD CONSTRAINT "activity_events_recruit_id_fkey"
    FOREIGN KEY ("recruit_id") REFERENCES "recruits"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Confere
SELECT
  (SELECT COUNT(*) FROM pg_type WHERE typname = 'ActivityType') AS enum_existe,
  (SELECT COUNT(*) FROM information_schema.tables
   WHERE table_name = 'activity_events') AS tabela_existe,
  (SELECT COUNT(*) FROM activity_events) AS eventos_registrados;
