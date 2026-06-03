-- Migração das operações dos 31 recrutas do CRM antigo.
-- Pré-requisito: migrate-recruits-20260602.sql JÁ rodado.
-- Idempotente: usa WHERE NOT EXISTS por (recruit_id, product_id).
-- Versão CTE — não usa TEMP TABLE (Supabase faz commit por statement).

-- ============================================================
-- 1. Garante o produto "E3 Digital" (não estava no seed original)
-- ============================================================

INSERT INTO products (id, name, archetype, active)
VALUES ('seed-product-e3digital', 'E3 Digital', 'RETAINER', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO stage_templates (id, product_id, name, "order", sla_days)
VALUES ('seed-stage-e3d-1', 'seed-product-e3digital', 'Onboarding', 1, 7)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 2. Insere operações + stages num único CTE compartilhado
-- ============================================================

WITH op_import(recruit_name, product_name, etapa, op_status, started_at) AS (
  VALUES
    ('Jéssica Peixoto',                            'Estruturação', 7, 'ATIVA'::"OperationStatus",     '2026-02-03'::timestamp),
    ('Dhouglas',                                   'Estruturação', 7, 'ATIVA'::"OperationStatus",     '2026-01-23'::timestamp),
    ('Fabiana Pereira',                            'Estruturação', 1, 'ATIVA'::"OperationStatus",     '2026-05-19'::timestamp),
    ('Jonatan Paiva',                              'Estruturação', 5, 'PAUSADA'::"OperationStatus",   '2026-02-25'::timestamp),
    ('Thiago Halley',                              'Estruturação', 7, 'ATIVA'::"OperationStatus",     '2026-03-19'::timestamp),
    ('Igor José Pinto',                            'Estruturação', 6, 'ATIVA'::"OperationStatus",     '2026-02-24'::timestamp),
    ('Albrechete',                                 'Estruturação', 7, 'ATIVA'::"OperationStatus",     '2026-02-10'::timestamp),
    ('Brenda',                                     'Estruturação', 7, 'ATIVA'::"OperationStatus",     '2026-02-22'::timestamp),
    ('Rodrigo Sirahata',                           'Estruturação', 7, 'ATIVA'::"OperationStatus",     '2026-02-03'::timestamp),
    ('Renata Ruban',                               'Estruturação', 7, 'ATIVA'::"OperationStatus",     '2026-02-03'::timestamp),
    ('Mario Chamma',                               'Estruturação', 7, 'ATIVA'::"OperationStatus",     '2026-01-22'::timestamp),
    ('Luiz Maranhão',                              'Estruturação', 6, 'ATIVA'::"OperationStatus",     '2026-02-23'::timestamp),
    ('Ludmilla e Fábio',                           'Estruturação', 7, 'ATIVA'::"OperationStatus",     '2026-03-24'::timestamp),
    ('Isaias Xavier',                              'Estruturação', 7, 'ATIVA'::"OperationStatus",     '2026-05-14'::timestamp),
    ('Daniele',                                    'Estruturação', 6, 'ATIVA'::"OperationStatus",     '2026-03-05'::timestamp),
    ('Ristori Sociedade Individual de Advocacia',  'Estruturação', 4, 'ENCERRADA'::"OperationStatus", '2026-04-27'::timestamp),
    ('Beatriz Vital',                              'Estruturação', 7, 'ATIVA'::"OperationStatus",     '2026-02-09'::timestamp),
    ('Flauber José',                               'Estruturação', 7, 'ATIVA'::"OperationStatus",     '2026-03-11'::timestamp),
    ('Veras e Saraiva',                            'E3 Digital',   1, 'ATIVA'::"OperationStatus",     '2026-05-11'::timestamp),
    ('Pereira da Costa',                           'Estruturação', 6, 'ATIVA'::"OperationStatus",     '2026-03-22'::timestamp),
    ('Rodrigo Campana de Castro',                  'Estruturação', 6, 'ATIVA'::"OperationStatus",     '2026-04-09'::timestamp),
    ('Mendes Advocacia (Cleylton)',                'Estruturação', 6, 'ATIVA'::"OperationStatus",     '2026-03-05'::timestamp),
    ('Ketrin',                                     'Estruturação', 7, 'ATIVA'::"OperationStatus",     '2026-02-08'::timestamp),
    ('Valdir',                                     'Estruturação', 6, 'ATIVA'::"OperationStatus",     '2026-02-09'::timestamp),
    ('Kennedy Lima',                               'Estruturação', 6, 'ATIVA'::"OperationStatus",     '2026-03-03'::timestamp),
    ('Cristiane Valeria',                          'Estruturação', 7, 'ATIVA'::"OperationStatus",     '2026-01-23'::timestamp),
    ('Piovezan',                                   'Estruturação', 6, 'ATIVA'::"OperationStatus",     '2026-02-08'::timestamp),
    ('Marcos Silva',                               'Estruturação', 6, 'ATIVA'::"OperationStatus",     '2026-02-08'::timestamp),
    ('Carla Portela',                              'Estruturação', 6, 'ATIVA'::"OperationStatus",     '2026-02-03'::timestamp),
    ('Livia Barcelos',                             'Estruturação', 7, 'ATIVA'::"OperationStatus",     '2026-02-03'::timestamp),
    ('Giovana',                                    'Estruturação', 7, 'ATIVA'::"OperationStatus",     '2026-02-03'::timestamp),
    ('Thaís Queiroz',                              'Estruturação', 7, 'ATIVA'::"OperationStatus",     '2026-01-25'::timestamp)
),
inserted_ops AS (
  INSERT INTO operations (id, recruit_id, product_id, code_name, status, started_at, ended_at)
  SELECT
    gen_random_uuid()::text,
    r.id,
    p.id,
    'Operação ' || oi.recruit_name,
    oi.op_status,
    oi.started_at,
    CASE
      WHEN oi.op_status = 'ENCERRADA' THEN oi.started_at + interval '30 days'
      ELSE NULL
    END
  FROM op_import oi
  JOIN recruits r ON r.name = oi.recruit_name
  JOIN products p ON p.name = oi.product_name
  WHERE NOT EXISTS (
    SELECT 1 FROM operations o
    WHERE o.recruit_id = r.id AND o.product_id = p.id
  )
  RETURNING id, recruit_id, product_id, status, started_at
)
INSERT INTO operation_stages (id, operation_id, template_id, name, "order", sla_days, status, started_at, completed_at)
SELECT
  gen_random_uuid()::text,
  io.id,
  st.id,
  st.name,
  st."order",
  st.sla_days,
  CASE
    WHEN io.status = 'ENCERRADA' THEN
      CASE WHEN st."order" <= oi.etapa THEN 'CUMPRIDA'::"StageStatus" ELSE 'PENDENTE'::"StageStatus" END
    WHEN oi.etapa > (SELECT COUNT(*) FROM stage_templates WHERE product_id = io.product_id) THEN
      'CUMPRIDA'::"StageStatus"
    WHEN st."order" < oi.etapa THEN 'CUMPRIDA'::"StageStatus"
    WHEN st."order" = oi.etapa THEN 'EM_ANDAMENTO'::"StageStatus"
    ELSE 'PENDENTE'::"StageStatus"
  END,
  CASE
    WHEN st."order" <= LEAST(oi.etapa, (SELECT COUNT(*) FROM stage_templates WHERE product_id = io.product_id)) THEN
      io.started_at + (interval '1 day' * COALESCE((
        SELECT SUM(prev.sla_days)
        FROM stage_templates prev
        WHERE prev.product_id = io.product_id AND prev."order" < st."order"
      ), 0))
    ELSE NULL
  END,
  CASE
    WHEN (
      io.status = 'ENCERRADA' AND st."order" <= oi.etapa
    ) OR (
      io.status != 'ENCERRADA' AND st."order" < oi.etapa
    ) OR (
      oi.etapa > (SELECT COUNT(*) FROM stage_templates WHERE product_id = io.product_id)
    ) THEN
      io.started_at + (interval '1 day' * COALESCE((
        SELECT SUM(prev.sla_days)
        FROM stage_templates prev
        WHERE prev.product_id = io.product_id AND prev."order" <= st."order"
      ), 0))
    ELSE NULL
  END
FROM inserted_ops io
JOIN recruits r ON r.id = io.recruit_id
JOIN op_import oi ON oi.recruit_name = r.name
JOIN stage_templates st ON st.product_id = io.product_id;

-- ============================================================
-- 3. Confere o resultado
-- ============================================================

SELECT
  (SELECT COUNT(*) FROM operations)                                     AS total_operations,
  (SELECT COUNT(*) FROM operations WHERE status = 'ATIVA')              AS ativas,
  (SELECT COUNT(*) FROM operations WHERE status = 'PAUSADA')            AS pausadas,
  (SELECT COUNT(*) FROM operations WHERE status = 'ENCERRADA')          AS encerradas,
  (SELECT COUNT(*) FROM operation_stages)                               AS total_stages,
  (SELECT COUNT(*) FROM operation_stages WHERE status = 'CUMPRIDA')     AS stages_cumpridas,
  (SELECT COUNT(*) FROM operation_stages WHERE status = 'EM_ANDAMENTO') AS stages_em_andamento,
  (SELECT COUNT(*) FROM operation_stages WHERE status = 'PENDENTE')     AS stages_pendentes;
