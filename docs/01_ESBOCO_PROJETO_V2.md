# CRM Squad Five — Esboço do Projeto v2

> Documento mestre do projeto. Substitui a v1.
> Versão: 0.2 · Última atualização: 28/mai/2026

---

## 1. Visão geral

O **CRM Squad Five** é a ferramenta interna do Squad Five (E3 Digital) para gerenciar o onboarding e a evolução das operações de marketing, vendas e presença digital contratadas pelos clientes da agência. Substitui a gestão atual via planilhas + ClickUp + grupos de WhatsApp.

**Princípio norteador:** qualquer membro do squad abre o sistema na segunda de manhã e, em 30 segundos, sabe quais recrutas precisa atender hoje e em que estado cada um está.

**Identidade do produto:** militar/tática, com nomenclatura própria (recrutas, operações, briefings, pelotões, baixas) e estética jungle/cobre/preto-combate. A identidade não é decoração — é cultura interna do squad embutida na ferramenta.

---

## 2. Glossário oficial

Para garantir consistência entre código, UI, documentação e comunicação interna:

| Termo militar | Significa |
|---|---|
| **Recruta** | Cliente |
| **Novo Recruta** | Cliente recém-fechado entrando no sistema |
| **Operação** | Projeto/jornada de um recruta em um produto |
| **Pelotão** | Time interno (Conteúdo, Ads, Atendimento, etc.) |
| **Briefing** | Reunião com o recruta |
| **Ordem do dia** | Tarefa |
| **D-day** | Prazo da tarefa ou da etapa |
| **Em campo** | Status saudável (verde) |
| **Atenção** | Status amarelo |
| **Baixa iminente** | Cliente em risco (vermelho) |
| **Extração** | Operação pausada ou encerrada |
| **Missão cumprida** | Tarefa ou etapa concluída |
| **Comando Central** | Dashboard principal |
| **Painel de Pelotão** | Kanban de operações |
| **Quartel General** | Configurações do sistema |

---

## 3. Premissas confirmadas

- ✅ Ferramenta 100% interna ao squad (5 pessoas: 2 gestores de projeto, 1 gestor de tráfego, 1 account manager, +1 — você)
- ✅ Login via Google (Gmail executivo)
- ✅ Executores externos (entregas de social media, CRM, IA etc.) **não logam** — ficam como campo "responsável pela entrega" nas tarefas
- ✅ Carteira: 40-60 recrutas ativos simultâneos
- ✅ Comunicação com cliente final continua fora do sistema (WhatsApp)
- ✅ Caminho A (custom do zero, integração com ClickUp API só na fase 2)
- ✅ Dev solo: você + Claude Code

---

## 4. Personas e papéis

Dois roles no MVP:

**Gestor (admin)**
- Cadastra/edita recrutas e operações
- Configura templates de etapas por produto
- Gerencia membros do squad
- Tem acesso ao Comando Central completo
- Pode ver e mexer em qualquer operação

**Operador (membro)**
- Vê todas as operações (acompanhamento de perto é cultura do squad)
- Atua nas operações onde tem tarefas atribuídas
- Registra briefings, ordens do dia, comentários
- Pode marcar etapas como cumpridas

> No MVP, qualquer membro do squad pode cadastrar/editar recruta e mexer em templates. Permissões granulares por pelotão ficam pra fase 2.

---

## 5. Produtos da E3 e arquétipos de operação

A E3 vende **três produtos**, e o sistema precisa lidar com **dois arquétipos** distintos:

### Arquétipo A — Operação com D-day (projeto)
Tem início, fim e etapas sequenciais com SLA.

| Produto | Duração | Etapas (a confirmar) |
|---|---|---|
| **Estruturação** | 45 dias | Onboarding → Diagnóstico → Estruturação → Implementação → Acompanhamento |

### Arquétipo B — Operação contínua (retainer)
Contrato com período definido, mas sem etapas obrigatórias. Foco em entregas recorrentes, briefings semanais/quinzenais e métricas.

| Produto | Duração típica | Foco |
|---|---|---|
| **Alavancagem** | 6-12 meses | Acompanhamento contínuo de tráfego e resultados |
| **E3 Light** | 3-6 meses | Versão enxuta do acompanhamento |

### Cross/upsell
Um recruta tem **uma ficha única**. Quando contrata novo produto (ex: E3 Light → Estruturação), uma **nova operação** é criada vinculada à mesma ficha. O histórico de operações fica visível na ficha do recruta.

---

## 6. Escopo do MVP

### Dentro
- Cadastro de recrutas (ficha completa)
- Operações por arquétipo (projeto com etapas vs retainer contínuo)
- Templates configuráveis de etapas e SLA por produto
- Ordens do dia (tarefas) com responsável, D-day e status
- Painel de Pelotão (kanban de operações)
- Comando Central (dashboard) com KPIs, baixas iminentes, briefings da semana
- "Minhas ordens" — visão pessoal por membro
- Registro de briefings com NPS pós-reunião
- Sistema de gaps (pontos de atenção, manuais e automáticos)
- Alertas dentro do sistema (sino + central de notificações)
- Tarefas internas do squad (área separada das operações)
- Login Google SSO
- Indicador de saúde da operação (em campo / atenção / baixa iminente)

### Fora (fase 2)
- Integração com ClickUp via API
- Integração com Google Calendar (briefings)
- Integração com WhatsApp
- Relatórios e gráficos avançados (entram via fase 1.5 conforme demanda real)
- Permissões granulares por pelotão
- App mobile nativo
- Faturamento, contratos, documentos
- Comentários em tarefas individuais (só na operação no MVP)
- Notificações por email/push

---

## 7. Pipeline de etapas por produto

Etapas oficiais ainda dependem do material de onboarding da E3 (a ser enviado). Estrutura inicial proposta:

**Estruturação (45 dias)**
1. Onboarding (5-7 dias) — coleta de acessos, contexto, briefing inicial
2. Diagnóstico (5-7 dias) — análise da operação atual
3. Estruturação (15-20 dias) — definição de estratégia, processos
4. Implementação (10-15 dias) — execução das ações estruturadas
5. Acompanhamento (5 dias) — entrega + monitoramento inicial

**Alavancagem (contínuo)**
- Onboarding inicial (7 dias)
- Operação contínua: ciclos quinzenais com briefing + métricas + ajustes

**E3 Light (contínuo)**
- Onboarding express (3 dias)
- Operação contínua: ciclos mensais com briefing + acompanhamento básico

> SLAs e checklists de cada etapa serão preenchidos a partir do material de onboarding.

---

## 8. Requisitos funcionais

### 8.1 Autenticação
- RF01 — Login via Google (Gmail da E3)
- RF02 — Reconhecimento de role (admin/operador)
- RF03 — Admin gerencia membros do squad

### 8.2 Recrutas (clientes)
- RF04 — Cadastro de recruta com: nome, contato (email/telefone), segmento, orçamento de campanhas, acessos, teses, observações
- RF05 — Ficha única do recruta com histórico de todas as operações dele
- RF06 — Lista de recrutas com filtros (status, produto ativo, responsável)
- RF07 — Status do recruta: ativo, pausado, baixa

### 8.3 Operações
- RF08 — Criar operação a partir de um recruta, escolhendo o produto
- RF09 — Operação herda o template de etapas do produto
- RF10 — Detalhe da operação: identidade, jornada, ordens do dia, briefings, gaps, histórico
- RF11 — Indicador de saúde calculado automaticamente (em campo / atenção / baixa iminente)
- RF12 — Operações contínuas (Alavancagem/E3 Light) não têm etapas obrigatórias mas têm ciclos recorrentes

### 8.4 Templates de etapas
- RF13 — Admin configura template por produto (etapas, ordem, SLA)
- RF14 — Alterar template no futuro não afeta operações já existentes (mantém histórico)

### 8.5 Ordens do dia (tarefas)
- RF15 — Criar ordem com título, descrição, responsável (membro do squad ou executor externo), D-day, etapa vinculada
- RF16 — Status: a fazer, em andamento, cumprida
- RF17 — Subtarefas/checklist dentro de uma ordem (opcional, simples)
- RF18 — Ordens recorrentes (semanal, quinzenal, mensal) — usado em retainers e tarefas internas
- RF19 — Múltiplos responsáveis possíveis (mas um principal)

### 8.6 Painel de Pelotão (Kanban)
- RF20 — Visualização de todas as operações em colunas por etapa
- RF21 — Filtro por: responsável, produto, status de saúde
- RF22 — Drag & drop entre colunas avança a etapa da operação (com confirmação)

### 8.7 Comando Central (dashboard)
- RF23 — KPIs: operações ativas, recrutas novos, baixas iminentes, briefings hoje
- RF24 — Lista de baixas iminentes
- RF25 — Briefings da semana
- RF26 — Gaps em aberto
- RF27 — Atividade recente do squad

### 8.8 Briefings (reuniões)
- RF28 — Registrar briefing: data, presentes, anotações, NPS pós-reunião
- RF29 — Ordens (tarefas) geradas a partir do briefing vão direto pra operação
- RF30 — Histórico de briefings por operação e por recruta

### 8.9 Gaps (pontos de atenção)
- RF31 — Detecção automática: ordem atrasada, etapa SLA estourado, recruta sem briefing há X dias
- RF32 — Criação manual: qualquer membro do squad pode marcar um gap
- RF33 — Status: aberto, em tratamento, resolvido

### 8.10 Alertas internos
- RF34 — Central de notificações no sistema (sino no topbar)
- RF35 — Disparos: D-day estourando, baixa iminente, briefing em 15 min, nova ordem atribuída

### 8.11 Tarefas internas do squad
- RF36 — Área separada para tarefas que não pertencem a nenhuma operação (rotinas do squad, processos internos)
- RF37 — Mesma estrutura de ordens (responsável, D-day, recorrência)

### 8.12 NPS
- RF38 — Registro do NPS pós-briefing (1-10)
- RF39 — Histórico de NPS por recruta (linha do tempo)
- RF40 — NPS mensal agregado por produto e por responsável

---

## 9. Modelo de dados

Entidades principais (Postgres). Tipos sugeridos.

### USERS
| Campo | Tipo | Nota |
|---|---|---|
| id | uuid PK | |
| name | string | |
| email | string | único, Gmail E3 |
| role | enum | admin · operator |
| avatar_url | string | opcional |
| created_at | timestamp | |

### RECRUITS (recrutas/clientes)
| Campo | Tipo | Nota |
|---|---|---|
| id | uuid PK | |
| name | string | nome do recruta |
| contact_name | string | |
| contact_email | string | |
| contact_phone | string | |
| segment | string | segmento de negócio |
| campaign_budget | decimal | orçamento de campanhas |
| accesses | jsonb | acessos (login, plataformas) |
| theses | text | teses que o recruta vai trabalhar |
| notes | text | observações |
| status | enum | ativo · pausado · baixa |
| created_at | timestamp | |

### PRODUCTS (catálogo)
| Campo | Tipo | Nota |
|---|---|---|
| id | uuid PK | |
| name | string | Estruturação · Alavancagem · E3 Light |
| archetype | enum | project · retainer |
| typical_duration_days | int | nulo para retainer |
| active | bool | |

### STAGE_TEMPLATES (template de etapa por produto)
| Campo | Tipo | Nota |
|---|---|---|
| id | uuid PK | |
| product_id | uuid FK | |
| name | string | |
| order | int | |
| sla_days | int | |

### OPERATIONS (operação ativa)
| Campo | Tipo | Nota |
|---|---|---|
| id | uuid PK | |
| recruit_id | uuid FK | |
| product_id | uuid FK | |
| code_name | string | "Operação Maternidade" |
| owner_id | uuid FK → users | gestor responsável |
| status | enum | em_campo · atenção · baixa_iminente · extração |
| started_at | date | |
| target_end_at | date | nulo para retainer |
| ended_at | date | |

### OPERATION_STAGES (instância de etapa)
| Campo | Tipo | Nota |
|---|---|---|
| id | uuid PK | |
| operation_id | uuid FK | |
| template_id | uuid FK | snapshot do template |
| name | string | snapshot |
| order | int | |
| sla_days | int | |
| status | enum | pendente · em_andamento · cumprida |
| started_at | timestamp | |
| completed_at | timestamp | |

### ORDERS (ordens do dia / tarefas)
| Campo | Tipo | Nota |
|---|---|---|
| id | uuid PK | |
| operation_stage_id | uuid FK | nulo para tarefas internas |
| squad_task | bool | true se é tarefa interna do squad |
| title | string | |
| description | text | |
| assignee_id | uuid FK → users | responsável principal (squad) |
| external_assignee | string | executor externo (nome simples) |
| status | enum | a_fazer · em_andamento · cumprida |
| due_date | date | |
| recurring | jsonb | regra de recorrência |
| completed_at | timestamp | |

### BRIEFINGS
| Campo | Tipo | Nota |
|---|---|---|
| id | uuid PK | |
| operation_id | uuid FK | |
| date | timestamp | |
| duration_min | int | |
| attendees | jsonb | lista de membros + flag "+ recruta" |
| notes | text | |
| nps_score | int | 0-10 |
| created_by | uuid FK → users | |

### GAPS (pontos de atenção)
| Campo | Tipo | Nota |
|---|---|---|
| id | uuid PK | |
| operation_id | uuid FK | |
| source | enum | automatic · manual |
| type | enum | task_overdue · stage_sla · no_briefing · approval_pending · manual |
| description | string | |
| status | enum | aberto · em_tratamento · resolvido |
| created_by | uuid FK → users | nulo se automático |
| resolved_at | timestamp | |

### NOTIFICATIONS
| Campo | Tipo | Nota |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK | destinatário |
| type | enum | order_due · order_assigned · operation_risk · briefing_soon · gap_open |
| payload | jsonb | dados contextuais |
| read | bool | |
| created_at | timestamp | |

---

## 10. Regras de negócio

### 10.1 Cálculo de saúde da operação
A cor de status é calculada a cada acesso e a cada mudança relevante:

- 🟢 **EM CAMPO** — nenhuma ordem atrasada E etapa atual dentro do SLA (ou sem SLA)
- 🟡 **ATENÇÃO** — alguma ordem vencendo em ≤ 2 dias OU SLA estourando em ≤ 2 dias
- 🔴 **BAIXA IMINENTE** — uma ou mais ordens vencidas OU SLA estourado
- ⚫ **EXTRAÇÃO** — operação pausada ou encerrada

### 10.2 Geração de gaps automáticos
Sistema cria gaps automaticamente nestes casos:
- Ordem atrasada há ≥ 1 dia (tipo: task_overdue)
- SLA da etapa estourado (tipo: stage_sla)
- Recruta sem briefing há mais que o ciclo esperado +3 dias (tipo: no_briefing)
- Ordem em status "aprovação pendente" há ≥ 3 dias (tipo: approval_pending)

Gaps automáticos podem ser resolvidos manualmente pelo squad.

### 10.3 Avanço de etapa
Ao marcar etapa como cumprida:
- Sistema marca `completed_at` na etapa
- Próxima etapa muda para `em_andamento` com `started_at = now()`
- Notificação para o owner da operação
- Histórico registrado

### 10.4 Cross/upsell
Quando recruta contrata novo produto:
- Nova operação criada vinculada à ficha existente
- Histórico anterior preservado e visível na ficha
- Operações concorrentes podem rodar em paralelo

### 10.5 NPS
- Coletado a cada briefing (campo obrigatório no registro)
- NPS mensal do recruta = média dos briefings do mês
- NPS do produto = média de todos recrutas no produto no período

---

## 11. Arquitetura e stack

| Camada | Escolha | Por quê |
|---|---|---|
| Framework | **Next.js 15** (App Router) + TypeScript | Front + back no mesmo código |
| Banco | **PostgreSQL** (Supabase) | Relacional, hosting grátis decente, auth incluída |
| ORM | **Prisma** | Type-safe, migrations limpas |
| Auth | **Auth.js v5** + Google provider | SSO com Workspace |
| UI | **shadcn/ui + Tailwind** customizado | Componentes prontos, customizáveis pra brand militar |
| Animações | **CSS keyframes** + **Motion (Framer Motion)** quando precisa de gestura | Performance, simplicidade |
| Deploy | **Vercel** | Staging + produção integrados |
| Erros | **Sentry** | Observabilidade |
| Uso | **PostHog** | Entender adoção do squad |

**Custo estimado:** R$ 0 nos primeiros meses, escalando pra ~R$ 80-150/mês quando passar do tier grátis.

---

## 12. Mapa de telas

| # | Tela | Quem usa | Frequência |
|---|---|---|---|
| 1 | Acesso (login) | Todos | 1x/dia |
| 2 | Comando Central (dashboard) | Todos | Várias x/dia |
| 3 | Lista de Recrutas | Todos | 2-3x/dia |
| 4 | Ficha do Recruta | Todos | Várias x/dia |
| 5 | Operação (detalhe) | Todos | A mais usada |
| 6 | Painel de Pelotão (kanban) | Gestores principalmente | 1-2x/dia |
| 7 | Minhas Ordens | Todos | Várias x/dia |
| 8 | Novo Briefing | Todos | Após cada reunião |
| 9 | Histórico de Briefings | Gestores | Quinzenal |
| 10 | Quartel General (config) | Admin | Raro, mas crítico |
| 11 | Tarefas do Squad (internas) | Todos | Diária |
| 12 | 404 / Erro | Todos | Esperançosamente nunca |

---

## 13. Estratégia de identidade visual (3 tiers)

A imersão na identidade militar/selva é calibrada pela frequência de uso da tela:

**Tier 1 — Imersivo (Login, 404, marcos de comemoração)**
Animações completas, mascote em evidência, ambiente rico. Pode investir 4-8h de dev por tela. Aplicado em ~5 telas no MVP.

**Tier 2 — Ambiente (cards, hovers, status indicators, ícones)**
Detalhes sutis: bordas com textura "esculpida", ícones temáticos, hover com micro-animação de vinha, status com ícones próprios. ~1-2h por componente.

**Tier 3 — Background (sempre presente)**
Textura de camuflagem digital com 3-5% opacidade no fundo, tipografia Oswald em displays, paleta da brand. Sem distração da leitura.

Detalhes técnicos no documento `SISTEMA_DESIGN.md`.

---

## 14. Roadmap solo dev + Claude Code

Estimativa realista assumindo ~10-15h/semana de dedicação consistente. Sprint = 1 semana.

### Fase 1 — Fundação (Sprint 1-2)
- Setup do repo, Next.js, TS, Tailwind, Prisma, Auth.js
- Schema do banco no Supabase
- Login Google funcionando
- Layout base (topbar, navegação, dark theme com brand)
- Sistema de design implementado (cores, tipografia, componentes core)

**Marco:** consegue logar e navegar entre telas vazias com a brand aplicada.

### Fase 2 — Recrutas e Operações (Sprint 3-4)
- CRUD de recrutas
- CRUD de operações vinculadas
- Templates de etapas por produto
- Ficha do recruta + detalhe da operação
- Lista de recrutas com filtros

**Marco:** dá pra cadastrar todos os 40-60 recrutas atuais.

### Fase 3 — Ordens, Painel e Briefings (Sprint 5-6)
- Ordens do dia (CRUD + status)
- Painel de Pelotão (kanban)
- "Minhas Ordens"
- Registro de briefing + NPS
- Tarefas internas do squad

**Marco:** dia a dia do squad já roda no sistema.

### Fase 4 — Dashboard, Gaps e Alertas (Sprint 7)
- Comando Central com KPIs
- Cálculo de saúde da operação
- Sistema de gaps (auto + manual)
- Central de notificações

**Marco:** dashboard com informação real.

### Fase 5 — Polimento e Imersão (Sprint 8)
- Telas Tier 1 (login imersivo, 404, marcos)
- Microinterações Tier 2
- Bug bash com o squad
- Migração de dados das planilhas atuais

**Marco:** sistema pronto pra substituir as planilhas.

**Total estimado:** 8 sprints = ~8 semanas de calendário (~80-120h de dev).

---

## 15. Riscos e mitigações

| Risco | Impacto | Mitigação |
|---|---|---|
| Etapas reais da Estruturação ainda não definidas | Trava Fase 2 | Material de onboarding precisa chegar antes do Sprint 3 |
| Solo dev cansa antes de terminar | Sistema fica meio pronto | Sprints curtos com marcos visíveis dão dopamina |
| Squad resiste ao novo sistema | Baixa adoção | Treinamento + migração de dados feita pelo próprio gestor (você) |
| Escopo crescendo (integrações etc.) | MVP nunca lança | "Fora do MVP" é lei. Lança primeiro, integra depois |
| Identidade fica brincadeira em vez de profissional | Squad debocha do sistema | Manual de Voz e Tom guia o equilíbrio |

---

## 16. Próximos passos

1. **Você organiza** o material de onboarding + contratos dos 3 produtos
2. **Eu reescrevo** a seção 7 (etapas) com os dados reais
3. **Você inicia** o Claude Code com o briefing (ver `CLAUDE_CODE_BRIEFING.md`)
4. **Sprint 1** começa: setup + design system

---

## Documentos relacionados

- `MANUAL_VOZ_E_TOM.md` — léxico oficial e copy guidelines
- `SISTEMA_DESIGN.md` — paleta, tipografia, componentes, animações
- `CLAUDE_CODE_BRIEFING.md` — contexto compacto pro Claude Code começar
