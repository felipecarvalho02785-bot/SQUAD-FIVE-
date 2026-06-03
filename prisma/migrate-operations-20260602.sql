-- Migração das operações dos 31 recrutas do CRM antigo.
-- Pré-requisitos:
--   - migrate-recruits-20260602.sql JÁ rodado (recrutas existem por nome)
--   - migrate-library-20260602.sql opcional, não bloqueia
-- Idempotente: usa WHERE NOT EXISTS por (recruit_id, product_id).

-- ============================================================
-- 1. Garante o produto "E3 Digital" (não está no seed original)
-- ============================================================

INSERT INTO products (id, name, archetype, active)
VALUES ('seed-product-e3digital', 'E3 Digital', 'RETAINER', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO stage_templates (id, product_id, name, "order", sla_days)
VALUES ('seed-stage-e3d-1', 'seed-product-e3digital', 'Onboarding', 1, 7)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 2. Temp table com dados de cada operação a importar
-- ============================================================

CREATE TEMP TABLE op_import (
  recruit_name text PRIMARY KEY,
  product_name text NOT NULL,
  etapa int NOT NULL,
  op_status "OperationStatus" NOT NULL,
  started_at timestamp NOT NULL
);

INSERT INTO op_import VALUES
  ('Jéssica Peixoto',                            'Estruturação', 7, 'ATIVA',     '2026-02-03'),
  ('Dhouglas',                                   'Estruturação', 7, 'ATIVA',     '2026-01-23'),
  ('Fabiana Pereira',                            'Estruturação', 1, 'ATIVA',     '2026-05-19'),
  ('Jonatan Paiva',                              'Estruturação', 5, 'PAUSADA',   '2026-02-25'),
  ('Thiago Halley',                              'Estruturação', 7, 'ATIVA',     '2026-03-19'),
  ('Igor José Pinto',                            'Estruturação', 6, 'ATIVA',     '2026-02-24'),
  ('Albrechete',                                 'Estruturação', 7, 'ATIVA',     '2026-02-10'),
  ('Brenda',                                     'Estruturação', 7, 'ATIVA',     '2026-02-22'),
  ('Rodrigo Sirahata',                           'Estruturação', 7, 'ATIVA',     '2026-02-03'),
  ('Renata Ruban',                               'Estruturação', 7, 'ATIVA',     '2026-02-03'),
  ('Mario Chamma',                               'Estruturação', 7, 'ATIVA',     '2026-01-22'),
  ('Luiz Maranhão',                              'Estruturação', 6, 'ATIVA',     '2026-02-23'),
  ('Ludmilla e Fábio',                           'Estruturação', 7, 'ATIVA',     '2026-03-24'),
  ('Isaias Xavier',                              'Estruturação', 7, 'ATIVA',     '2026-05-14'),
  ('Daniele',                                    'Estruturação', 6, 'ATIVA',     '2026-03-05'),
  ('Ristori Sociedade Individual de Advocacia',  'Estruturação', 4, 'ENCERRADA', '2026-04-27'),
  ('Beatriz Vital',                              'Estruturação', 7, 'ATIVA',     '2026-02-09'),
  ('Flauber José',                               'Estruturação', 7, 'ATIVA',     '2026-03-11'),
  ('Veras e Saraiva',                            'E3 Digital',   1, 'ATIVA',     '2026-05-11'),
  ('Pereira da Costa',                           'Estruturação', 6, 'ATIVA',     '2026-03-22'),
  ('Rodrigo Campana de Castro',                  'Estruturação', 6, 'ATIVA',     '2026-04-09'),
  ('Mendes Advocacia (Cleylton)',                'Estruturação', 6, 'ATIVA',     '2026-03-05'),
  ('Ketrin',                                     'Estruturação', 7, 'ATIVA',     '2026-02-08'),
  ('Valdir',                                     'Estruturação', 6, 'ATIVA',     '2026-02-09'),
  ('Kennedy Lima',                               'Estruturação', 6, 'ATIVA',     '2026-03-03'),
  ('Cristiane Valeria',                          'Estruturação', 7, 'ATIVA',     '2026-01-23'),
  ('Piovezan',                                   'Estruturação', 6, 'ATIVA',     '2026-02-08'),
  ('Marcos Silva',                               'Estruturação', 6, 'ATIVA',     '2026-02-08'),
  ('Carla Portela',                              'Estruturação', 6, 'ATIVA',     '2026-02-03'),
  ('Livia Barcelos',                             'Estruturação', 7, 'ATIVA',     '2026-02-03'),
  ('Giovana',                                    'Estruturação', 7, 'ATIVA',     '2026-02-03'),
  ('Thaís Queiroz',                              'Estruturação', 7, 'ATIVA',     '2026-01-25');

-- ============================================================
-- 3. Insere as operações (idempotente por recruit + product)
-- ============================================================

WITH inserted_ops AS (
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
-- ============================================================
-- 4. Cria operation_stages clonando os templates do produto.
--    Marca status conforme a coluna "Etapa" do CSV:
--      - Se etapa > total_stages, todas viram CUMPRIDA (op já passou)
--      - Se status = ENCERRADA, stages até etapa viram CUMPRIDA
--      - Caso normal: 1..etapa-1 = CUMPRIDA, etapa = EM_ANDAMENTO, resto PENDENTE
-- ============================================================
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
  -- started_at: aproximado por offset (sla_days acumulado) a partir do início da operação
  CASE
    WHEN st."order" <= LEAST(oi.etapa, (SELECT COUNT(*) FROM stage_templates WHERE product_id = io.product_id)) THEN
      io.started_at + (interval '1 day' * COALESCE((
        SELECT SUM(prev.sla_days)
        FROM stage_templates prev
        WHERE prev.product_id = io.product_id AND prev."order" < st."order"
      ), 0))
    ELSE NULL
  END,
  -- completed_at: só pra etapas já cumpridas (offset do próximo SLA)
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

DROP TABLE op_import;

-- ============================================================
-- 5. Confere o resultado
-- ============================================================

SELECT
  (SELECT COUNT(*) FROM operations)                                   AS total_operations,
  (SELECT COUNT(*) FROM operations WHERE status = 'ATIVA')            AS ativas,
  (SELECT COUNT(*) FROM operations WHERE status = 'PAUSADA')          AS pausadas,
  (SELECT COUNT(*) FROM operations WHERE status = 'ENCERRADA')        AS encerradas,
  (SELECT COUNT(*) FROM operation_stages)                             AS total_stages,
  (SELECT COUNT(*) FROM operation_stages WHERE status = 'CUMPRIDA')   AS stages_cumpridas,
  (SELECT COUNT(*) FROM operation_stages WHERE status = 'EM_ANDAMENTO') AS stages_em_andamento,
  (SELECT COUNT(*) FROM operation_stages WHERE status = 'PENDENTE')   AS stages_pendentes;
