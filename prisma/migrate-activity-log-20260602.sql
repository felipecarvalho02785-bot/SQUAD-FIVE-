-- Migração: tabela activity_events (log de auditoria persistente).
-- Rode no SQL Editor do Supabase.

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

CREATE TABLE "activity_events" (
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

CREATE INDEX "activity_events_operation_id_created_at_idx"
  ON "activity_events"("operation_id", "created_at" DESC);
CREATE INDEX "activity_events_recruit_id_created_at_idx"
  ON "activity_events"("recruit_id", "created_at" DESC);
CREATE INDEX "activity_events_created_at_idx"
  ON "activity_events"("created_at" DESC);

ALTER TABLE "activity_events"
  ADD CONSTRAINT "activity_events_actor_id_fkey"
  FOREIGN KEY ("actor_id") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "activity_events"
  ADD CONSTRAINT "activity_events_operation_id_fkey"
  FOREIGN KEY ("operation_id") REFERENCES "operations"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "activity_events"
  ADD CONSTRAINT "activity_events_recruit_id_fkey"
  FOREIGN KEY ("recruit_id") REFERENCES "recruits"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

SELECT 'activity_events' AS tabela, COUNT(*) AS linhas FROM activity_events;
