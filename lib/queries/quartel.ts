import { prisma } from "@/lib/db/prisma";

export async function listProductsForAdmin() {
  return prisma.product.findMany({
    orderBy: { name: "asc" },
    include: {
      stageTemplates: { orderBy: { order: "asc" } },
      _count: { select: { operations: true } },
    },
  });
}

export async function listMembers() {
  return prisma.user.findMany({
    orderBy: [{ role: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          ownedOperations: true,
          assignedOrders: true,
          createdBriefings: true,
        },
      },
    },
  });
}
