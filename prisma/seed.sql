-- Seed do CRM Squad Five — versao SQL puro
-- Rode no SQL Editor do Supabase APOS aplicar a migration.
-- Cria: 2 usuarios placeholder + 3 produtos + templates de etapas.
--
-- IMPORTANTE: Os usuarios placeholder usam emails fakes (@e3digital.com).
-- O usuario real do squad sera criado automaticamente pelo Auth.js no
-- primeiro login Google. Para promover alguem a ADMIN, rode depois:
--   UPDATE users SET role = 'ADMIN' WHERE email = 'seu@email.com';

-- ============================================================
-- USUARIOS placeholder
-- ============================================================

INSERT INTO "users" (id, name, email, role, created_at)
VALUES
  ('seed-user-admin', 'Comandante Admin', 'admin@e3digital.com', 'ADMIN', NOW()),
  ('seed-user-operator', 'Operador Tático', 'operador@e3digital.com', 'OPERATOR', NOW())
ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- PRODUTOS
-- ============================================================

INSERT INTO "products" (id, name, archetype, typical_duration_days, active)
VALUES
  ('seed-product-estruturacao', 'Estruturação', 'PROJECT',   45,   true),
  ('seed-product-alavancagem',  'Alavancagem',  'RETAINER',  NULL, true),
  ('seed-product-e3light',      'E3 Light',     'RETAINER',  NULL, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- TEMPLATES DE ETAPAS
-- ============================================================
-- SLAs sao placeholders ate o material oficial de onboarding chegar.

INSERT INTO "stage_templates" (id, product_id, name, "order", sla_days)
VALUES
  -- Estruturação (5 etapas, 46 dias)
  ('seed-stage-estr-1', 'seed-product-estruturacao', 'Onboarding',      1, 6),
  ('seed-stage-estr-2', 'seed-product-estruturacao', 'Diagnóstico',     2, 6),
  ('seed-stage-estr-3', 'seed-product-estruturacao', 'Estruturação',    3, 17),
  ('seed-stage-estr-4', 'seed-product-estruturacao', 'Implementação',   4, 12),
  ('seed-stage-estr-5', 'seed-product-estruturacao', 'Acompanhamento',  5, 5),

  -- Alavancagem (retainer — so onboarding inicial)
  ('seed-stage-alav-1', 'seed-product-alavancagem', 'Onboarding inicial', 1, 7),

  -- E3 Light (retainer — onboarding express)
  ('seed-stage-e3l-1',  'seed-product-e3light',     'Onboarding express', 1, 3)
ON CONFLICT (id) DO NOTHING;
