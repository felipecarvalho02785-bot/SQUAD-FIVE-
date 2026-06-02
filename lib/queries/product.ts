import { prisma } from "@/lib/db/prisma";

export async function listActiveProducts() {
  return prisma.product.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    include: {
      _count: { select: { stageTemplates: true, operations: true } },
    },
  });
}

export async function getProductWithTemplates(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      stageTemplates: { orderBy: { order: "asc" } },
    },
  });
}
