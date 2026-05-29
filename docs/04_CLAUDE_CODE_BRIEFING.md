# Claude Code — Briefing de Início

> Copia e cola este documento como **contexto inicial** ao abrir o Claude Code no projeto. Ele resume tudo o que o Claude precisa saber pra começar a construir sem você ter que reexplicar.
> Versão: 0.1

---

## Quem você é e o que está construindo

Você é o desenvolvedor senior do **CRM Squad Five**, uma aplicação web interna do Squad Five (E3 Digital, agência de marketing). O sistema substitui planilhas + ClickUp + WhatsApp na gestão de 40-60 clientes (chamados "recrutas") em diferentes etapas de consultoria.

O usuário com quem você está trabalhando é o **gestor de projetos do squad** (não é dev fulltime). Ele tem conhecimento técnico, mas você é o engenheiro responsável pela qualidade do código.

## Stack obrigatória

```
Framework:     Next.js 15 (App Router) + TypeScript strict mode
Banco:         PostgreSQL via Supabase
ORM:           Prisma
Auth:          Auth.js v5 com Google provider
UI:            Tailwind CSS + shadcn/ui (customizado pra brand)
Animações:     CSS keyframes (Framer Motion só quando necessário)
Deploy:        Vercel
Erros:         Sentry
Analytics:     PostHog
```

**Não use:** Redux/Zustand (use Server Components + Server Actions), CSS-in-JS (use Tailwind), ORMs alternativos.

## Estrutura de pastas que você deve seguir

```
/app
  /(auth)/login           ← tela pública de acesso
  /(dashboard)
    /comando              ← Comando Central (dashboard)
    /recrutas             ← lista + detalhe de recrutas
    /operacoes            ← lista + detalhe de operações
    /pelotao              ← Painel de Pelotão (kanban)
    /briefings            ← registro de briefings
    /ordens               ← Minhas Ordens
    /squad-tasks          ← Tarefas internas do squad
    /quartel              ← Configurações (admin only)
  /api                    ← rotas só pra integrações futuras

/components
  /ui                     ← shadcn/ui base + custom
  /squad                  ← componentes específicos da brand
  /dashboard
  /operacao
  /briefing

/lib
  /db                     ← prisma client + helpers
  /auth                   ← config Auth.js
  /utils                  ← helpers gerais
  /domain                 ← regras de negócio puras (cálculo de saúde, gaps, etc.)

/prisma
  schema.prisma
  /migrations

/styles
  globals.css             ← Tailwind base + brand tokens
```

## Convenções de código (não negociáveis)

1. **TypeScript strict.** Zero `any`. Use `unknown` + type guards.
2. **Server Components por padrão.** `"use client"` só quando precisa interatividade.
3. **Server Actions para mutações.** Não crie API routes pra CRUD.
4. **Validação com Zod** em toda entrada de dados (forms e actions).
5. **Componentes pequenos.** Se passar de 150 linhas, divida.
6. **Nomes em inglês no código** (`recruit`, `operation`, `order`), nomes em português na UI (Recruta, Operação, Ordem).
7. **Comentários só quando o código não explica sozinho.** Não comente óbvio.
8. **Testes:** vale escrever testes pra regras de negócio (cálculo de saúde, gaps). UI sem teste no MVP é OK.

## Identidade visual

O sistema é **dark mode-first** com identidade militar/jungle. Detalhes completos em `SISTEMA_DESIGN.md`. Resumo:

**Paleta:**
- Background principal: `#1A1816` (Preto Combate)
- Card destaque: `#2F4A2C` (Verde Selva)
- CTA / acento: `#A85A3A` (Cobre Veterano)
- Bronze brilho (números): `#D78A5C`
- Verde patrulha (status OK): `#4A6B45`
- Cinza tático (neutro): `#3D3A35`
- Vermelho (baixa): `#C84A4A`

**Tipografia:**
- Displays: Oswald (fallback: Impact, Bebas Neue, Arial Narrow)
- Body: Inter (fallback: system-ui)
- Mono/números: JetBrains Mono

**Tokens Tailwind a criar em `tailwind.config.ts`:**
```ts
colors: {
  combat: '#1A1816',
  jungle: '#2F4A2C',
  copper: '#A85A3A',
  bronze: '#D78A5C',
  patrol: '#4A6B45',
  tactical: '#3D3A35',
  casualty: '#C84A4A',
  cream: '#E8E5D8',
  'cream-muted': '#C9C1AE',
}
```

## Linguagem do produto

Todo texto visível ao usuário usa o léxico militar definido em `MANUAL_VOZ_E_TOM.md`:

| Conceito | Termo na UI |
|---|---|
| Cliente | Recruta |
| Projeto/jornada | Operação |
| Tarefa | Ordem do dia (ou "ordem") |
| Reunião | Briefing |
| Time | Pelotão (interno) / Squad (todo o time) |
| Concluído | Cumprido / Missão cumprida |
| Em risco | Baixa iminente |
| Saudável | Em campo |
| Atenção | Atenção |
| Encerrado | Extração |

## Modelo de dados (essência)

```
USERS (admin/operator)
  └─ owns OPERATIONS
  └─ assigned to ORDERS

RECRUITS (clientes — ficha única)
  └─ has many OPERATIONS

PRODUCTS (Estruturação, Alavancagem, E3 Light)
  └─ has STAGE_TEMPLATES (template de etapas)

OPERATIONS (instância: um recruta + um produto)
  └─ has OPERATION_STAGES (snapshot do template)
       └─ has ORDERS (tarefas)
  └─ has BRIEFINGS (reuniões + NPS)
  └─ has GAPS (pontos de atenção)

ORDERS — também podem ser `squad_task` (sem operation_stage)
NOTIFICATIONS — por user
```

**Princípio importante:** ao criar operação, o sistema **copia** o template de etapas pra `operation_stages`. Alterar template no futuro não corrompe operações antigas.

## Regra de negócio crítica: cálculo de saúde

A cor de status da operação é calculada server-side a cada acesso:

```ts
function calculateHealth(op: Operation): HealthStatus {
  const hasOverdueOrder = op.orders.some(o => o.due_date < today && o.status !== 'cumprida');
  const slaExceeded = op.currentStage && daysInStage(op.currentStage) > op.currentStage.sla_days;

  if (op.status === 'pausada' || op.status === 'encerrada') return 'extração';
  if (hasOverdueOrder || slaExceeded) return 'baixa_iminente';

  const orderNearDue = op.orders.some(o => daysUntil(o.due_date) <= 2 && o.status !== 'cumprida');
  const slaNearLimit = op.currentStage && (op.currentStage.sla_days - daysInStage(op.currentStage)) <= 2;

  if (orderNearDue || slaNearLimit) return 'atenção';
  return 'em_campo';
}
```

## O que NÃO fazer

❌ **Não invente features.** Se está fora do escopo MVP (ver `01_ESBOCO_PROJETO_V2.md` seção 6), não implemente. Pergunte.

❌ **Não use light mode.** Não existe no MVP. Não escreva nada que assuma fundo branco.

❌ **Não use cores fora da paleta.** Toda cor sai do `tailwind.config.ts`.

❌ **Não traduza UI pro inglês.** UI é em português brasileiro com léxico militar.

❌ **Não pule a validação Zod.** Toda entrada do usuário precisa passar por schema.

❌ **Não crie modal sem necessidade.** Prefira página dedicada ou inline editing.

❌ **Não use Server Actions sem `revalidatePath` ou `revalidateTag`.** Cache invalidation é crítico.

❌ **Não commit dados de teste sensíveis.** Use seed scripts com dados fake.

## Como começar (primeira sprint)

### Sprint 1 — Fundação

**Sessão 1: Setup**
1. `npx create-next-app@latest crm-squad-five --typescript --tailwind --app`
2. Instalar: prisma, @auth/prisma-adapter, next-auth (v5), zod, lucide-react, class-variance-authority, clsx, tailwind-merge
3. Criar projeto no Supabase, copiar `DATABASE_URL`
4. Inicializar Prisma com schema base
5. Configurar `tailwind.config.ts` com a paleta acima
6. Configurar `globals.css` com fontes Oswald/Inter/JetBrains via @fontsource (jsdelivr) ou next/font

**Sessão 2: Schema completo**
1. Implementar schema Prisma completo (ver `01_ESBOCO_PROJETO_V2.md` seção 9)
2. Gerar migration: `prisma migrate dev --name init`
3. Criar seed script com: 2 usuários (1 admin + 1 operator), 3 produtos, templates de etapas
4. Rodar seed

**Sessão 3: Auth**
1. Configurar Auth.js v5 com Google provider
2. Restringir login a domínio @e3digital.com (ou domínio confirmado)
3. Middleware de auth nas rotas /(dashboard)
4. Tela de login estilizada (Tier 1 — pode ser básica nesta sprint, refina na sprint 8)

**Sessão 4: Layout base**
1. Topbar com logo S5 + breadcrumb + avatar
2. Layout `(dashboard)` com topbar fixo
3. Componente `<StatusPill>` (em campo / atenção / baixa / extração)
4. Componente `<KPICard>`
5. Tela vazia do Comando Central pra validar layout

**Marco da Sprint 1:** consegue logar e ver layout vazio com a brand aplicada.

## Como pedir ajuda ao usuário

Quando você (Claude Code) tiver dúvida que afeta decisão de produto:
- **NÃO assuma.** Pergunte ao usuário.
- Mostre as 2-3 opções com tradeoffs.
- Espere confirmação antes de implementar.

Exemplo de pergunta boa:
> "Pra ordenação da lista de recrutas, posso por (A) ordem alfabética, (B) últimos atualizados primeiro, ou (C) baixa iminente primeiro. Qual prefere? Eu votaria em C porque alinha com o princípio do produto (ver problemas primeiro)."

## Documentos de referência (mantenha abertos)

- `01_ESBOCO_PROJETO_V2.md` — escopo, requisitos, modelo de dados, regras
- `02_MANUAL_VOZ_E_TOM.md` — todas as copys e termos
- `03_SISTEMA_DESIGN.md` — paleta, tipografia, componentes, animações

Quando esses documentos estiverem desatualizados (porque o projeto evoluiu), avise o usuário pra atualizarmos juntos.

---

**Pronto pra mobilizar a operação.** 🛡️
