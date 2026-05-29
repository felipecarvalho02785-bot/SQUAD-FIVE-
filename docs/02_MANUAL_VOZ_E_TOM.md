# Manual de Voz e Tom — CRM Squad Five

> Léxico oficial e diretrizes de copy para todas as superfícies do sistema (UI, emails, notificações, mensagens de erro).
> Versão: 0.1

---

## Princípio fundamental

**Militar com confiança, não com palhaçada.**

A identidade tática é a personalidade do squad — mas o sistema tem que ser usável por gente trabalhando sob pressão. A regra é: **o termo militar entra quando agrega cor sem atrapalhar entendimento**. Se um novato leria a interface e ficaria confuso por mais de 3 segundos, a palavra está errada.

Pense em quem está usando: gestor de projeto resolvendo problema real de cliente, não jogador de Call of Duty.

---

## Léxico oficial

### Substantivos centrais

| Use | Não use |
|---|---|
| Recruta | Cliente, lead, customer |
| Operação | Projeto, deal, conta |
| Briefing | Reunião, meeting, call |
| Ordem do dia (ou só "ordem") | Tarefa, task, to-do |
| Pelotão | Time, equipe interna |
| Squad | Time, equipe geral |
| Comando Central | Dashboard, home, painel principal |
| Painel de Pelotão | Kanban, board |
| Quartel General | Configurações, settings |
| Gap | (mantém como gap mesmo, virou jargão do squad) |

### Verbos de ação

| Use | Não use |
|---|---|
| Recrutar | Cadastrar cliente |
| Mobilizar | Iniciar projeto |
| Cumprir (ordem/missão) | Concluir tarefa |
| Avançar (etapa) | Mover, próximo passo |
| Marcar baixa | Pausar/encerrar com problema |
| Extrair | Encerrar/arquivar |
| Reforçar | Pedir ajuda, escalar |

### Status e estados

| Status | Significado | Cor |
|---|---|---|
| Em campo | Operação saudável, fluindo | Verde Patrulha |
| Atenção | Sinal amarelo, requer monitoramento | Cobre Veterano |
| Baixa iminente | Atraso ou risco real, ação necessária | Vermelho |
| Extração | Operação pausada ou encerrada | Cinza Tático |
| Cumprida | Ordem/etapa concluída | Verde Patrulha |
| Em andamento | Atualmente sendo executada | Bronze Brilho |
| A fazer | Ainda não iniciada | Cinza |

---

## Copy de telas-chave

### Tela de acesso (login)
- Headline: **"Pronto pra operação?"**
- Botão: **"Entrar com e-mail da E3"**
- Rodapé: **"Sistema operacional · Squad 5"**

### Comando Central (dashboard)
- Saudação contextual:
  - Manhã: "Bom dia, [nome]. Aqui está o briefing do dia."
  - Tarde: "Boa tarde, [nome]. Operações em andamento:"
  - Noite: "Boa noite, [nome]. Status final do dia:"

### Lista de recrutas (vazio)
**"Nenhum recruta no radar. Bora alistar o primeiro?"**
+ botão "Recrutar novo"

### Detalhe da operação (sem briefings)
**"Nenhum briefing registrado nesta operação. O primeiro contato vale ouro."**

### Painel de Pelotão (vazio em uma coluna)
**"Setor calmo. Nenhuma operação nesta etapa."**

### Tela 404
**"Esse setor não consta no mapa."**
+ subtítulo "A página que você procurou não existe ou foi extraída."
+ botão "Voltar ao Comando Central"

### Tela 500 (erro de servidor)
**"Comunicação interrompida com o quartel."**
+ subtítulo "Tente novamente em alguns instantes. Se persistir, acione o suporte."

---

## Mensagens de sistema

### Sucesso
- ✅ "Missão cumprida." (genérico)
- ✅ "Recruta alistado com sucesso." (cadastro)
- ✅ "Operação mobilizada." (criou operação)
- ✅ "Briefing registrado." (salvou briefing)
- ✅ "Ordem cumprida." (concluiu tarefa)
- ✅ "Etapa avançada." (mudou de etapa)

### Erro (genéricos)
- ❌ "Falha na operação. Tente novamente."
- ❌ "Não conseguimos completar essa missão. Confira os dados e tente de novo."
- ❌ "Comunicação interrompida. Verifique sua conexão."

### Confirmações destrutivas
- ⚠️ "Confirmar baixa do recruta? Essa ação encerra todas as operações dele."
- ⚠️ "Marcar etapa como cumprida? A próxima etapa começará agora."
- ⚠️ "Cancelar operação? Isso vai para o status 'extração'."

### Carregamento (loading states)
- "Reunindo o pelotão..."
- "Carregando o terreno..."
- "Preparando o briefing..."
- "Acessando o quartel..."

---

## Notificações (central de alertas)

### Quando uma ordem é atribuída a você
**"Nova ordem do dia: [título]"**
"Atribuída por [autor] · D-day em [X] dias"

### Quando uma ordem está vencendo (D-1)
**"Ordem vence amanhã: [título]"**
"Operação [nome] · ação necessária"

### Quando uma ordem vence (D-day)
**"Ordem vence hoje: [título]"**
"Operação [nome] · execute antes do fim do dia"

### Quando uma ordem está atrasada (D+1)
**"⚠ Ordem atrasada: [título]"**
"Operação [nome] · D+[X] · acione reforço se necessário"

### Quando uma operação entra em baixa iminente
**"🔴 Baixa iminente: Operação [nome]"**
"Saúde mudou para vermelho. Confira os gaps em aberto."

### Quando um briefing está se aproximando
**"Briefing em 15 minutos: Operação [nome]"**
"Presença: [lista de participantes]"

### Quando um gap automático é criado
**"Novo gap detectado: [descrição]"**
"Operação [nome] · sistema identificou automaticamente"

---

## Copy de formulários

### Labels (sempre sentence case)
- "Nome do recruta" (não "Customer name")
- "Email de contato" (não "Contact email address")
- "Orçamento de campanha (R$)" (sempre indicar moeda)
- "Acessos do recruta" (não "Credentials")
- "Teses do recruta" (não "Hypotheses")
- "Responsável pela operação" (não "Owner")
- "D-day da ordem" (não "Due date")

### Placeholders
- Nome do recruta: "Ex: Maternidade Vida & Sorriso"
- Email: "contato@empresa.com.br"
- Teses: "Quais hipóteses esse recruta vai validar..."

### Botões primários
- "Recrutar" (criar recruta)
- "Mobilizar operação" (criar operação)
- "Salvar briefing" (no registro de reunião)
- "Cumprir ordem" (marcar tarefa como feita)
- "Avançar etapa" (próxima fase)

### Botões secundários
- "Cancelar"
- "Voltar"
- "Salvar rascunho"

---

## O que NÃO fazer

❌ **Não use termos violentos em ações com cliente.** "Eliminar cliente", "destruir", "atacar" — fica brincadeira de mau gosto. Use "extrair", "pausar", "encerrar".

❌ **Não militarize tudo aleatoriamente.** "Configurações" não precisa virar "Centro de Comando da Estratégia Tática Militar". "Quartel General" já é suficiente.

❌ **Não use jargão militar real técnico** (foxtrot, alfa-tango, código bravo). Soa cosplay. Vocabulário militar genérico (operação, briefing, baixa) é suficiente.

❌ **Não combine emoji com tom sério.** Notificação de baixa iminente não leva 🎯 nem 🚀. Pode usar 🔴 ⚠️ ✅ pra status, mais nada.

❌ **Não force humor em momento ruim.** Se um cliente está pra ser perdido, copy não pode brincar. Tom muda pra urgente e direto.

❌ **Não traduza ao pé da letra termos de SaaS gringo.** "Onboard your customer" não vira "Embarcar seu cliente". Vira "Alistar novo recruta" ou simplesmente "Cadastrar recruta novo".

---

## Tom por contexto

| Contexto | Tom | Exemplo |
|---|---|---|
| Boas-vindas, navegação | Confiante, energético | "Pronto pra operação?" |
| Sucesso de ação | Curto, satisfatório | "Missão cumprida." |
| Erro do usuário | Direto, neutro | "Confira os dados e tente de novo." |
| Erro do sistema | Honesto, sem culpar usuário | "Comunicação interrompida com o quartel." |
| Baixa iminente | Urgente, sem dramatizar | "🔴 Baixa iminente: Operação X" |
| Estado vazio | Convite à ação | "Bora alistar o primeiro recruta?" |
| Confirmação destrutiva | Sóbrio, claro nas consequências | "Isso encerra todas as operações." |

---

## Manutenção deste documento

Toda nova tela ou feature que precisa de copy passa por este documento antes:
1. Verificar se já tem termo no léxico
2. Se não tem, propor termo novo seguindo o princípio fundamental
3. Adicionar ao documento
4. Aplicar no código
