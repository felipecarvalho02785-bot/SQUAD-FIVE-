/*
  Seed do CRM Squad Five.
  Roda com: npm run db:seed (apos `npm run db:migrate`).

  Cria:
   - 2 usuarios placeholder (1 admin, 1 operator)
   - 3 produtos (Estruturacao, Alavancagem, E3 Light)
   - Templates de etapas iniciais (placeholders ate o material oficial chegar)

  IMPORTANTE: usuarios reais sao criados automaticamente pelo Auth.js no primeiro
  login Google. Estes seed users servem para popular dados de teste e
  garantir que pelo menos uma conta admin existe antes do primeiro acesso real.
  Ajuste os emails antes de rodar.
*/

import { PrismaClient, ProductArchetype, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Reunindo o pelotão...");

  // ---- Usuarios placeholder --------------------------------------------------
  const admin = await prisma.user.upsert({
    where: { email: "admin@e3digital.com" },
    update: {},
    create: {
      name: "Comandante Admin",
      email: "admin@e3digital.com",
      role: UserRole.ADMIN,
    },
  });

  const operator = await prisma.user.upsert({
    where: { email: "operador@e3digital.com" },
    update: {},
    create: {
      name: "Operador Tático",
      email: "operador@e3digital.com",
      role: UserRole.OPERATOR,
    },
  });

  console.log(`Usuários: ${admin.email}, ${operator.email}`);

  // ---- Produtos + templates de etapas ---------------------------------------
  // Referencia: docs/01_ESBOCO_PROJETO_V2.md secao 7
  //
  // Os SLA_days sao placeholders — ajustar quando o material de onboarding
  // oficial da E3 estiver disponivel.

  const estruturacao = await prisma.product.upsert({
    where: { id: "seed-product-estruturacao" },
    update: {},
    create: {
      id: "seed-product-estruturacao",
      name: "Estruturação",
      archetype: ProductArchetype.PROJECT,
      typicalDurationDays: 45,
      stageTemplates: {
        create: [
          { name: "Onboarding", order: 1, slaDays: 6 },
          { name: "Diagnóstico", order: 2, slaDays: 6 },
          { name: "Estruturação", order: 3, slaDays: 17 },
          { name: "Implementação", order: 4, slaDays: 12 },
          { name: "Acompanhamento", order: 5, slaDays: 5 },
        ],
      },
    },
  });

  const alavancagem = await prisma.product.upsert({
    where: { id: "seed-product-alavancagem" },
    update: {},
    create: {
      id: "seed-product-alavancagem",
      name: "Alavancagem",
      archetype: ProductArchetype.RETAINER,
      typicalDurationDays: null,
      stageTemplates: {
        create: [{ name: "Onboarding inicial", order: 1, slaDays: 7 }],
      },
    },
  });

  const e3light = await prisma.product.upsert({
    where: { id: "seed-product-e3light" },
    update: {},
    create: {
      id: "seed-product-e3light",
      name: "E3 Light",
      archetype: ProductArchetype.RETAINER,
      typicalDurationDays: null,
      stageTemplates: {
        create: [{ name: "Onboarding express", order: 1, slaDays: 3 }],
      },
    },
  });

  console.log(`Produtos: ${estruturacao.name}, ${alavancagem.name}, ${e3light.name}`);
  console.log("Missão cumprida.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error("Falha na operação:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
