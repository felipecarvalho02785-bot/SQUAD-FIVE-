import { Prisma, RecruitStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import type { RecruitFilter } from "@/lib/schemas/recruit";

/*
  Queries de leitura de Recrutas.
  Sempre executadas server-side (Server Components ou Server Actions).
*/

export type RecruitListItem = Awaited<ReturnType<typeof listRecruits>>[number];

export async function listRecruits(filter: RecruitFilter = { status: "all" }) {
  const where: Prisma.RecruitWhereInput = {};

  if (filter.q && filter.q.trim()) {
    where.OR = [
      { name: { contains: filter.q, mode: "insensitive" } },
      { contactName: { contains: filter.q, mode: "insensitive" } },
      { contactEmail: { contains: filter.q, mode: "insensitive" } },
      { segment: { contains: filter.q, mode: "insensitive" } },
    ];
  }

  if (filter.status && filter.status !== "all") {
    where.status = filter.status;
  }

  return prisma.recruit.findMany({
    where,
    orderBy: [{ createdAt: "desc" }],
    select: {
      id: true,
      name: true,
      contactName: true,
      contactEmail: true,
      contactPhone: true,
      segment: true,
      campaignBudget: true,
      status: true,
      createdAt: true,
      _count: { select: { operations: true } },
    },
  });
}

export async function getRecruitById(id: string) {
  return prisma.recruit.findUnique({
    where: { id },
    include: {
      operations: {
        orderBy: { startedAt: "desc" },
        include: {
          product: { select: { id: true, name: true, archetype: true } },
        },
      },
    },
  });
}

export async function countRecruitsByStatus() {
  const grouped = await prisma.recruit.groupBy({
    by: ["status"],
    _count: { _all: true },
  });

  const map: Record<RecruitStatus, number> = {
    ATIVO: 0,
    PAUSADO: 0,
    BAIXA: 0,
  };
  for (const row of grouped) {
    map[row.status] = row._count._all;
  }
  return {
    ...map,
    total: map.ATIVO + map.PAUSADO + map.BAIXA,
  };
}
