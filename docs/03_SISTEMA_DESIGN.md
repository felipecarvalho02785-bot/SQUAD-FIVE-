# Sistema de Design — Squad Five

> Referência visual completa do CRM Squad Five.
> Versão: 0.1

---

## 1. Princípios

1. **Dark-first.** O sistema é dark mode por natureza. Light mode não existe no MVP.
2. **Funcional sobre decorativo.** Cada elemento visual ganha o direito de existir provando que ajuda o usuário a fazer alguma coisa mais rápido.
3. **Tipografia carrega 50% da identidade.** Antes de adicionar imagem, ornamento ou animação, veja se o problema se resolve com uma escolha tipográfica.
4. **Densidade alta, respiração tática.** O squad lida com 40-60 recrutas — precisa enxergar muita coisa numa tela só, mas sem virar planilha sufocante.

---

## 2. Paleta

### Cores primárias

| Hex | Nome | Uso |
|---|---|---|
| `#1A1816` | Preto Combate | Background principal de toda a aplicação |
| `#2F4A2C` | Verde Selva | Cards de KPI, painéis ativos, fills de status verde |
| `#A85A3A` | Cobre Veterano | CTAs, botões primários, ícones de identidade |

### Cores secundárias

| Hex | Nome | Uso |
|---|---|---|
| `#4A6B45` | Verde Patrulha | Bordas de verde-selva, avatares secundários, status "em campo" |
| `#D78A5C` | Bronze Brilho | Acentos, números de destaque, hover em CTAs |
| `#3D3A35` | Cinza Tático | Bordas neutras, divisores, backgrounds de painéis secundários |

### Cores de status

| Hex | Status |
|---|---|
| `#4A6B45` | Em campo (verde patrulha — não precisa cor nova) |
| `#D78A5C` | Atenção (bronze brilho — também já existe) |
| `#C84A4A` | Baixa iminente (vermelho tático, único caso de cor "nova") |
| `#3D3A35` | Extração (cinza tático) |

### Cores de texto sobre fundos

Regra: sempre escolher pelo contraste, nunca pelo "default".

| Sobre | Texto primário | Texto secundário |
|---|---|---|
| `#1A1816` (Preto Combate) | `#E8E5D8` (creme) | `#8A8378` (creme muted) |
| `#2F4A2C` (Verde Selva) | `#E8E5D8` (creme) | `#C9C1AE` (creme muted) |
| `#A85A3A` (Cobre Veterano) | `#1A1816` (preto) | `#2B1E10` (marrom muito escuro) |
| `#3D3A35` (Cinza Tático) | `#E8E5D8` (creme) | `#A89F8E` (creme muted) |

### Cores auxiliares (use com moderação)

| Hex | Uso |
|---|---|
| `#25221F` | Background de cards secundários (sutilmente mais claro que o preto combate) |
| `#2A2724` | Divisores internos de cards |
| `#5F5C55` | Texto desabilitado |
| `#6B665D` | Labels de uppercase pequenos |

---

## 3. Tipografia

### Famílias

| Família | Uso | Fallback |
|---|---|---|
| **Oswald** | Displays, números grandes, labels uppercase | Impact, "Bebas Neue", "Arial Narrow", sans-serif |
| **Inter** | Texto corrido, UI geral, formulários | system-ui, -apple-system, sans-serif |
| **JetBrains Mono** | Números (D-day, contadores), códigos, dados | "Roboto Mono", monospace |

### Escala tipográfica

| Token | Tamanho | Peso | Família | Uso |
|---|---|---|---|---|
| `display-xl` | 32-40px | 500 | Oswald | KPI gigante, números do dashboard |
| `display-lg` | 22-24px | 500 | Oswald | Títulos de tela (Operação Maternidade) |
| `display-md` | 18px | 500 | Oswald | SQUAD 5 wordmark, títulos de cards |
| `display-sm` | 16px | 500 | Oswald | Subtítulos |
| `body-lg` | 14px | 400 | Inter | Texto corrido principal |
| `body` | 13px | 400 | Inter | Texto de UI (lista, tabela) |
| `body-sm` | 12px | 400 | Inter | Detalhes, metadados |
| `caption` | 11px | 400 | Inter | Tooltips, hints |
| `label` | 10-11px | 400 | Oswald uppercase, letter-spacing 0.1em | Labels de seção, status |
| `mono` | 11-13px | 400-500 | JetBrains Mono | D-day, números, códigos |

### Regras tipográficas

- **Uppercase só com Oswald + letter-spacing ≥ 0.1em.** Em Inter, uppercase fica ilegível.
- **Nunca usar mais de 3 tamanhos numa mesma tela.** Hierarquia clara, sem ruído.
- **Cor do texto sempre vem da seção 2.** Nunca hardcode `#fff` ou `#000`.
- **Line height:** displays = 1, body = 1.5-1.7, labels = 1.

---

## 4. Espaçamento e grid

Escala (use sempre múltiplos):
- 2px, 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px

**Padding padrão de cards:** 16-20px
**Gap padrão entre cards:** 10-12px
**Padding interno de telas:** 20px

**Grid de telas largas:**
- 1 coluna: full-width
- 2 colunas: 1fr 1fr ou 1.25fr 1fr (dashboard layout)
- 3 colunas: repeat(3, 1fr) com gap 12px
- 4 colunas: repeat(4, 1fr) com gap 10px (kanban, KPIs)

**Container máximo:** 1280px (a maioria do squad usa monitor padrão; otimizar para 1366px+ funciona bem)

---

## 5. Componentes core

### 5.1 Card (raised)

```
background: #25221F (ou #2F4A2C para destaque)
border: 0.5px solid #3D3A35
border-radius: 8px
padding: 16px
```

Variações:
- **Default** — bg `#25221F`, borda `#3D3A35`
- **Highlight** — bg `#2F4A2C`, borda `#4A6B45`
- **Status border** — borda esquerda 3px na cor do status (#4A6B45, #D78A5C, #C84A4A)

### 5.2 KPI card

```
background: #2F4A2C
border: 0.5px solid #4A6B45
border-radius: 8px
padding: 14px 16px
```
- Número grande: Oswald 32px, cor `#D78A5C` (ou `#C84A4A` se KPI negativo tipo "baixas")
- Label embaixo: Oswald uppercase 11px, cor `#C9C1AE`, letter-spacing 0.1em

### 5.3 Botão primário (CTA)

```
background: #A85A3A
color: #1A1816
padding: 10px 24px
border-radius: 6px
font: Oswald 13px uppercase, letter-spacing 0.05em, weight 500
```
- Hover: bg muda para `#D78A5C`, transform translateY(-1px)
- Active: scale(0.98)
- Disabled: bg `#3D3A35`, color `#5F5C55`, cursor not-allowed

### 5.4 Botão secundário

```
background: transparent
color: #C9C1AE
border: 0.5px solid #3D3A35
padding: 10px 20px
border-radius: 6px
font: Inter 13px, weight 400
```
- Hover: bg `#25221F`, border `#4A6B45`

### 5.5 Status pill (badge)

```
padding: 4px 10px
border-radius: 4px
font: Oswald uppercase 10px, letter-spacing 0.1em, weight 500
```

Variantes:
- **Em campo** — bg `#2F4A2C`, color `#C9C1AE`, border `#4A6B45`
- **Atenção** — bg `#3D3A35`, color `#D78A5C`, border `#A85A3A`
- **Baixa iminente** — bg `#C84A4A`, color `#2B0F0F`
- **Extração** — bg `#3D3A35`, color `#8A8378`

### 5.6 Avatar (membro do squad)

```
width/height: 24px (compacto), 32px (padrão), 44px (grande)
border-radius: 50%
font: Inter 11px, weight 500, letter-spacing 0.05em
```

Cor de fundo por inicial (pseudo-aleatório consistente):
- Predominante: alternar entre `#4A6B45` e `#A85A3A`
- Para executores externos não-squad: `#3D3A35`

### 5.7 List item (ordem do dia, briefing, etc.)

```
padding: 10-12px 14px
border-bottom: 0.5px solid #2A2724
display: flex, align-items: center, gap: 12px
```

Estrutura: [ícone de status 18px circular] → [conteúdo flex-1] → [meta D-day]

### 5.8 Input de texto

```
background: #25221F
border: 0.5px solid #3D3A35
border-radius: 6px
padding: 10px 12px
font: Inter 13px
color: #E8E5D8
height: 36px (single line)
```
- Focus: border `#A85A3A`, ring 2px `rgba(168, 90, 58, 0.2)`
- Placeholder: color `#5F5C55`

### 5.9 Topbar

```
height: 52px
background: #1A1816
border-bottom: 0.5px solid #3D3A35
padding: 0 20px
display: flex, justify-content: space-between, align-items: center
```

Conteúdo: [logo S5 + breadcrumb à esquerda] | [avatar + sino à direita]

### 5.10 Status indicator (bolinha colorida)

Tamanhos: 6px (mini), 18px (médio), 32-38px (timeline de jornada)

```
border-radius: 50%
display: flex, align-items: center, justify-content: center
```

Sempre acompanhado de ícone interno quando ≥18px:
- Em campo: bg `#4A6B45`, ícone `ti-check`
- Atenção: bg `#D78A5C`, ícone `ti-clock`
- Baixa iminente: bg `#C84A4A`, ícone `ti-exclamation-mark`

---

## 6. Iconografia

**Biblioteca:** Tabler Icons (outline). Carregado uma vez como webfont.

**Tamanhos:**
- Ícone inline com texto: 14-16px
- Ícone em botão: 16px
- Ícone em status indicator (18px): 12px
- Ícone decorativo: 20-24px máximo

**Ícones principais do sistema:**

| Função | Ícone |
|---|---|
| Squad 5 (logo placeholder) | ti-shield |
| Recruta / novo recruta | ti-user-plus |
| Operação | ti-target |
| Briefing | ti-calendar |
| Ordem cumprida | ti-check |
| Em andamento | ti-clock |
| Baixa iminente | ti-exclamation-mark |
| Avançar etapa | ti-arrow-right |
| Notificação | ti-bell |
| Configurações | ti-settings |
| Filtrar | ti-filter |
| Buscar | ti-search |
| Adicionar | ti-plus |
| Mais opções | ti-dots |
| Pelotão / membros | ti-users |
| Salvar | ti-device-floppy |

---

## 7. Animações e movimento

### Regras gerais
- **Sempre dentro de `@media (prefers-reduced-motion: no-preference)`**
- **CSS keyframes** preferido sobre JS animation libraries
- **Duração:** 200ms (micro), 400ms (médio), 1000ms+ (ambient)
- **Easing:** `ease-out` para entrada, `ease-in-out` para loops, `ease-in` para saída

### Tier 3 — Background (sempre presente)
- Camuflagem digital no fundo: SVG pattern com 3-5% opacidade
- Bolinha de status "Sistema operacional" no topbar: `pulse 2s ease-in-out infinite`
- Brasão no header: estático

### Tier 2 — Ambiente (várias vezes por sessão)
- Hover em cards: borda esquerda animada (200ms width transition)
- Hover em CTAs: bg muda + translateY(-1px), 200ms
- Status indicator (atenção/baixa): pulso sutil em vermelho `pulse 1.5s` quando crítico
- Loading dots/spinner: rotação 1s linear infinite, cor `#A85A3A`

### Tier 1 — Imersivo (raro, alto impacto)
- **Tela de Login:** folhas balançando (sway 7-9s ease-in-out infinite), partículas drifting (drift 12s linear infinite), brasão pulsando (pulse 4s)
- **Comemoração de etapa cumprida:** confetti militar (folhas + faíscas cobre), 1.5s, único disparo
- **404:** gorila estático com animação sutil de respiração
- **Recruta novo registrado:** bandeira sendo plantada, 800ms

### Performance
- Limite: máximo 2 animações simultâneas em tela
- Use `transform` e `opacity` apenas (GPU-friendly)
- Pause animações de Tier 1 quando tela perde foco

---

## 8. Acessibilidade

Mesmo dark, o sistema precisa atender padrões básicos:

- **Contraste mínimo:** 4.5:1 entre texto e fundo (testar cada combinação da seção 2)
- **Tamanho de texto mínimo:** 11px (caption); abaixo disso só ícones
- **Focus visível:** anel de 2px `rgba(168, 90, 58, 0.4)` em todos os elementos focáveis
- **Reduced motion:** desligar todas as animações de Tier 1 e Tier 2 quando `prefers-reduced-motion: reduce`
- **Aria-labels:** ícones sem texto sempre têm `aria-label` ou `aria-hidden="true"`

---

## 9. Padrões de tela (templates)

### Tela tipo lista (recrutas, operações)
```
[Topbar 52px]
[Header com título + ações | filtros] 60-80px
[Lista de cards verticais] flex-1
```

### Tela tipo detalhe (operação, recruta)
```
[Topbar com breadcrumb] 52px
[Hero card: identidade + KPIs] 120-160px
[Conteúdo principal: 1 ou 2 colunas] flex-1
[Ações finais] 60px
```

### Tela tipo formulário (novo recruta, registrar briefing)
```
[Topbar] 52px
[Header: título + contexto] 80px
[Form fields agrupados em sections] flex-1
[CTA fixo no rodapé] 60px
```

### Tela tipo dashboard (Comando Central)
```
[Topbar] 52px
[Row de KPIs (4 cards horizontais)] 100px
[Grid 2 colunas: principais painéis] flex-1
```

---

## 10. Don'ts (o que nunca fazer)

❌ Gradientes (mesh, linear, radial) — quebra a estética flat
❌ Shadows decorativos — só shadow de focus ring
❌ Border-radius > 12px exceto em pílulas intencionais
❌ Mais de 3 cores de status numa tela só
❌ Animação atrás de conteúdo de leitura (texto principal, dados em tabela)
❌ Hex hardcoded fora desta paleta
❌ Ícones filled (sempre outline da Tabler)
❌ Tipografia serif (exceto se vier ordem específica do líder do squad)
❌ Light mode (não existe no MVP)
❌ Decoração jungle em todo lugar (segue a regra dos 3 tiers)
