-- Migração dos 31 recrutas do CRM antigo (export 2026-06-02).
-- Rode no SQL Editor do Supabase.
-- Idempotente em nome via WHERE NOT EXISTS — pode rodar 2x sem duplicar.

INSERT INTO recruits (id, name, contact_name, contact_email, contact_phone, segment, notes, status, created_at)
SELECT
  id,
  name,
  contact_name,
  contact_email,
  contact_phone,
  segment,
  notes,
  status::"RecruitStatus",
  created_at
FROM (VALUES
  (gen_random_uuid()::text, 'Jéssica Peixoto', NULL, NULL, NULL, NULL,
   E'Projeto iniciado em 03/02/2026. Cronograma atrasado.\n\nMelhorias: Cronograma atrasado. Mapear causa raiz e definir plano de recuperação.',
   'ATIVO', '2026-04-22 18:11:32+00'::timestamptz),

  (gen_random_uuid()::text, 'Dhouglas', NULL, NULL, NULL, NULL,
   E'Projeto iniciado em 23/01/2026. DETRATOR/CRISE — cronograma atrasado, cliente desalinhado.\n\nMelhorias: Cliente sem disponibilidade e desalinhado. Definir cadência mínima de reuniões com o cliente',
   'ATIVO', '2026-04-22 18:11:32+00'::timestamptz),

  (gen_random_uuid()::text, 'Fabiana Pereira', NULL, NULL, '+55 48 99156-8111',
   'Direito Imobiliário (Desapropriações) - Previdenciário.',
   E'Atuação: Escritório consolidado em Santa Catarina, focado em causas de desapropriação e regularização de imóveis. Atuam 100% no êxito, assumindo o risco técnico da operação.\nGargalo: Dependência do "trabalho manual" e visitas presenciais. Dificuldade em ser assertivo em regiões distantes (como o Oeste Catarinense) sem presença física.\nPúblico-Alvo: Proprietários de terras, geralmente acima de 50-60 anos, ou seus herdeiros/filhos (decisores digitais).\nMomento: Dra. Fabiana busca profissionalizar o comercial e o marketing para ter previsibilidade de receita e escala nacional.',
   'ATIVO', '2026-05-19 15:02:28+00'::timestamptz),

  (gen_random_uuid()::text, 'Jonatan Paiva', NULL, NULL, NULL, NULL,
   E'Projeto iniciado em 25/02/2026. DETRATOR/CRISE — cronograma atrasado, projeto pausado - a cliente fez a contratação da Social Media da E3 - estamos mantendo follow''s com o cliente para conseguir ter um panorama do retorno ao projeto.\n\nMelhorias: Projeto pausado aguardando decisão sobre CRM+IA. Agendar call executiva para destravar e formalizar próximos passos.',
   'PAUSADO', '2026-04-22 18:11:32+00'::timestamptz),

  (gen_random_uuid()::text, 'Thiago Halley', NULL, NULL, NULL, NULL,
   E'Projeto iniciado em 19/03/2026. NEUTRO — cronograma adiantado 1 semana, cliente exigente mas satisfeito.\n\nMelhorias: Cliente exigente. Reforçar comunicação proativa e detalhar resultados em cada call.',
   'ATIVO', '2026-04-22 18:11:32+00'::timestamptz),

  (gen_random_uuid()::text, 'Igor José Pinto', NULL, NULL, NULL, NULL,
   E'Projeto iniciado em 24/02/2026. DETRATOR/CRISE — cronograma atrasado, cliente insatisfeito e pouco participativo.\n\nMelhorias: Cliente desalinhado, foco apenas em tráfego. Realinhar escopo, justificar etapas estruturais e cobrar preenchimento de dados - em relação as campanhas, mudamos a estratégia que estávamos utilizando para Formulário, buscando uma melhor qualificação dos leads e melhores resultados.',
   'ATIVO', '2026-04-22 18:11:32+00'::timestamptz),

  (gen_random_uuid()::text, 'Albrechete', NULL, NULL, NULL, NULL,
   E'Projeto iniciado em 10/02/2026. DETRATOR/CRISE — atraso por questões internas, cliente satisfeito e consciente.\n\nAtualização 30/04/2026 - O cliente vai rodar Tiktok Ads com a nossa empresa e está tratando sobre a questão do Google meu negocio com Venicius\n\nMelhorias: Atraso por direcionamentos internos da Squad 5. Priorizar plano de recuperação interno — cliente está engajado.',
   'ATIVO', '2026-04-22 18:11:32+00'::timestamptz),

  (gen_random_uuid()::text, 'Brenda', NULL, NULL, NULL, NULL,
   E'Projeto iniciado em 22/02/2026. Cronograma atrasado - a cliente é pouca participativa no projeto, não interagi muito\n\nMelhorias: Cronograma atrasado. Mapear causa raiz e definir plano de recuperação.',
   'ATIVO', '2026-04-22 18:11:32+00'::timestamptz),

  (gen_random_uuid()::text, 'Rodrigo Sirahata', NULL, NULL, NULL, NULL,
   E'Projeto iniciado em 03/02/2026. Cronograma atrasado.\n\nMelhorias: Cronograma atrasado - mudamos a estratégia da campanha para Formulário com o intuito de conseguirmos melhor qualificação dos Leads',
   'ATIVO', '2026-04-22 18:11:32+00'::timestamptz),

  (gen_random_uuid()::text, 'Renata Ruban', NULL, NULL, NULL, NULL,
   E'Projeto iniciado em 03/02/2026. Cronograma atrasado.\n\nMelhorias: Cronograma atrasado. Mapear causa raiz e definir plano de recuperação.',
   'ATIVO', '2026-04-22 18:11:32+00'::timestamptz),

  (gen_random_uuid()::text, 'Mario Chamma', NULL, NULL, NULL, NULL,
   E'Projeto iniciado em 22/01/2026. NEUTRO — cronograma atrasado, cliente exigente, bom relacionamento.\n\nMelhorias: Mudamos a estratégia da campanha para uma melhor qualificação dos Leads [ Formulário ]',
   'ATIVO', '2026-04-22 18:11:32+00'::timestamptz),

  (gen_random_uuid()::text, 'Luiz Maranhão', NULL, NULL, NULL, NULL,
   E'Projeto iniciado em 23/02/2026. DETRATOR/CRISE — cronograma atrasado, cliente exigente, comunicação agressiva.\n\nMelhorias: Comunicação agressiva e foco apenas em resultado. Realinhar expectativas, justificar metodologia e propor sponsor sênior na conta.',
   'ATIVO', '2026-04-22 18:11:32+00'::timestamptz),

  (gen_random_uuid()::text, 'Ludmilla e Fábio', NULL, NULL, NULL, NULL,
   E'Projeto iniciado em 24/03/2026. SAUDÁVEL — cronograma adiantado 2 semanas, clientes satisfeitos.\n\nMelhorias: Aguardando envio de roteiros para gravação. Manter ritmo e clareza nas próximas etapas.',
   'ATIVO', '2026-04-22 18:11:32+00'::timestamptz),

  (gen_random_uuid()::text, 'Isaias Xavier', NULL, NULL, '41 99138-9824',
   'Previdenciário',
   'Cliente ausente em boa parte do projeto',
   'ATIVO', '2026-05-14 14:14:56+00'::timestamptz),

  (gen_random_uuid()::text, 'Daniele', NULL, NULL, NULL, NULL,
   E'Projeto iniciado em 05/03/2026. NEUTRO — cronograma atrasado por causa da demora do envio do material criativo por parte da cliente, a cliente tambem está com um Gap em relação a BM para anunciar ( ela está com a conta restringida ), Gap esse no qual estamos solucionado já\n\nMelhorias: Cliente exigente buscando resultados rápidos.',
   'ATIVO', '2026-04-22 18:11:32+00'::timestamptz),

  (gen_random_uuid()::text, 'Ristori Sociedade Individual de Advocacia', NULL, NULL, NULL,
   'PREV - TRIBUTARIO - EMPRESARIAL',
   'Cliente está seguindo um cronograma diferente a nível de entrega com base nos principais pontos de melhoria interno',
   'BAIXA', '2026-04-27 12:21:11+00'::timestamptz),

  (gen_random_uuid()::text, 'Beatriz Vital', NULL, NULL, NULL, NULL,
   E'Projeto iniciado em 09/02/2026. DETRATORA/CRISE — cronograma totalmente atrasado por falta de retorno da cliente.\n\nMelhorias: Baixíssima participação. Formalizar status do projeto, registrar responsabilidades e propor replanejamento de cronograma.',
   'ATIVO', '2026-04-22 18:11:32+00'::timestamptz),

  (gen_random_uuid()::text, 'Flauber José', NULL, NULL, NULL, NULL,
   E'Projeto iniciado em 11/03/2026. SAUDÁVEL — cronograma adiantado, cliente alinhado e satisfeito.\n\nMelhorias: Cliente totalmente alinhado. Aproveitar momento para antecipar próximas entregas estratégicas',
   'ATIVO', '2026-04-22 18:11:32+00'::timestamptz),

  (gen_random_uuid()::text, 'Veras e Saraiva', NULL, NULL, NULL,
   'Trabalhista e previdenciário',
   NULL,
   'ATIVO', '2026-05-11 17:57:40+00'::timestamptz),

  (gen_random_uuid()::text, 'Pereira da Costa', NULL, NULL, NULL, NULL,
   E'Projeto iniciado em 22/03/2026. SAUDÁVEL — cronograma adiantado 1 semana, pendência de IA e desalinhamento interno.\n\nMelhorias: Resolver desalinhamentos internos do cliente - BM Bloqueada, repassamos para o cliente a possibilidade da aquisição de uma nova BM para que possamos dar continuidade ao projeto, pois sem a BM não conseguimos anunciar',
   'ATIVO', '2026-04-22 18:11:32+00'::timestamptz),

  (gen_random_uuid()::text, 'Rodrigo Campana de Castro', NULL, NULL, NULL, NULL,
   E'Projeto iniciado em 09/04/2026. SAUDÁVEL — cronograma adiantado, cliente satisfeito.\n\nMelhorias: Cronograma 1 semana adiantado. Manter ritmo e aproveitar engajamento para acelerar entregas estratégicas.',
   'ATIVO', '2026-04-22 18:11:32+00'::timestamptz),

  (gen_random_uuid()::text, 'Mendes Advocacia (Cleylton)', NULL, NULL, NULL, NULL,
   E'Projeto iniciado em 05/03/2026. NEUTRO — cronograma atrasado, satisfeito com entrega e relacionamento.\n\nMelhorias: Cliente não participa do grupo. Reforçar canal de comunicação e definir cadência de check-ins obrigatórios.',
   'ATIVO', '2026-04-22 18:11:32+00'::timestamptz),

  (gen_random_uuid()::text, 'Ketrin', NULL, NULL, NULL, NULL,
   E'Projeto iniciado em 08/02/2026. DETRATOR/CRISE — cronograma atrasado, cliente neutra, ciente do atraso.\n\nMelhorias: Histórico de baixa disponibilidade e período pausado. Definir agenda fixa de reuniões e formalizar replanejamento.',
   'ATIVO', '2026-04-22 18:11:32+00'::timestamptz),

  (gen_random_uuid()::text, 'Valdir', NULL, NULL, NULL, NULL,
   E'Projeto iniciado em 09/02/2026. NEUTRO — cronograma atrasado, satisfeito com a equipe mas demora na entrega de vídeos.\n\nMelhorias: Cliente instável na participação. Acelerar produção/aprovação de vídeos conforme roteiros enviados.',
   'ATIVO', '2026-04-22 18:11:32+00'::timestamptz),

  (gen_random_uuid()::text, 'Kennedy Lima', NULL, NULL, NULL, NULL,
   E'Projeto iniciado em 03/03/2026 - Estamos na fase de Auditoria Criativa, agendei a reunião com o cliente, estou aguardando somente a confirmação\n\nMelhorias: Cliente não-participativo, ausente no onboarding.',
   'ATIVO', '2026-04-22 18:11:32+00'::timestamptz),

  (gen_random_uuid()::text, 'Cristiane Valeria', NULL, NULL, NULL, NULL,
   E'Projeto iniciado em 23/01/2026. Cronograma atrasado.\n\nMelhorias: Cronograma atrasado. Mapear causa raiz e definir plano de recuperação.',
   'ATIVO', '2026-04-22 18:11:32+00'::timestamptz),

  (gen_random_uuid()::text, 'Piovezan', NULL, NULL, NULL, NULL,
   E'Projeto iniciado em 08/02/2026. DETRATOR/CRISE — cronograma atrasado, muitas alterações.\n\nMelhorias: Comunicação intermediada por Simone. Muitas alterações e atraso no material. Centralizar approvals e congelar escopo.',
   'ATIVO', '2026-04-22 18:11:32+00'::timestamptz),

  (gen_random_uuid()::text, 'Marcos Silva', NULL, NULL, NULL, NULL,
   E'Projeto iniciado em 08/02/2026. NEUTRO — cronograma atrasado, cliente não engajado.\n\nMelhorias: Atraso no envio de material para campanhas.',
   'ATIVO', '2026-04-22 18:11:32+00'::timestamptz),

  (gen_random_uuid()::text, 'Carla Portela', NULL, NULL, NULL, NULL,
   E'Projeto iniciado em 03/02/2026. NEUTRO — cronograma atrasado, mudança de tese.\n\nMelhorias: Cliente em mudança de tese + atraso interno de entregas. Realinhar tese e priorizar pendências internas.',
   'ATIVO', '2026-04-22 18:11:32+00'::timestamptz),

  (gen_random_uuid()::text, 'Livia Barcelos', NULL, NULL, NULL, NULL,
   E'Projeto iniciado em 03/02/2026. NEUTRO — cronograma atrasado por questões internas, cliente satisfeita com comunicação.\n\nMelhorias: Atraso por entregas internas Squad 5 não solucionadas. Priorizar resolução interna e comunicar plano de recuperação.',
   'ATIVO', '2026-04-22 18:11:32+00'::timestamptz),

  (gen_random_uuid()::text, 'Giovana', NULL, NULL, NULL, NULL,
   E'Projeto iniciado em 03/02/2026. NEUTRO — cronograma atrasado por questões internas, cliente satisfeita.\n12/05/2026 - Realizada reunião com Jared referente a monetização da Loom. Aquisição não realizada, pois já fez plano anual na Guimo, ainda vai rescindir. Deseja investir em tráfego o valor que seria da Guimo.\n\nMelhorias: Atraso por entregas internas. Priorizar resolução e manter o bom relacionamento.',
   'ATIVO', '2026-04-22 18:11:32+00'::timestamptz),

  (gen_random_uuid()::text, 'Thaís Queiroz', NULL, NULL, NULL, NULL,
   E'Projeto iniciado em 25/01/2026. Cronograma atrasado.\n\nMelhorias: Cronograma atrasado. Mapear causa raiz e definir plano de recuperação. A cliente tem dificuldade para gravar os roteiros e como se posicionar na frente da câmera',
   'ATIVO', '2026-04-22 18:11:32+00'::timestamptz)
) AS new_recruits(id, name, contact_name, contact_email, contact_phone, segment, notes, status, created_at)
WHERE NOT EXISTS (
  SELECT 1 FROM recruits WHERE recruits.name = new_recruits.name
);

-- Confere o resultado
SELECT COUNT(*) AS total_recrutas, status FROM recruits GROUP BY status;
