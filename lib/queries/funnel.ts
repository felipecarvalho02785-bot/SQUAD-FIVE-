import { prisma } from "@/lib/db/prisma";

/*
  Distribuição de operações ativas por etapa, agrupado por produto.
  Usado no funnel chart do Comando Central.
*/

export async function getProductFunnels() {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    include: {
      stageTemplates: { orderBy: { order: "asc" } },
      operations: {
        where: { status: "ATIVA" },
        include: {
          stages: {
            where: { status: "EM_ANDAMENTO" },
            select: { name: true, order: true },
          },
        },
      },
    },
  });

  return products.map((product) => {
    const stageCounts = product.stageTemplates.map((template) => {
      const count = product.operations.filter((op) =>
        op.stages.some((s) => s.order === template.order),
      ).length;
      return {
        name: template.name,
        order: template.order,
        count,
      };
    });

    // Inclui operações sem etapa em andamento (encerradas internamente)
    const noStage = product.operations.filter(
      (op) => op.stages.length === 0,
    ).length;
    if (noStage > 0) {
      stageCounts.push({
        name: "Sem etapa ativa",
        order: stageCounts.length + 1,
        count: noStage,
      });
    }

    return {
      id: product.id,
      name: product.name,
      archetype: product.archetype,
      total: product.operations.length,
      stages: stageCounts,
    };
  });
}
